import { FlaskConical, Globe } from 'lucide-react'

import { cn } from '@/lib/cn'
import { useApp } from '@/store/AppContext'
import type { UiLanguage } from '@/store/types'

const LANGUAGES: { code: UiLanguage; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हिं' },
]

export function LanguageToggle({ className }: { className?: string }) {
  const { state, dispatch } = useApp()

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-lg border border-ink-200 bg-white p-0.5',
        className,
      )}
    >
      <Globe className="ml-1.5 h-3.5 w-3.5 text-ink-400" aria-hidden="true" />
      {LANGUAGES.map((language) => {
        const active = state.language === language.code
        return (
          <button
            key={language.code}
            type="button"
            lang={language.code}
            aria-pressed={active}
            onClick={() => dispatch({ type: 'SET_LANGUAGE', language: language.code })}
            className={cn(
              'rounded-md px-2 py-1 text-xs font-semibold transition-colors duration-150',
              active ? 'bg-brand-600 text-white' : 'text-ink-500 hover:bg-ink-100',
            )}
          >
            {language.label}
          </button>
        )
      })}
    </div>
  )
}

/** Small pill that makes the demo nature of the data explicit. */
export function SampleDataPill({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-harvest-200 bg-harvest-50 px-2.5 py-1 text-[11px] font-semibold text-harvest-700',
        className,
      )}
      title="All records in this prototype are illustrative sample data - nothing is fetched from a live service."
    >
      <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
      Sample data
    </span>
  )
}
