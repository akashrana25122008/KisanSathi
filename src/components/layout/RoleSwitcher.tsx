import { HardHat, Tractor } from 'lucide-react'

import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { useApp } from '@/store/AppContext'
import type { Role } from '@/store/types'

const ROLE_OPTIONS: { role: Role; icon: typeof Tractor }[] = [
  { role: 'farmer', icon: Tractor },
  { role: 'worker', icon: HardHat },
]

export interface RoleSwitcherProps {
  compact?: boolean
  className?: string
}

/**
 * Farmer / Worker switch. This genuinely changes the dashboard, the job
 * board actions and the wording across the product.
 */
export function RoleSwitcher({ compact = false, className }: RoleSwitcherProps) {
  const { state, dispatch } = useApp()
  const t = useT()

  return (
    <div
      role="group"
      aria-label={t('role.switch')}
      className={cn(
        'inline-flex items-center gap-1 rounded-xl border border-ink-200 bg-ink-100/70 p-1',
        className,
      )}
    >
      {ROLE_OPTIONS.map(({ role, icon: Icon }) => {
        const active = state.role === role
        return (
          <button
            key={role}
            type="button"
            aria-pressed={active}
            aria-label={t(role === 'farmer' ? 'role.farmer' : 'role.worker')}
            onClick={() => dispatch({ type: 'SET_ROLE', role })}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 sm:text-sm',
              active
                ? 'bg-white text-brand-700 shadow-sm ring-1 ring-ink-200/70'
                : 'text-ink-500 hover:text-ink-800',
            )}
          >
            <Icon className={cn('h-4 w-4', active ? 'text-brand-600' : 'text-ink-400')} />
            {compact ? null : <span>{t(role === 'farmer' ? 'role.farmer' : 'role.worker')}</span>}
          </button>
        )
      })}
    </div>
  )
}
