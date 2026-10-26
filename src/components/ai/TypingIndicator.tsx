import { Sparkles } from 'lucide-react'

/** "Local processing" feedback bubble shown while the engine runs. */
export function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="flex gap-2.5" aria-live="polite" aria-busy="true" data-testid="typing-indicator">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-100">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="flex items-center gap-2.5 rounded-2xl rounded-tl-md border border-ink-200 bg-white px-4 py-3 shadow-card">
        <span className="flex items-center gap-1">
          {['-0.32s', '-0.16s', '0s'].map((delay) => (
            <span
              key={delay}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400"
              style={{ animationDelay: delay }}
            />
          ))}
        </span>
        <span className="text-xs font-medium text-ink-500">{label}</span>
      </div>
    </div>
  )
}
