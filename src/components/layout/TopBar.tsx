import { Link, useLocation } from 'react-router-dom'
import { useT } from '@/lib/i18n'
import { LanguageToggle, SampleDataPill } from '@/components/layout/LanguageToggle'
import { Logo } from '@/components/layout/Logo'
import { NAV_ITEMS } from '@/components/layout/navigation'
import { RoleSwitcher } from '@/components/layout/RoleSwitcher'
import { Avatar } from '@/components/ui/Avatar'
import { useApp } from '@/store/AppContext'

export function TopBar() {
  const { state } = useApp()
  const t = useT()
  const { pathname } = useLocation()

  const activeItem =
    NAV_ITEMS.find((item) =>
      item.end ? pathname === item.to : pathname.startsWith(item.to),
    ) ?? NAV_ITEMS[0]!

  return (
    <header className="no-print sticky top-0 z-20 border-b border-ink-200/80 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="lg:hidden">
          <Logo size="sm" showWordmark={false} />
        </Link>

        <div className="hidden min-w-0 flex-col lg:flex">
          <p className="eyebrow">{t('nav.dashboard')}</p>
          <p className="truncate text-sm font-semibold text-ink-900">{t(activeItem.labelKey)}</p>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/*
            Visibility is controlled by a wrapper because both pills set
            `inline-flex` themselves - passing `hidden` through `className`
            would lose the cascade and overflow narrow screens.
          */}
          <div className="hidden md:block">
            <SampleDataPill />
          </div>

          <LanguageToggle />

          <div className="hidden sm:block">
            <RoleSwitcher compact={false} />
          </div>

          <Link
            to="/profile"
            className="rounded-full transition-opacity hover:opacity-85"
            aria-label="Open profile"
          >
            <Avatar name={state.profile.name} accent="bg-brand-600" size="sm" />
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-ink-100/70 px-4 pb-2.5 pt-2.5 sm:px-6 lg:hidden">
        <SampleDataPill />
        <RoleSwitcher compact />
      </div>
    </header>
  )
}
