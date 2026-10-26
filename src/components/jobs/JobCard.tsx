import { Link } from 'react-router-dom'
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react'

import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { CROP_MAP } from '@/data'
import { jobDescription } from '@/lib/jobs'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressMeter } from '@/components/ui/ProgressMeter'
import { useApp } from '@/store/AppContext'
import { enrollmentStatusOf, vacanciesOf } from '@/store/appReducer'
import type { Job } from '@/store/types'
import { formatCurrency, formatDate, formatRelativeDay } from '@/lib/format'

export interface JobCardProps {
  job: Job
  /** Worker view shows an apply button, farmer view shows a manage link. */
  onEnroll?: (job: Job) => void
  onWithdraw?: (job: Job) => void
  className?: string
}

export function JobCard({ job, onEnroll, onWithdraw, className }: JobCardProps) {
  const { state } = useApp()
  const t = useT()
  const crop = CROP_MAP[job.crop]

  const enrolled = job.enrolledWorkerIds.length
  const required = job.workersRequired
  const vacancies = vacanciesOf(job)

  const isFarmer = state.role === 'farmer'
  const isOwnJob = !isFarmer ? false : job.postedBy === state.profile.name
  const status = enrollmentStatusOf(job, state.myEnrollments)
  const isEnrolled = status === 'enrolled'

  const title = state.language === 'hi' && job.titleHi ? job.titleHi : job.title
  const description = jobDescription(job)

  /** The explicit enrollment / ownership state shown on the card. */
  const statusBadge = (() => {
    if (isFarmer) {
      return isOwnJob
        ? { tone: 'brand' as const, label: t('job.yourJob') }
        : { tone: 'outline' as const, label: t('job.sampleJob') }
    }
    if (status === 'enrolled') {
      return { tone: 'success' as const, label: t('job.enrolledYou') }
    }
    if (status === 'full') {
      return { tone: 'neutral' as const, label: t('common.fullyStaffed') }
    }
    if (status === 'closed') {
      return { tone: 'neutral' as const, label: t('job.closedStatus') }
    }
    return { tone: 'harvest' as const, label: t('job.openStatus') }
  })()

  return (
    <article
      className={cn(
        // `min-w-0` lets the card shrink inside a grid column on narrow
        // screens instead of pushing the whole page sideways.
        'surface surface-interactive flex h-full min-w-0 flex-col p-4 sm:p-5',
        className,
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-lg"
            aria-hidden="true"
          >
            {crop.glyph}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold uppercase tracking-wider text-brand-600">
              {crop.label}
              <span className="mx-1.5 text-ink-300">&middot;</span>
              {job.activity}
            </p>
            <h3 className="text-[15px] font-semibold leading-snug text-ink-900">
              <Link
                to={`/jobs/${job.id}`}
                className="rounded outline-none transition-colors hover:text-brand-700 focus-visible:text-brand-700"
              >
                {title}
              </Link>
            </h3>
          </div>
        </div>

        <Badge
          tone={vacancies === 0 ? 'success' : vacancies <= 2 ? 'harvest' : 'neutral'}
          className="shrink-0"
        >
          {vacancies === 0
            ? t('common.fullyStaffed')
            : `${vacancies} ${t('common.vacancies')}`}
        </Badge>
      </div>

      {description ? (
        <p className="mb-3 line-clamp-2 text-[13px] leading-relaxed text-ink-600">
          {description}
        </p>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-ink-600">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
          {job.village}, {job.district}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
          {formatDate(job.workDate, state.language)}
          <span className="text-ink-400">({formatRelativeDay(job.workDate, state.language)})</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
          {job.startTime} &middot; {job.durationDays} {t('common.days')}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {job.isSample ? (
          <Badge tone="outline" className="px-2 py-0.5 text-[11px]">
            {t('common.sampleData')}
          </Badge>
        ) : null}
        {job.amenities.slice(0, 4).map((amenity) => (
          <Badge key={amenity} tone="outline" className="px-2 py-0.5 text-[11px]">
            {amenity}
          </Badge>
        ))}
      </div>

      <div className="mt-auto space-y-3">
        <ProgressMeter
          value={enrolled}
          max={required}
          label={t('job.enrolledCount', { enrolled, required })}
          caption={`${vacancies} ${t('common.vacancies')}`}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-ink-400">
              {t('job.wage')}
            </p>
            <p className="text-lg font-bold leading-tight text-brand-700">
              {formatCurrency(job.wagePerDay, state.language)}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Badge tone={statusBadge.tone} icon={<Users className="h-3.5 w-3.5" />}>
              {statusBadge.label}
            </Badge>

            {!isFarmer && isEnrolled ? (
              onWithdraw ? (
                <Button variant="ghost" size="sm" onClick={() => onWithdraw(job)}>
                  {t('common.withdraw')}
                </Button>
              ) : null
            ) : !isFarmer && onEnroll ? (
              <Button
                size="sm"
                onClick={() => onEnroll(job)}
                disabled={status !== 'available'}
                leadingIcon={<Users className="h-4 w-4" />}
              >
                {status === 'full' ? t('common.noVacancies') : t('common.apply')}
              </Button>
            ) : (
              <Link to={`/jobs/${job.id}`}>
                <Button variant="outline" size="sm">
                  {t('common.seeDetails')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
