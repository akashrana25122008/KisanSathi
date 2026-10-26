import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** Adds a hover lift + border highlight for clickable cards. */
  interactive?: boolean
  /** Removes the inner padding so the card can host its own layout. */
  flush?: boolean
}

export function Card({
  children,
  interactive = false,
  flush = false,
  className,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'surface',
        !flush && 'p-5 sm:p-6',
        interactive && 'surface-interactive',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-ink-900">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
