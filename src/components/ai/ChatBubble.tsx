import { Check, Copy, Globe, Server, Sparkles, Stethoscope, TriangleAlert } from 'lucide-react'

import type { ChatMessage, DraftField } from '@/lib/aiEngine'
import { AI_SAFETY_NOTE } from '@/lib/aiEngine'
import { cn } from '@/lib/cn'
import { useT, pick } from '@/lib/i18n'
import { JobDraftCard } from '@/components/ai/JobDraftCard'
import { PhotoAnalysisCard } from '@/components/ai/PhotoAnalysisCard'
import { SourceList } from '@/components/ai/SourceList'

function formatTime(timestamp: number, language: 'en' | 'hi'): string {
  return new Date(timestamp).toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export interface ChatBubbleProps {
  message: ChatMessage
  copied: boolean
  onCopy: (id: string, text: string) => void
  onToggleLanguage: (id: string) => void
  onConfirmDraft: (fields: DraftField[]) => void
}

export function ChatBubble({
  message,
  copied,
  onCopy,
  onToggleLanguage,
  onConfirmDraft,
}: ChatBubbleProps) {
  const t = useT()
  const language = message.lang ?? 'en'
  const reply = message.reply

  if (message.role === 'user') {
    return (
      <div className="flex justify-end" data-testid="chat-user" data-message-id={message.id}>
        <div className="max-w-[88%] sm:max-w-[75%]">
          <div className="whitespace-pre-line rounded-2xl rounded-tr-md bg-brand-600 px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm">
            {message.text}
          </div>
          <p className="mt-1 text-right text-[11px] text-ink-400">
            {formatTime(message.timestamp, language)}
          </p>
        </div>
      </div>
    )
  }

  const displayText = reply
    ? language === 'hi'
      ? reply.textHi
      : reply.textEn
    : message.text

  // Rich replies contain editable forms and analysis grids. Squeezing them
  // into a narrow chat bubble leaves large unused margins and cramped fields.
  const hasRichContent = Boolean(reply?.jobDraft || message.photoAnalysis)

  return (
    <div className="flex gap-2.5" data-testid="chat-assistant" data-message-id={message.id}>
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-100">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
      </span>

      <div
        className={cn(
          'min-w-0',
          hasRichContent ? 'flex-1' : 'max-w-[88%] sm:max-w-[80%]',
        )}
      >
        <div
          className={cn(
            'rounded-2xl rounded-tl-md border bg-white px-4 py-3 shadow-card',
            reply?.kind === 'unknown'
              ? 'border-harvest-200'
              : message.photoAnalysis
                ? 'border-info-100'
                : 'border-ink-200',
          )}
        >
          {reply?.diagnosticStep ? (
            <p
              data-testid="diagnostic-step"
              className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700"
            >
              <Stethoscope className="h-3 w-3" aria-hidden="true" />
              {language === 'hi' ? reply.diagnosticStep.hi : reply.diagnosticStep.en}
            </p>
          ) : null}

          {reply?.answerOrigin === 'remote' ? (
            <p
              data-testid="remote-answer-badge"
              className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-info-50 px-2 py-0.5 text-[11px] font-semibold text-info-800"
            >
              <Server className="h-3 w-3" aria-hidden="true" />
              {pick(language, 'Server AI answer', 'सर्वर AI उत्तर')}
            </p>
          ) : null}

          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-800">{displayText}</p>

          {message.photoAnalysis ? (
            <PhotoAnalysisCard
              analysis={message.photoAnalysis}
              language={language}
              imageDataUrl={message.photoPreview}
              description={message.photoDescription}
            />
          ) : null}

          {reply?.needsContext && reply.contextHints.length > 0 ? (
            <div className="mt-3 rounded-lg bg-surface-sunken p-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                {t('ai.contextNeeded')}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {reply.contextHints.map((hint) => (
                  <span
                    key={hint}
                    className="rounded-full border border-ink-200 bg-white px-2 py-0.5 text-[11px] font-medium text-ink-600"
                  >
                    {hint}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {reply?.jobDraft ? (
            <JobDraftCard
              draft={reply.jobDraft}
              language={language}
              onConfirm={onConfirmDraft}
            />
          ) : null}

          {reply ? <SourceList sources={reply.sources} /> : null}

          {reply?.kind === 'unknown' ? (
            <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-harvest-800">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {language === 'hi' ? AI_SAFETY_NOTE.hi : AI_SAFETY_NOTE.en}
            </p>
          ) : null}
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-1 px-0.5">
          <button
            type="button"
            data-testid="copy-answer"
            onClick={() => onCopy(message.id, displayText)}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
          >
            {copied ? (
              <Check className="h-3 w-3 text-brand-600" aria-hidden="true" />
            ) : (
              <Copy className="h-3 w-3" aria-hidden="true" />
            )}
            {copied ? t('ai.copied') : t('ai.copy')}
          </button>

          {reply ? (
            <button
              type="button"
              data-testid="toggle-answer-language"
              onClick={() => onToggleLanguage(message.id)}
              aria-label={
                language === 'hi' ? 'Show this answer in English' : 'इस उत्तर को हिंदी में देखें'
              }
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
            >
              <Globe className="h-3 w-3" aria-hidden="true" />
              {language === 'hi' ? 'English' : 'हिंदी'}
            </button>
          ) : null}

          <span className="ml-auto text-[11px] text-ink-400">
            {formatTime(message.timestamp, language)}
          </span>
        </div>
      </div>
    </div>
  )
}
