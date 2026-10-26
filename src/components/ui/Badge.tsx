import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

export type BadgeTone =
  | 'brand'
  | 'harvest'
  | 'info'
  | 'neutral'
  | 'danger'
  | 'success'
  | 'outline'

const TONE_CLASSES: Record<BadgeTone, string> = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  harvest: 'bg-harvest-50 text-harvest-700 ring-harvest-200',
  info: 'bg-info-50 text-info-700 ring-info-100',
  neutral: 'bg-ink-100 text-ink-700 ring-ink-200',
  danger: 'bg-danger-50 text-danger-700 ring-danger-100',
  success: 'bg-brand-50 text-brand-700 ring-brand-200',
  outline: 'bg-white text-ink-600 ring-ink-200',
}

export interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
  className?: string
  icon?: ReactNode
  title?: string
}

export function Badge({
  children,
  tone = 'neutral',
  className,
  icon,
  title,
}: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}
