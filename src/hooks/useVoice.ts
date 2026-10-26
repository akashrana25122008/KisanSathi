import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * ---------------------------------------------------------------------------
 * Browser-native voice input / output for Kisan AI
 * ---------------------------------------------------------------------------
 * Uses the Web Speech API that ships with the browser:
 *  - `SpeechRecognition` / `webkitSpeechRecognition` for dictation,
 *  - `speechSynthesis` for reading replies aloud.
 *
 * Both APIs are looked up **when they are used**, never when this module is
 * loaded, so the app reports honestly what the current browser can do.
 *
 * No audio is sent anywhere by this application. There is no backend: the
 * browser talks to its own vendor speech service (in Chromium based browsers
 * recognition is performed by the browser maker's service, and synthesis may
 * use locally installed voices). KisanSathi never receives the audio.
 */

/* ---------------------------------------------------------------------------
   Minimal typings for the vendor SpeechRecognition API
   --------------------------------------------------------------------------- */

interface SpeechRecognitionAlternativeLike {
  readonly transcript: string
  readonly confidence: number
}

interface SpeechRecognitionResultLike {
  readonly length: number
  readonly isFinal: boolean
  readonly [index: number]: SpeechRecognitionAlternativeLike
}

interface SpeechRecognitionEventLike {
  readonly resultIndex: number
  readonly results: {
    readonly length: number
    readonly [index: number]: SpeechRecognitionResultLike
  }
}

interface SpeechRecognitionErrorLike {
  readonly error: string
  readonly message?: string
}

export interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

/* ---------------------------------------------------------------------------
   Public types
   --------------------------------------------------------------------------- */

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error'

export type VoiceErrorCode =
  | 'permission-denied'
  | 'no-speech'
  | 'audio-capture'
  | 'network'
  | 'language-not-supported'
  | 'not-supported'
  | 'synthesis-not-supported'
  | 'start-failed'
  | 'unknown'

export interface VoiceError {
  code: VoiceErrorCode
  /** The raw browser error string, kept for debugging only. */
  detail?: string
}

export interface UseVoiceOptions {
  language: 'en' | 'hi'
  /** Called with the recognised text. `isFinal` is true for the last result. */
  onTranscript: (text: string, isFinal: boolean) => void
}

export interface UseVoiceResult {
  status: VoiceStatus
  error: VoiceError | null
  /** True when the browser exposes a speech recognition API. */
  recognitionSupported: boolean
  /** True when the browser exposes a speech synthesis API. */
  synthesisSupported: boolean
  startListening: () => void
  stopListening: () => void
  /** Reads the text aloud. The language defaults to the active app language. */
  speak: (text: string, language?: 'en' | 'hi') => void
  stopSpeaking: () => void
  /** Stops everything - used when the page unmounts or the chat is cleared. */
  cancelAll: () => void
  /** Clears the current error, e.g. when the farmer edits the text instead. */
  clearError: () => void
}

function getRecognitionConstructor(): SpeechRecognitionConstructor | undefined {
  if (typeof window === 'undefined') return undefined
  return window.SpeechRecognition ?? window.webkitSpeechRecognition
}

function hasSynthesis(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && !!window.speechSynthesis
}

function mapRecognitionError(raw: string): VoiceErrorCode {
  switch (raw) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'permission-denied'
    case 'no-speech':
      return 'no-speech'
    case 'audio-capture':
      return 'audio-capture'
    case 'network':
      return 'network'
    case 'language-not-supported':
      return 'language-not-supported'
    case 'aborted':
      return 'unknown'
    default:
      return 'unknown'
  }
}

/** The hook that owns the browser voice APIs for the Kisan AI chat. */
export function useVoice({ language, onTranscript }: UseVoiceOptions): UseVoiceResult {
  const [status, setStatus] = useState<VoiceStatus>('idle')
  const [error, setError] = useState<VoiceError | null>(null)
  const [recognitionSupported, setRecognitionSupported] = useState(false)
  const [synthesisSupported, setSynthesisSupported] = useState(false)

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const cancelRequestedRef = useRef(false)
  const onTranscriptRef = useRef(onTranscript)
  const languageRef = useRef(language)

  /* Keep the callbacks fresh without re-creating the browser objects. */
  useEffect(() => {
    onTranscriptRef.current = onTranscript
    languageRef.current = language
  })

  /* Report what the browser can do. This runs on mount and again whenever the
     farmer focuses the composer, so a browser that loads the API late is
     still detected. */
  useEffect(() => {
    const refresh = () => {
      setRecognitionSupported(Boolean(getRecognitionConstructor()))
      setSynthesisSupported(hasSynthesis())
    }
    refresh()
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [])

  /* Never leave the microphone or the speaker running when the page goes. */
  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current
      if (recognition) {
        try {
          recognition.abort()
        } catch {
          /* the browser may already have released it */
        }
      }
      recognitionRef.current = null
      if (hasSynthesis()) {
        try {
          window.speechSynthesis.cancel()
        } catch {
          /* ignore */
        }
      }
    }
  }, [])

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition) return
    try {
      recognition.stop()
    } catch {
      /* ignore */
    }
    setStatus('idle')
  }, [])

  const startListening = useCallback(() => {
    setError(null)

    const Recognition = getRecognitionConstructor()
    if (!Recognition) {
      setRecognitionSupported(false)
      setStatus('error')
      setError({ code: 'not-supported' })
      return
    }
    setRecognitionSupported(true)

    // Only one recognition session at a time.
    const existing = recognitionRef.current
    if (existing) {
      try {
        existing.abort()
      } catch {
        /* ignore */
      }
    }

    let recognition: SpeechRecognitionLike
    try {
      recognition = new Recognition()
    } catch {
      setStatus('error')
      setError({ code: 'start-failed' })
      return
    }

    recognition.lang = languageRef.current === 'hi' ? 'hi-IN' : 'en-IN'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setStatus('listening')
      setError(null)
    }

    recognition.onresult = (event) => {
      let transcript = ''
      let isFinal = false
      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i]
        const alternative = result[0]
        if (alternative) transcript += alternative.transcript
        if (result.isFinal) isFinal = true
      }
      if (transcript.trim().length === 0) return
      setStatus(isFinal ? 'processing' : 'listening')
      onTranscriptRef.current(transcript.trim(), isFinal)
    }

    recognition.onerror = (event) => {
      const code = mapRecognitionError(event.error)
      if (code === 'unknown' && event.error === 'aborted') {
        setStatus('idle')
        return
      }
      setStatus('error')
      setError({ code, detail: event.error })
    }

    recognition.onend = () => {
      recognitionRef.current = null
      setStatus((current) => (current === 'error' ? current : 'idle'))
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch {
      recognitionRef.current = null
      setStatus('error')
      setError({ code: 'start-failed' })
    }
  }, [])

  const stopSpeaking = useCallback(() => {
    if (!hasSynthesis()) {
      setStatus('idle')
      return
    }
    cancelRequestedRef.current = true
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* ignore */
    }
    setStatus('idle')
  }, [])

  const speak = useCallback((text: string, language?: 'en' | 'hi') => {
    const clean = text.trim()
    if (!clean) return

    if (!hasSynthesis()) {
      setSynthesisSupported(false)
      setStatus('error')
      setError({ code: 'synthesis-not-supported' })
      return
    }
    setSynthesisSupported(true)

    cancelRequestedRef.current = false
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* ignore */
    }

    const voiceLanguage = language ?? languageRef.current
    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.lang = voiceLanguage === 'hi' ? 'hi-IN' : 'en-IN'
    utterance.rate = 0.95
    utterance.pitch = 1

    utterance.onstart = () => {
      setStatus('speaking')
      setError(null)
    }
    utterance.onend = () => {
      setStatus((current) => (current === 'speaking' ? 'idle' : current))
    }
    utterance.onerror = () => {
      if (cancelRequestedRef.current) {
        setStatus('idle')
        return
      }
      setStatus('error')
      setError({ code: 'unknown' })
    }

    try {
      window.speechSynthesis.speak(utterance)
    } catch {
      setStatus('error')
      setError({ code: 'unknown' })
    }
  }, [])

  const cancelAll = useCallback(() => {
    const recognition = recognitionRef.current
    if (recognition) {
      try {
        recognition.abort()
      } catch {
        /* ignore */
      }
      recognitionRef.current = null
    }
    if (hasSynthesis()) {
      cancelRequestedRef.current = true
      try {
        window.speechSynthesis.cancel()
      } catch {
        /* ignore */
      }
    }
    setStatus('idle')
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return {
    status,
    error,
    recognitionSupported,
    synthesisSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    cancelAll,
    clearError,
  }
}
