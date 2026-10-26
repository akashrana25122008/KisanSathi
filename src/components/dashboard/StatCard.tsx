import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

export type StatTone = 'brand' | 'harvest' | 'info' | 'neutral'

const TONE_STYLES: Record<StatTone, { chip: string; icon: string }> = {
  brand: { chip: 'bg-brand-50 text-brand-700', icon: 'text-brand-600' },
  harvest: { chip: 'bg-harvest-50 text-harvest-700', icon: 'text-harvest-600' },
  info: { chip: 'bg-info-50 text-info-700', icon: 'text-info-600' },
  neutral: { chip: 'bg-ink-100 text-ink-700', icon: 'text-ink-500' },
}

export interface StatCardProps {
  label: string
  value: string
  icon: ReactNode
  hint?: string
  tone?: StatTone
  className?: string
}

export function StatCard({
  label,
  value,
  icon,
  hint,
  tone = 'brand',
  className,
}: StatCardProps) {
  const styles = TONE_STYLES[tone]

  return (
    <div className={cn('surface flex items-start gap-4 p-4 sm:p-5', className)}>
      <span
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
          styles.chip,
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">{label}</p>
        <p className="mt-1 text-2xl font-bold leading-none tracking-tight text-ink-900 tabular-nums">
          {value}
        </p>
        {hint ? <p className="mt-1.5 text-xs text-ink-500">{hint}</p> : null}
      </div>
    </div>
  )
}
