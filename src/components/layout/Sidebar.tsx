import { NavLink } from 'react-router-dom'
import { ArrowUpRight, Info } from 'lucide-react'

import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { NAV_ITEMS, navClassName } from '@/components/layout/navigation'
import { Logo } from '@/components/layout/Logo'
import { Avatar } from '@/components/ui/Avatar'
import { useApp } from '@/store/AppContext'

export function Sidebar() {
  const { state } = useApp()
  const t = useT()

  return (
    <aside
      className="no-print fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-ink-200 bg-white lg:flex"
      aria-label="Main navigation"
    >
      <div className="flex h-16 items-center border-b border-ink-100 px-5">
        <NavLink to="/" className="rounded-xl">
          <Logo />
        </NavLink>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="eyebrow px-3 pb-2">Menu</p>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} className={navClassName}>
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={cn(
                        'h-[18px] w-[18px] shrink-0 transition-colors',
                        isActive ? 'text-brand-600' : 'text-ink-400 group-hover:text-ink-600',
                      )}
                      aria-hidden="true"
                    />
                    <span className="truncate">{t(item.labelKey)}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-7 rounded-xl border border-brand-100 bg-brand-50/70 p-4">
          <div className="mb-2 flex items-center gap-2 text-brand-700">
            <Info className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider">Prototype</span>
          </div>
          <p className="text-xs leading-relaxed text-ink-600">
            KisanSathi is a demo build. Jobs, workers, prices and weather shown here are
            illustrative samples - no live services are connected.
          </p>
        </div>
      </nav>

      <div className="border-t border-ink-100 p-3">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-ink-50"
        >
          <Avatar name={state.profile.name} accent="bg-brand-600" size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-ink-900">
              {state.profile.name}
            </span>
            <span className="block truncate text-xs text-ink-500">
              {t(state.role === 'farmer' ? 'role.farmer' : 'role.worker')} &middot;{' '}
              {state.profile.village}
            </span>
          </span>
          <ArrowUpRight className="h-4 w-4 text-ink-400" aria-hidden="true" />
        </NavLink>
      </div>
    </aside>
  )
}
