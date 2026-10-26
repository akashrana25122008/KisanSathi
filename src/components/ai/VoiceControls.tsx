import { AlertTriangle, Mic, MicOff, Square, Volume2 } from 'lucide-react'

import type { VoiceError, VoiceStatus } from '@/hooks/useVoice'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'

/**
 * Voice controls for the Kisan AI chat.
 *
 * The panel always shows what the browser is doing (ready, listening,
 * processing, speaking, error) and never pretends to listen or speak: when
 * the browser cannot do it, the reason is spelled out and the text chat keeps
 * working.
 */

export interface VoiceControlsProps {
  status: VoiceStatus
  error: VoiceError | null
  recognitionSupported: boolean
  synthesisSupported: boolean
  speakRepliesEnabled: boolean
  onToggleSpeakReplies: () => void
  onStopSpeaking: () => void
}

const ERROR_KEYS: Record<string, 'voice.errorPermissionDenied' | 'voice.errorNoSpeech' | 'voice.errorAudioCapture' | 'voice.errorNetwork' | 'voice.errorLanguageNotSupported' | 'voice.errorNotSupported' | 'voice.errorSynthesisNotSupported' | 'voice.errorStartFailed' | 'voice.errorUnknown'> = {
  'permission-denied': 'voice.errorPermissionDenied',
  'no-speech': 'voice.errorNoSpeech',
  'audio-capture': 'voice.errorAudioCapture',
  network: 'voice.errorNetwork',
  'language-not-supported': 'voice.errorLanguageNotSupported',
  'not-supported': 'voice.errorNotSupported',
  'synthesis-not-supported': 'voice.errorSynthesisNotSupported',
  'start-failed': 'voice.errorStartFailed',
  unknown: 'voice.errorUnknown',
}

export function VoiceControls({
  status,
  error,
  recognitionSupported,
  synthesisSupported,
  speakRepliesEnabled,
  onToggleSpeakReplies,
  onStopSpeaking,
}: VoiceControlsProps) {
  const t = useT()

  const statusLabel =
    status === 'listening'
      ? t('voice.listening')
      : status === 'processing'
        ? t('voice.processing')
        : status === 'speaking'
          ? t('voice.speaking')
          : status === 'error'
            ? t('voice.error')
            : t('voice.ready')

  const statusIcon =
    status === 'listening' ? (
      <Mic className="h-3.5 w-3.5" aria-hidden="true" />
    ) : status === 'speaking' ? (
      <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
    ) : status === 'error' ? (
      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
    ) : (
      <MicOff className="h-3.5 w-3.5" aria-hidden="true" />
    )

  const errorMessage = error ? t(ERROR_KEYS[error.code] ?? 'voice.errorUnknown') : null

  return (
    <div className="mt-1.5" data-testid="voice-controls">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span
          data-testid="voice-status"
          data-status={status}
          aria-live="polite"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
            status === 'listening' && 'border-brand-300 bg-brand-50 text-brand-700',
            status === 'processing' && 'border-brand-200 bg-brand-50 text-brand-700',
            status === 'speaking' && 'border-harvest-200 bg-harvest-50 text-harvest-800',
            status === 'error' && 'border-danger-200 bg-danger-50 text-danger-700',
            status === 'idle' && 'border-ink-200 bg-white text-ink-600',
          )}
        >
          {statusIcon}
          {statusLabel}
        </span>

        <button
          type="button"
          data-testid="voice-replies-toggle"
          aria-pressed={speakRepliesEnabled}
          onClick={onToggleSpeakReplies}
          disabled={!synthesisSupported}
          aria-label={
            speakRepliesEnabled ? t('voice.speakRepliesOff') : t('voice.speakRepliesOn')
          }
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
            speakRepliesEnabled
              ? 'border-brand-300 bg-brand-50 text-brand-700'
              : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300',
          )}
        >
          <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
          {t('voice.speakReplies')}
        </button>

        {status === 'speaking' ? (
          <button
            type="button"
            data-testid="voice-stop-speaking"
            onClick={onStopSpeaking}
            aria-label={t('voice.stopSpeaking')}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-600 transition-colors hover:border-ink-300 hover:text-ink-900"
          >
            <Square className="h-3.5 w-3.5" aria-hidden="true" />
            {t('voice.stopSpeaking')}
          </button>
        ) : null}

        <p className="sr-only text-[11px] leading-relaxed text-ink-400 sm:not-sr-only">
          {t('voice.privacy')}
        </p>
      </div>

      {errorMessage ? (
        <p
          data-testid="voice-error"
          className="mt-1 flex items-start gap-1.5 text-[11px] leading-relaxed text-danger-700"
        >
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </p>
      ) : null}

      {status === 'listening' || status === 'processing' ? (
        <p
          data-testid="voice-transcript-hint"
          className="mt-1 text-[11px] leading-relaxed text-ink-500"
        >
          {t('voice.transcriptHint')}
        </p>
      ) : null}

      {!recognitionSupported ? (
        <p
          data-testid="voice-unsupported"
          className="mt-1 text-[11px] leading-relaxed text-ink-500"
        >
          {t('voice.errorNotSupported')}
        </p>
      ) : null}
    </div>
  )
}
