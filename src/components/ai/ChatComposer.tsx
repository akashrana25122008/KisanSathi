import { useEffect, useRef } from 'react'
import { Loader2, Mic, Send } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

export interface ChatComposerProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  busy: boolean
  placeholder: string
  sendLabel: string
  hint: string
  /** Starts or stops the browser speech recognition. */
  onToggleMic?: () => void
  /** True while the browser is actually listening. */
  micActive?: boolean
  /** True when the browser has no speech recognition at all. */
  micDisabled?: boolean
  micStartLabel?: string
  micStopLabel?: string
  micUnavailableLabel?: string
}

const MIN_INPUT_HEIGHT = 56
const MAX_INPUT_HEIGHT = 208

/**
 * Chat input. Enter sends, Shift+Enter adds a new line, and the textarea starts
 * compact and grows with the message up to a cap, then scrolls inside.
 *
 * The microphone button is a plain toggle: it never pretends to listen. When
 * the browser cannot do speech recognition the button is disabled and the
 * reason is given to assistive technology, while typing keeps working.
 */
export function ChatComposer({
  value,
  onChange,
  onSend,
  busy,
  placeholder,
  sendLabel,
  hint,
  onToggleMic,
  micActive = false,
  micDisabled = false,
  micStartLabel = 'Start voice input',
  micStopLabel = 'Stop listening',
  micUnavailableLabel = 'Voice input is not available in this browser',
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const element = textareaRef.current
    if (!element) return
    element.style.height = 'auto'
    const next = Math.min(
      Math.max(element.scrollHeight, MIN_INPUT_HEIGHT),
      MAX_INPUT_HEIGHT,
    )
    element.style.height = `${next}px`
    element.style.overflowY = element.scrollHeight > MAX_INPUT_HEIGHT ? 'auto' : 'hidden'
  }, [value])

  const canSend = value.trim().length > 0 && !busy

  const micLabel = micActive ? micStopLabel : micStartLabel

  return (
    <form
      data-testid="chat-composer"
      onSubmit={(event) => {
        event.preventDefault()
        if (canSend) onSend()
      }}
      className="space-y-1.5"
    >
      <div className="relative">
        <label htmlFor="kisan-ai-input" className="sr-only">
          {placeholder}
        </label>
        <textarea
          id="kisan-ai-input"
          data-testid="chat-input"
          ref={textareaRef}
          rows={1}
          value={value}
          disabled={busy}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              if (canSend) onSend()
            }
          }}
          placeholder={placeholder}
          className="block max-h-52 min-h-14 w-full resize-none rounded-2xl border border-ink-200 bg-white px-4 pb-3 pr-24 pt-3 text-sm leading-relaxed text-ink-900 shadow-sm transition-colors placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-ink-50 disabled:text-ink-400"
        />

        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
          {onToggleMic ? (
            <button
              type="button"
              data-testid="voice-mic"
              onClick={onToggleMic}
              disabled={micDisabled || busy}
              aria-pressed={micActive}
              aria-label={micDisabled ? micUnavailableLabel : micLabel}
              title={micDisabled ? micUnavailableLabel : micLabel}
              className={cn(
                'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-ink-200 disabled:bg-ink-50 disabled:text-ink-300',
                micActive
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700',
              )}
            >
              <Mic className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}

          <Button
            type="submit"
            size="sm"
            disabled={!canSend}
            aria-label={sendLabel}
            title={sendLabel}
            className="w-9 rounded-full px-0 shadow-sm"
            leadingIcon={
              busy ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )
            }
          />
        </div>
      </div>
      <p className="px-1 text-[11px] text-ink-400">{hint}</p>
    </form>
  )
}
