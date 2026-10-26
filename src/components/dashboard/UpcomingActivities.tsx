import {
  Bug,
  CalendarDays,
  Droplets,
  SprayCan,
  Sprout,
  Users,
  Wheat,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { formatDate, formatRelativeDay } from '@/lib/format'
import type { Activity } from '@/store/types'

const KIND_ICON: Record<Activity['kind'], LucideIcon> = {
  sowing: Sprout,
  spraying: SprayCan,
  scouting: Bug,
  irrigation: Droplets,
  harvest: Wheat,
  weeding: Sprout,
}

const KIND_STYLE: Record<Activity['kind'], string> = {
  sowing: 'bg-brand-50 text-brand-600',
  spraying: 'bg-info-50 text-info-600',
  scouting: 'bg-harvest-50 text-harvest-600',
  irrigation: 'bg-info-50 text-info-600',
  harvest: 'bg-harvest-50 text-harvest-700',
  weeding: 'bg-brand-50 text-brand-600',
}

export interface UpcomingActivitiesProps {
  activities: Activity[]
  language: 'hi' | 'en'
  className?: string
}

export function UpcomingActivities({
  activities,
  language,
  className,
}: UpcomingActivitiesProps) {
  const t = useT()

  if (activities.length === 0) {
    return (
      <p className="text-sm text-ink-500">
        No upcoming activities in the sample schedule yet.
      </p>
    )
  }

  return (
    <ol className={cn('relative space-y-4', className)}>
      <span
        className="absolute left-[15px] top-3 bottom-3 w-px bg-ink-200"
        aria-hidden="true"
      />
      {activities.map((activity) => {
        const Icon = KIND_ICON[activity.kind]
        return (
          <li key={activity.id} className="relative flex gap-3.5">
            <span
              className={cn(
                'z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white',
                KIND_STYLE[activity.kind],
              )}
              aria-hidden="true"
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 rounded-xl border border-ink-100 bg-surface-sunken px-3.5 py-2.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="text-sm font-semibold text-ink-900">
                  {language === 'hi' ? activity.titleHi : activity.title}
                </p>
                <span className="text-[11px] font-medium text-ink-400">
                  {formatRelativeDay(activity.date, language)}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-ink-500">{activity.detail}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-500">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5 text-ink-400" aria-hidden="true" />
                  {formatDate(activity.date, language)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-ink-400" aria-hidden="true" />
                  {activity.workers} {t('common.workers')}
                </span>
                <span className="rounded-full bg-white px-2 py-0.5 font-medium text-brand-700 ring-1 ring-brand-100">
                  {activity.cropLabel}
                </span>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
