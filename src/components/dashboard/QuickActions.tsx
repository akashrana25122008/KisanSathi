import { Link } from 'react-router-dom'
import { type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/cn'

export interface QuickAction {
  key: string
  label: string
  description: string
  icon: LucideIcon
  to?: string
  onClick?: () => void
  tone: 'brand' | 'harvest' | 'info'
}

const TONE_STYLES = {
  brand: {
    wrapper: 'hover:border-brand-300 hover:bg-brand-50/60',
    chip: 'bg-brand-100 text-brand-700',
  },
  harvest: {
    wrapper: 'hover:border-harvest-300 hover:bg-harvest-50/60',
    chip: 'bg-harvest-100 text-harvest-700',
  },
  info: {
    wrapper: 'hover:border-info-100 hover:bg-info-50/60',
    chip: 'bg-info-100 text-info-700',
  },
}

export interface QuickActionsProps {
  actions: QuickAction[]
  className?: string
}

export function QuickActions({ actions, className }: QuickActionsProps) {
  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5', className)}>
      {actions.map((action) => {
        const styles = TONE_STYLES[action.tone]
        const inner = (
          <>
            <span
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
                styles.chip,
              )}
              aria-hidden="true"
            >
              <action.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ink-900">{action.label}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">
                {action.description}
              </span>
            </span>
          </>
        )

        const className = cn(
          'surface surface-interactive flex items-center gap-3 p-4 text-left',
          styles.wrapper,
        )

        if (action.to) {
          return (
            <Link key={action.key} to={action.to} className={className}>
              {inner}
            </Link>
          )
        }

        return (
          <button
            key={action.key}
            type="button"
            onClick={action.onClick}
            className={cn(className, 'cursor-pointer')}
          >
            {inner}
          </button>
        )
      })}
    </div>
  )
}
