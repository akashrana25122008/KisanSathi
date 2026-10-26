import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Camera,
  ChevronDown,
  Maximize2,
  MessageSquare,
  Minimize2,
  RotateCcw,
  Sparkles,
  Undo2,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { AiStatus } from '@/components/ai/AiStatus'
import { ChatBubble } from '@/components/ai/ChatBubble'
import { ChatComposer } from '@/components/ai/ChatComposer'
import { CropPhotoCheck, type PhotoCheckResult } from '@/components/ai/CropPhotoCheck'
import { TypingIndicator } from '@/components/ai/TypingIndicator'
import { VoiceControls } from '@/components/ai/VoiceControls'
import { useWorkspaceChrome } from '@/components/layout/WorkspaceChromeContext'
import { JobPostModal, type FormState } from '@/components/jobs/JobPostModal'
import { useVoice } from '@/hooks/useVoice'
import { cn } from '@/lib/cn'
import {
  AI_SUGGESTIONS,
  applyReplyLanguage,
  askQuestionAsync,
  draftToPrefill,
  getRemoteProvider,
  resolveReplyLanguage,
  setRemoteProvider,
  type ChatMessage,
  type DraftField,
  type RemoteProvider,
} from '@/lib/aiEngine'
import {
  createDiagnosticSession,
  currentDiagnosticStage,
  quickRepliesForStage,
  reopenLastAnswer,
  type DiagnosticSession,
} from '@/lib/diagnostics'
import { askRemoteAi, fetchAiStatus, type AiStatusResult } from '@/lib/api'
import { pick, useT } from '@/lib/i18n'
import { useApp } from '@/store/AppContext'
import { useAuth } from '@/store/AuthContext'

const LOCAL_PROCESSING_MS = 480
const MAX_STORED_MESSAGES = 24

let messageSeq = 0
function makeMessageId(prefix: string): string {
  messageSeq += 1
  return `${prefix}-${Date.now()}-${messageSeq}`
}

interface StoredAiSession {
  messages?: ChatMessage[]
  diagnostic?: DiagnosticSession
}

function restoreMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return []
  return value
    .filter(
      (item): item is ChatMessage =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as ChatMessage).id === 'string' &&
        typeof (item as ChatMessage).text === 'string' &&
        ((item as ChatMessage).role === 'user' || (item as ChatMessage).role === 'assistant') &&
        typeof (item as ChatMessage).timestamp === 'number',
    )
    .slice(-MAX_STORED_MESSAGES)
    .map((message) => ({
      ...message,
      photoPreview: undefined,
    }))
}

function restoreDiagnostic(value: unknown): DiagnosticSession {
  if (
    value &&
    typeof value === 'object' &&
    typeof (value as DiagnosticSession).id === 'string' &&
    Array.isArray((value as DiagnosticSession).answers)
  ) {
    return value as DiagnosticSession
  }
  return createDiagnosticSession()
}

function readStoredSession(storageKey: string | null): StoredAiSession | null {
  if (!storageKey) return null
  try {
    const raw = window.sessionStorage.getItem(storageKey)
    return raw ? (JSON.parse(raw) as StoredAiSession) : null
  } catch {
    return null
  }
}

export function AiPage() {
  const { state } = useApp()
  const { user } = useAuth()
  const t = useT()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const { fullscreen, setFullscreen } = useWorkspaceChrome()

  const language = state.language
  const mode = searchParams.get('mode') === 'photo' ? 'photo' : 'chat'
  const storageKey = user ? `kisansathi:ai:${user.id}` : null

  const [initialSession] = useState<StoredAiSession | null>(() => readStoredSession(storageKey))
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    restoreMessages(initialSession?.messages),
  )
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [postOpen, setPostOpen] = useState(false)
  const [prefill, setPrefill] = useState<Partial<FormState> | undefined>(undefined)
  const [speakReplies, setSpeakReplies] = useState(false)
  const [aiStatus, setAiStatus] = useState<AiStatusResult | null>(null)

  const processingTimer = useRef<number | null>(null)
  const copyTimer = useRef<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const quickPromptsRef = useRef<HTMLDetailsElement>(null)
  const messagesRef = useRef<ChatMessage[]>([])

  const [diagnostic, setDiagnostic] = useState<DiagnosticSession>(() =>
    restoreDiagnostic(initialSession?.diagnostic),
  )

  const micPrefixRef = useRef('')

  const setMode = useCallback(
    (next: 'chat' | 'photo') => {
      const params = new URLSearchParams(searchParams)
      if (next === 'photo') params.set('mode', 'photo')
      else params.delete('mode')
      setSearchParams(params, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    let active = true
    void fetchAiStatus()
      .then((result) => {
        if (active) setAiStatus(result)
      })
      .catch(() => {
        if (active) setAiStatus(null)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!storageKey) return
    try {
      const safeMessages = messages
        .slice(-MAX_STORED_MESSAGES)
        .map((message) => ({ ...message, photoPreview: undefined }))
      const payload: StoredAiSession = { messages: safeMessages, diagnostic }
      window.sessionStorage.setItem(storageKey, JSON.stringify(payload))
    } catch {
      /* Session storage can be full or disabled; the chat still works in memory. */
    }
  }, [messages, diagnostic, storageKey])

  const handleTranscript = useCallback((text: string) => {
    const prefix = micPrefixRef.current
    setInput(prefix ? `${prefix} ${text}` : text)
  }, [])

  const {
    status: voiceStatus,
    error: voiceError,
    recognitionSupported,
    synthesisSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    cancelAll,
  } = useVoice({ language: state.language, onTranscript: handleTranscript })

  const toggleMic = useCallback(() => {
    if (voiceStatus === 'listening' || voiceStatus === 'processing') {
      stopListening()
      return
    }
    micPrefixRef.current = input.trim()
    startListening()
  }, [voiceStatus, stopListening, startListening, input])

  const toggleSpeakReplies = useCallback(() => {
    setSpeakReplies((current) => {
      const next = !current
      if (!next) stopSpeaking()
      return next
    })
  }, [stopSpeaking])

  useEffect(() => {
    const element = scrollRef.current
    if (!element) return
    element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' })
  }, [messages.length, busy, mode, fullscreen])

  // Never leave the shell in full screen after the AI page has unmounted.
  useEffect(() => {
    return () => setFullscreen(false)
  }, [setFullscreen])

  useEffect(() => {
    if (!fullscreen) return

    const onKeyDown = (event: KeyboardEvent) => {
      // The job form owns Escape while it is open.
      if (event.key !== 'Escape' || postOpen) return
      setFullscreen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [fullscreen, postOpen, setFullscreen])

  useEffect(() => {
    return () => {
      if (processingTimer.current) window.clearTimeout(processingTimer.current)
      if (copyTimer.current) window.clearTimeout(copyTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.__kisansathiAi = {
      setRemoteProvider,
      ask: (question: string) => askQuestionAsync(question),
    }
    return () => {
      delete window.__kisansathiAi
    }
  }, [])

  useEffect(() => {
    if (!aiStatus?.chatConfigured) return
    const provider: RemoteProvider = {
      id: 'groq',
      ask: async (question, context) => {
        if (context.local.kind !== 'unknown') return null
        const history = messagesRef.current
          .filter((message) => message.role === 'user' || message.role === 'assistant')
          .slice(-8)
          .map((message) => ({ role: message.role, text: message.text }))
        const last = history[history.length - 1]
        if (last?.role === 'user' && last.text.trim() === question.trim()) history.pop()
        try {
          const response = await askRemoteAi(question, {
            language,
            profile: {
              village: state.profile.village,
              district: state.profile.district,
              primaryCrop: state.profile.preferredCrop,
              landSize: state.profile.landHolding,
              language,
            },
            conversation: history,
          })
          return response.answer
        } catch {
          return null
        }
      },
    }
    setRemoteProvider(provider)
    return () => {
      if (getRemoteProvider() === provider) setRemoteProvider(null)
    }
  }, [
    aiStatus?.chatConfigured,
    language,
    state.profile.district,
    state.profile.landHolding,
    state.profile.preferredCrop,
    state.profile.village,
  ])

  const knownJobIds = useRef<Set<string>>(new Set(state.jobs.map((job) => job.id)))
  useEffect(() => {
    const known = knownJobIds.current
    const added = state.jobs.filter((job) => !known.has(job.id))
    knownJobIds.current = new Set(state.jobs.map((job) => job.id))
    if (added.length === 0) return

    const job = added[added.length - 1]
    const announcement =
      state.language === 'hi'
        ? `आपकी नौकरी "${job.title}" अब मार्केटप्लेस में लाइव है। ${job.workersRequired} मज़दूर चाहिए · ₹${job.wagePerDay}/दिन · ${job.village}, ${job.district}।`
        : `Your job "${job.title}" is now live in the marketplace. ${job.workersRequired} workers needed · ₹${job.wagePerDay}/day · ${job.village}, ${job.district}.`
    setMessages((current) => [
      ...current,
      {
        id: makeMessageId('posted'),
        role: 'assistant',
        text: announcement,
        lang: state.language,
        timestamp: Date.now(),
      },
    ])
    if (speakReplies) speak(announcement, state.language)
  }, [state.jobs, state.language, speak, speakReplies])

  const sendMessage = useCallback(
    (raw: string) => {
      const text = raw.trim()
      if (!text || busy) return

      const replyLanguage = resolveReplyLanguage(text, state.language)

      setMessages((current) => [
        ...current,
        {
          id: makeMessageId('user'),
          role: 'user',
          text,
          lang: replyLanguage,
          timestamp: Date.now(),
        },
      ])
      setInput('')
      setBusy(true)

      processingTimer.current = window.setTimeout(() => {
        void askQuestionAsync(text, diagnostic)
          .then((rawReply) => {
            const reply = applyReplyLanguage(rawReply, replyLanguage)
            setMessages((current) => [
              ...current,
              {
                id: reply.id,
                role: 'assistant',
                text: reply.text,
                reply,
                lang: replyLanguage,
                timestamp: Date.now(),
              },
            ])
            setDiagnostic({ ...diagnostic })
            if (speakReplies) speak(reply.text, replyLanguage)
          })
          .catch(() => {
            setMessages((current) => [
              ...current,
              {
                id: makeMessageId('error'),
                role: 'assistant',
                text: t('ai.errorText'),
                lang: replyLanguage,
                timestamp: Date.now(),
              },
            ])
            toast.error(t('ai.errorTitle'), t('ai.errorText'))
          })
          .finally(() => {
            setBusy(false)
            processingTimer.current = null
          })
      }, LOCAL_PROCESSING_MS)
    },
    [busy, diagnostic, state.language, t, toast, speak, speakReplies],
  )

  const copyAnswer = useCallback(
    async (id: string, text: string) => {
      let copied = false

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text)
          copied = true
        }
      } catch {
        copied = false
      }

      if (!copied) {
        try {
          const area = document.createElement('textarea')
          area.value = text
          area.setAttribute('readonly', '')
          area.style.position = 'fixed'
          area.style.top = '-1000px'
          document.body.appendChild(area)
          area.select()
          copied = document.execCommand('copy')
          document.body.removeChild(area)
        } catch {
          copied = false
        }
      }

      if (!copied) {
        toast.error(t('ai.copyFailed'), t('ai.copyFailedHint'))
        return
      }

      setCopiedId(id)
      toast.success(t('ai.copied'))
      if (copyTimer.current) window.clearTimeout(copyTimer.current)
      copyTimer.current = window.setTimeout(() => setCopiedId(null), 1800)
    },
    [t, toast],
  )

  const toggleMessageLanguage = useCallback((id: string) => {
    setMessages((current) =>
      current.map((message) =>
        message.id === id
          ? { ...message, lang: message.lang === 'hi' ? 'en' : 'hi' }
          : message,
      ),
    )
  }, [])

  const clearConversation = () => {
    setMessages([])
    setInput('')
    setCopiedId(null)
    setDiagnostic(createDiagnosticSession())
    cancelAll()
    if (storageKey) {
      try {
        window.sessionStorage.removeItem(storageKey)
      } catch {
        /* Ignore storage failures. */
      }
    }
    toast.info(t('ai.clearedToast'), t('ai.clearedToastDesc'))
  }

  const openPostForm = (fields: DraftField[]) => {
    setPrefill(draftToPrefill(fields))
    setPostOpen(true)
  }

  const suggestionText = (suggestion: (typeof AI_SUGGESTIONS)[number]) =>
    language === 'hi' ? suggestion.textHi : suggestion.textEn

  const diagnosticStage = currentDiagnosticStage(diagnostic)
  const stageReplies = diagnosticStage ? quickRepliesForStage(diagnosticStage) : []
  const canEditLast = diagnostic.started && diagnostic.answers.length > 0 && !busy

  const editLastAnswer = () => {
    const outcome = reopenLastAnswer(diagnostic)
    if (!outcome) return
    setDiagnostic({ ...diagnostic })
    setMessages((current) => [
      ...current,
      {
        id: makeMessageId('edit'),
        role: 'assistant',
        text: language === 'hi' ? outcome.textHi : outcome.textEn,
        lang: language,
        timestamp: Date.now(),
      },
    ])
    setInput('')
  }

  const handlePhotoCompleted = (result: PhotoCheckResult) => {
    const intro = result.analysis.visionAnalyzed
      ? pick(
          language,
          'I checked the photo with the configured server vision model. Here is a possibility list to review, not a confirmed diagnosis.',
          'कॉन्फ़िगर किए गए सर्वर vision मॉडल से फोटो जाँची गई। नीचे संभावनाओं की सूची है, पक्का निदान नहीं।',
        )
      : pick(
          language,
          'Image analysis unavailable — guidance is based on your description. This remains a possibility list, not a confirmed diagnosis.',
          'छवि विश्लेषण उपलब्ध नहीं है — मार्गदर्शन आपके विवरण पर आधारित है। यह संभावनाओं की सूची है, पक्का निदान नहीं।',
        )
    setMessages((current) => [
      ...current,
      {
        id: makeMessageId('photo'),
        role: 'assistant',
        text: intro,
        lang: language,
        timestamp: Date.now(),
        photoAnalysis: result.analysis,
        photoPreview: result.imageDataUrl,
        photoDescription: result.description,
      },
    ])
    setMode('chat')
    toast.success(
      pick(language, 'Photo check ready', 'फोटो जाँच तैयार'),
      pick(
        language,
        'Review the possibility list and confirm anything important with a KVK.',
        'संभावनाओं की सूची देखें और ज़रूरी बात KVK से पुष्टि करें।',
      ),
    )
    if (speakReplies) speak(intro, language)
  }

  const contentWidth = fullscreen ? 'max-w-6xl' : 'max-w-3xl'

  return (
    <div
      data-testid="ai-workspace"
      data-fullscreen={fullscreen ? 'true' : 'false'}
      className={cn(
        'flex min-h-0 flex-1 flex-col',
        fullscreen ? 'h-full gap-0 bg-canvas' : 'gap-2.5',
      )}
    >
      <header
        data-testid="ai-toolbar"
        className={cn(
          'flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2',
          fullscreen &&
            'border-b border-ink-200 bg-white px-3 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))] sm:px-6 sm:pt-2',
        )}
      >
        <div
          className={cn(
            'flex w-full min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2',
            fullscreen && cn('mx-auto', contentWidth),
          )}
        >
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
            <div className="min-w-0">
              <h1 className="sr-only text-xl font-bold tracking-tight text-ink-900 sm:not-sr-only sm:text-2xl">
                {t('ai.title')}
              </h1>
              <p className="mt-0.5 hidden max-w-xs text-xs leading-relaxed text-ink-500 xl:block">
                {t('ai.subtitle')}
              </p>
            </div>

            <div
              role="tablist"
              aria-label={pick(language, 'Assistant mode', 'सहायक मोड')}
              className="inline-flex rounded-xl border border-ink-200 bg-white p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'chat'}
                onClick={() => setMode('chat')}
                data-testid="chat-tab"
                className={
                  mode === 'chat'
                    ? 'inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white'
                    : 'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-50'
                }
              >
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                {pick(language, 'Ask a question', 'सवाल पूछें')}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'photo'}
                onClick={() => setMode('photo')}
                data-testid="photo-tab"
                className={
                  mode === 'photo'
                    ? 'inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white'
                    : 'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-50'
                }
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
                {pick(language, 'Check a photo', 'फोटो जाँचें')}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <p className="hidden text-xs text-ink-500 2xl:block">
              {pick(
                language,
                'Conversation memory is kept for this browser session.',
                'बातचीत की याद इस ब्राउज़र सेशन तक रहती है।',
              )}
            </p>
            <AiStatus
              language={language}
              chatConfigured={aiStatus?.chatConfigured ?? false}
              visionConfigured={aiStatus?.visionConfigured ?? false}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={clearConversation}
              disabled={messages.length === 0}
              aria-label={t('ai.clear')}
              title={t('ai.clear')}
              className="px-2.5 2xl:px-3.5"
              leadingIcon={<RotateCcw className="h-4 w-4" />}
            >
              <span className="hidden 2xl:inline">{t('ai.clear')}</span>
            </Button>
            {fullscreen ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFullscreen(false)}
                data-testid="ai-exit-fullscreen"
                aria-label={t('ai.exitFullscreen')}
                title={t('ai.exitFullscreen')}
                leadingIcon={<Minimize2 className="h-4 w-4" />}
              >
                {t('ai.exitFullscreen')}
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFullscreen(true)}
                data-testid="ai-enter-fullscreen"
                aria-label={t('ai.fullscreen')}
                title={t('ai.fullscreen')}
                leadingIcon={<Maximize2 className="h-4 w-4" />}
              >
                {t('ai.fullscreen')}
              </Button>
            )}
          </div>
        </div>
      </header>

      {mode === 'photo' ? (
        <div
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overscroll-contain',
            fullscreen ? 'px-3 py-3 sm:px-6 sm:py-4' : 'pb-2',
          )}
        >
          <div className={cn(fullscreen && cn('mx-auto w-full', contentWidth))}>
            <CropPhotoCheck
              language={language}
              crop={state.profile.preferredCrop}
              visionConfigured={aiStatus ? aiStatus.visionConfigured : null}
              onCompleted={handlePhotoCompleted}
              onCancel={() => setMode('chat')}
            />
          </div>
        </div>
      ) : (
        <Card
          flush
          data-testid="chat-panel"
          className={cn(
            'flex min-h-0 flex-1 flex-col overflow-hidden',
            fullscreen && 'rounded-none border-0 shadow-none',
          )}
        >
          <div
            ref={scrollRef}
            data-testid="chat-scroll"
            className={cn(
              'min-h-0 flex-1 overflow-y-auto overscroll-contain',
              fullscreen
                ? 'px-3 py-4 sm:px-8 sm:py-6 lg:px-10'
                : 'px-3 py-3 sm:px-6 sm:py-5',
            )}
            aria-live="polite"
          >
            {messages.length === 0 ? (
              <div
                className={cn(
                  'mx-auto flex h-full w-full flex-col items-center justify-center px-1 py-4 text-center',
                  fullscreen ? 'max-w-5xl' : 'max-w-3xl',
                )}
                data-testid="chat-empty"
              >
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                  <Sparkles className="h-7 w-7" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-semibold text-ink-900">{t('ai.emptyTitle')}</h2>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-ink-500">
                  {t('ai.emptyDesc')}
                </p>

                <div
                  className={cn(
                    'mt-5 grid w-full gap-2 sm:grid-cols-2 xl:grid-cols-3',
                    fullscreen ? 'max-w-3xl' : 'max-w-2xl',
                  )}
                >
                  {AI_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => sendMessage(suggestionText(suggestion))}
                      className="flex items-start gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-left text-sm leading-snug text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
                    >
                      <MessageSquare
                        className="mt-0.5 h-4 w-4 shrink-0 text-brand-500"
                        aria-hidden="true"
                      />
                      <span>{suggestionText(suggestion)}</span>
                    </button>
                  ))}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={() => setMode('photo')}
                  leadingIcon={<Camera className="h-4 w-4" />}
                >
                  {pick(language, 'Or check a crop photo', 'या फसल की फोटो जाँचें')}
                </Button>
              </div>
            ) : (
              <div className={cn('mx-auto w-full space-y-5', contentWidth)}>
                {messages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    message={message}
                    copied={copiedId === message.id}
                    onCopy={copyAnswer}
                    onToggleLanguage={toggleMessageLanguage}
                    onConfirmDraft={openPostForm}
                  />
                ))}
                {busy ? <TypingIndicator label={t('ai.typing')} /> : null}
              </div>
            )}
          </div>

          <div
            data-testid="chat-footer"
            className={cn(
              'shrink-0 border-t border-ink-100 bg-surface-sunken px-3 py-2.5 sm:px-6 sm:py-3',
              fullscreen &&
                'pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-[calc(0.9rem+env(safe-area-inset-bottom))]',
            )}
          >
            <div className={cn('mx-auto w-full', contentWidth)}>
                {messages.length > 0 ? (
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-1.5">
                    <div className="min-w-0">
                      {diagnosticStage ? (
                        <>
                          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                            {pick(language, 'Answer this step', 'इस चरण का जवाब दें')}
                          </p>
                          <div className="flex gap-1.5 overflow-x-auto pb-1">
                            {stageReplies.map((reply) => {
                              const text = language === 'hi' ? reply.textHi : reply.textEn
                              return (
                                <button
                                  key={text}
                                  type="button"
                                  disabled={busy}
                                  onClick={() => sendMessage(text)}
                                  className="shrink-0 rounded-full border border-ink-200 bg-white px-2.5 py-1 text-[11px] font-medium text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {text}
                                </button>
                              )
                            })}
                          </div>
                        </>
                      ) : (
                        <details
                          ref={quickPromptsRef}
                          data-testid="quick-prompts"
                          className="group"
                        >
                          <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-md text-[11px] font-semibold uppercase tracking-wider text-ink-500 transition-colors hover:text-brand-700 [&::-webkit-details-marker]:hidden">
                            {t('ai.quickPrompts')}
                            <ChevronDown
                              className="h-3.5 w-3.5 transition-transform group-open:rotate-180"
                              aria-hidden="true"
                            />
                          </summary>
                          <div className="mt-1.5 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
                            {AI_SUGGESTIONS.map((suggestion) => (
                              <button
                                key={suggestion.id}
                                type="button"
                                disabled={busy}
                                onClick={() => {
                                  sendMessage(suggestionText(suggestion))
                                  if (quickPromptsRef.current) {
                                    quickPromptsRef.current.open = false
                                  }
                                }}
                                className="rounded-full border border-ink-200 bg-white px-2.5 py-1 text-[11px] font-medium text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {suggestionText(suggestion)}
                              </button>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>

                    {canEditLast ? (
                      <button
                        type="button"
                        onClick={editLastAnswer}
                        data-testid="edit-last-answer"
                        className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-brand-700 hover:bg-brand-50"
                      >
                        <Undo2 className="h-3 w-3" aria-hidden="true" />
                        {pick(language, 'Edit last answer', 'पिछला जवाब बदलें')}
                      </button>
                    ) : null}
                  </div>
                ) : null}

                <ChatComposer
                  value={input}
                  onChange={setInput}
                  onSend={() => sendMessage(input)}
                  busy={busy}
                  placeholder={t('ai.placeholder')}
                  sendLabel={t('ai.send')}
                  hint={
                    aiStatus?.chatConfigured
                      ? pick(
                          language,
                          'Enter sends · Shift+Enter adds a line · Only unmatched questions use server AI.',
                          'Enter से भेजें · Shift+Enter से नई लाइन · केवल अनसुलझे सवाल सर्वर AI का उपयोग करते हैं।',
                        )
                      : t('ai.hint')
                  }
                  onToggleMic={toggleMic}
                  micActive={voiceStatus === 'listening'}
                  micDisabled={!recognitionSupported}
                  micStartLabel={t('voice.micStart')}
                  micStopLabel={t('voice.micStop')}
                  micUnavailableLabel={t('voice.micUnavailable')}
                />

                <VoiceControls
                  status={voiceStatus}
                  error={voiceError}
                  recognitionSupported={recognitionSupported}
                  synthesisSupported={synthesisSupported}
                  speakRepliesEnabled={speakReplies}
                  onToggleSpeakReplies={toggleSpeakReplies}
                  onStopSpeaking={stopSpeaking}
                />
              </div>
            </div>
        </Card>
      )}

      <JobPostModal open={postOpen} onClose={() => setPostOpen(false)} prefill={prefill} />
    </div>
  )
}
