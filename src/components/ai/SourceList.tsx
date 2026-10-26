import { ArrowUpRight, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { SourceRef } from '@/lib/aiEngine'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'

/**
 * Lists where an answer came from. `sourced` links point at a real public
 * reference, while `general` marks pragmatic in-app guidance. The two are
 * visually distinct so a farmer can tell a citation from a suggestion.
 */
export function SourceList({ sources }: { sources: SourceRef[] }) {
  const t = useT()

  if (sources.length === 0) return null

  return (
    <div className="mt-3 rounded-xl border border-ink-100 bg-surface-sunken p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
        <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
        {t('ai.sources')}
      </p>

      <ul className="mt-2 space-y-1.5">
        {sources.map((source) => {
          const external = !!source.url && /^https?:\/\//i.test(source.url)
          const linkClasses =
            'inline-flex items-start gap-1 font-medium text-brand-700 underline-offset-2 hover:underline'

          return (
            <li key={`${source.title}-${source.url ?? 'none'}`} className="flex items-start gap-2 text-xs">
              <span
                className={cn(
                  'mt-px inline-flex shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  source.kind === 'sourced'
                    ? 'bg-brand-50 text-brand-700'
                    : 'bg-harvest-50 text-harvest-700',
                )}
              >
                {source.kind === 'sourced' ? t('ai.sourced') : t('ai.general')}
              </span>

              {!source.url ? (
                <span className="font-medium text-ink-600">{source.title}</span>
              ) : external ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClasses}
                >
                  {source.title}
                  <ArrowUpRight className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
                </a>
              ) : (
                <Link to={source.url} className={linkClasses}>
                  {source.title}
                  <ArrowUpRight className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
