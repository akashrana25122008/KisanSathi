import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { NAV_ITEMS } from '@/components/layout/navigation'

export function MobileNav() {
  const t = useT()

  return (
    <nav
      aria-label="Primary"
      className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-ink-200 bg-white/95 backdrop-blur-md lg:hidden"
    >
      <ul className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 px-1 pb-2 pt-2.5 text-[10px] font-semibold transition-colors',
                  isActive ? 'text-brand-700' : 'text-ink-400',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex h-8 w-12 items-center justify-center rounded-full transition-colors',
                      isActive ? 'bg-brand-50 text-brand-600' : 'text-ink-400',
                    )}
                  >
                    <item.icon className="h-[19px] w-[19px]" aria-hidden="true" />
                  </span>
                  <span className="truncate">{t(item.labelKey)}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
