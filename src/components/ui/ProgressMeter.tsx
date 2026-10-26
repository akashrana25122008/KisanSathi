import { cn } from '@/lib/cn'

export interface ProgressMeterProps {
  /** How many positions are taken. */
  value: number
  /** Total positions available. */
  max: number
  label?: string
  /** Shown to the right of the label, e.g. "8 of 12 filled". */
  caption?: string
  className?: string
  size?: 'sm' | 'md'
}

export function ProgressMeter({
  value,
  max,
  label,
  caption,
  className,
  size = 'md',
}: ProgressMeterProps) {
  const safeMax = Math.max(max, 0)
  const safeValue = Math.min(Math.max(value, 0), safeMax)
  const percent = safeMax === 0 ? 100 : Math.round((safeValue / safeMax) * 100)
  const complete = safeMax > 0 && safeValue >= safeMax

  return (
    <div className={cn('w-full', className)}>
      {label || caption ? (
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          {label ? (
            <span className="text-xs font-medium text-ink-600">{label}</span>
          ) : (
            <span />
          )}
          {caption ? (
            <span
              className={cn(
                'text-xs font-semibold tabular-nums',
                complete ? 'text-brand-700' : 'text-ink-600',
              )}
            >
              {caption}
            </span>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-ink-100',
          size === 'sm' ? 'h-1.5' : 'h-2',
        )}
        role="progressbar"
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={label ?? 'Crew filled'}
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-500 ease-out',
            complete ? 'bg-brand-700' : 'bg-brand-500',
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
