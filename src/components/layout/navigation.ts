import { NavLink } from 'react-router-dom'
import { CalendarRange, ClipboardList, Sparkles, UserRound, House } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/cn'

export interface NavItem {
  to: string
  labelKey: 'nav.home' | 'nav.jobs' | 'nav.ai' | 'nav.planner' | 'nav.profile'
  label: string
  icon: LucideIcon
  /** Shown on the mobile bottom bar. */
  shortLabel: string
  end?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    labelKey: 'nav.home',
    label: 'Home',
    shortLabel: 'Home',
    icon: House,
    end: true,
  },
  {
    to: '/jobs',
    labelKey: 'nav.jobs',
    label: 'Jobs',
    shortLabel: 'Jobs',
    icon: ClipboardList,
  },
  {
    to: '/ai',
    labelKey: 'nav.ai',
    label: 'Kisan AI',
    shortLabel: 'Kisan AI',
    icon: Sparkles,
  },
  {
    to: '/planner',
    labelKey: 'nav.planner',
    label: 'Crop Planner',
    shortLabel: 'Planner',
    icon: CalendarRange,
  },
  {
    to: '/profile',
    labelKey: 'nav.profile',
    label: 'Profile',
    shortLabel: 'Profile',
    icon: UserRound,
  },
]

export function navClassName({ isActive }: { isActive: boolean }): string {
  return cn(
    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150',
    isActive
      ? 'bg-brand-50 text-brand-700'
      : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
  )
}

export { NavLink }
