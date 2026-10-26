import { useMemo } from 'react'
import { ArrowLeft, MapPin, Phone, Sparkles, UserRound, Users } from 'lucide-react'
import { useParams } from 'react-router-dom'

import { CROP_MAP, WORKERS } from '@/data'
import { useT } from '@/lib/i18n'
import { jobDescription } from '@/lib/jobs'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressMeter } from '@/components/ui/ProgressMeter'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/layout/PageHeader'
import { useApp } from '@/store/AppContext'
import { enrollmentStatusOf, vacanciesOf } from '@/store/appReducer'
import { useJobActions } from '@/hooks/useJobActions'
import { formatCurrency, formatDate, formatRelativeDay } from '@/lib/format'

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { state } = useApp()
  const t = useT()
  const { enroll, withdraw } = useJobActions()
  const language = state.language

  const job = useMemo(() => state.jobs.find((item) => item.id === id), [state.jobs, id])

  if (!job) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow={t('nav.jobs')}
          title={t('job.notFound')}
          description={t('job.notFoundHint')}
          actions={
            <Button
              to="/jobs"
              variant="secondary"
              leadingIcon={<ArrowLeft className="h-4 w-4" />}
            >
              {t('job.backToMarketplace')}
            </Button>
          }
        />
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title={t('job.notFound')}
          description={t('job.notFoundHint')}
          action={
            <Button to="/jobs" leadingIcon={<ArrowLeft className="h-4 w-4" />}>
              {t('job.backToMarketplace')}
            </Button>
          }
        />
      </div>
    )
  }

  const crop = CROP_MAP[job.crop]
  const enrolled = job.enrolledWorkerIds.length
  const required = job.workersRequired
  const vacancies = vacanciesOf(job)
  const title = language === 'hi' && job.titleHi ? job.titleHi : job.title
  const description = jobDescription(job)
  const enrolledWorkers = WORKERS.filter((worker) => job.enrolledWorkerIds.includes(worker.id))

  const isFarmer = state.role === 'farmer'
  const isOwnJob = isFarmer && job.postedBy === state.profile.name
  const status = enrollmentStatusOf(job, state.myEnrollments)

  const statusBadge = (() => {
    if (isFarmer) {
      return isOwnJob
        ? { tone: 'brand' as const, label: t('job.yourJob') }
        : { tone: 'outline' as const, label: t('job.sampleJob') }
    }
    if (status === 'enrolled') return { tone: 'success' as const, label: t('job.enrolledYou') }
    if (status === 'full') return { tone: 'neutral' as const, label: t('common.fullyStaffed') }
    if (status === 'closed') return { tone: 'neutral' as const, label: t('job.closedStatus') }
    return { tone: 'harvest' as const, label: t('job.openStatus') }
  })()

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('nav.jobs')}
        title={title}
        description={`${job.village}, ${job.district}, ${job.state} · ${t('job.publishedBy')} ${job.postedBy}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              to="/jobs"
              variant="secondary"
              leadingIcon={<ArrowLeft className="h-4 w-4" />}
            >
              {t('job.backToMarketplace')}
            </Button>
            <Button to="/ai" leadingIcon={<Sparkles className="h-4 w-4" />}>
              {t('job.openAi')}
            </Button>
          </div>
        }
      />

      {job.isSample ? (
        <p className="rounded-xl border border-ink-200 bg-surface-sunken px-4 py-2.5 text-xs text-ink-500">
          {t('job.sampleBanner')}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Work overview" subtitle="Details shared with workers" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-ink-100 bg-surface-sunken p-3">
                <p className="text-xs font-medium text-ink-500">Crop & activity</p>
                <p className="mt-1 text-sm font-semibold text-ink-900">
                  {crop.glyph} {crop.label} · {job.activity}
                </p>
              </div>
              <div className="rounded-xl border border-ink-100 bg-surface-sunken p-3">
                <p className="text-xs font-medium text-ink-500">{t('job.farm')}</p>
                <p className="mt-1 text-sm font-semibold text-ink-900">{job.farmName}</p>
              </div>
              <div className="rounded-xl border border-ink-100 bg-surface-sunken p-3">
                <p className="text-xs font-medium text-ink-500">{t('job.workDate')}</p>
                <p className="mt-1 text-sm font-semibold text-ink-900">
                  {formatDate(job.workDate, language)} ({formatRelativeDay(job.workDate, language)})
                </p>
              </div>
              <div className="rounded-xl border border-ink-100 bg-surface-sunken p-3">
                <p className="text-xs font-medium text-ink-500">{t('job.startTime')}</p>
                <p className="mt-1 text-sm font-semibold text-ink-900">{job.startTime}</p>
              </div>
              <div className="rounded-xl border border-ink-100 bg-surface-sunken p-3">
                <p className="text-xs font-medium text-ink-500">{t('common.duration')}</p>
                <p className="mt-1 text-sm font-semibold text-ink-900">
                  {job.durationDays} {t('common.days')}
                </p>
              </div>
              <div className="rounded-xl border border-ink-100 bg-surface-sunken p-3 sm:col-span-2">
                <p className="text-xs font-medium text-ink-500">Location</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                  <MapPin className="h-4 w-4 text-ink-400" />
                  {job.village}, {job.district}, {job.state}
                </p>
              </div>
            </div>

            {description ? (
              <div className="mt-5 rounded-xl border border-ink-100 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-400">
                  {t('job.description')}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-700">{description}</p>
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              {job.amenities.map((amenity) => (
                <Badge key={amenity} tone="outline">
                  {amenity}
                </Badge>
              ))}
              <Badge tone={job.genderPreference === 'female' ? 'harvest' : 'neutral'}>
                Gender:{' '}
                {job.genderPreference === 'any'
                  ? 'Any'
                  : job.genderPreference === 'female'
                    ? 'Women preferred'
                    : 'Men preferred'}
              </Badge>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Enrolled workers (sample)"
              subtitle="Illustrative profiles - no real contact data"
            />
            <div className="mt-4 space-y-2">
              {enrolledWorkers.length === 0 ? (
                <p className="text-sm text-ink-500">No one has enrolled yet in this demo.</p>
              ) : (
                enrolledWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    className="flex items-center gap-3 rounded-xl border border-ink-100 p-3"
                  >
                    <Avatar name={worker.name} accent={worker.accent} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-900">{worker.name}</p>
                      <p className="truncate text-xs text-ink-500">
                        {worker.village}, {worker.district} · {worker.skills.slice(0, 2).join(', ')}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                      <Phone className="h-3.5 w-3.5" />
                      {worker.phone}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Pay & crew" subtitle="Track how many positions remain" />
            <div className="mt-4">
              <p className="text-2xl font-bold text-brand-700">
                {formatCurrency(job.wagePerDay, language)}
              </p>
              <p className="mt-1 text-xs text-ink-500">{t('job.wage')}</p>
            </div>
            <div className="mt-5">
              <ProgressMeter
                value={enrolled}
                max={required}
                label={t('job.enrolledCount', { enrolled, required })}
                caption={`${vacancies} ${t('common.vacancies')}`}
              />
            </div>
            <dl className="mt-5 space-y-2 text-sm text-ink-600">
              <div className="flex items-center justify-between gap-3">
                <dt>{t('job.requiredWorkers')}</dt>
                <dd className="font-semibold text-ink-900">{required}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt>{t('job.enrolledWorkers')}</dt>
                <dd className="font-semibold text-ink-900">{enrolled}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt>{t('job.vacantPositions')}</dt>
                <dd className="font-semibold text-brand-700">{vacancies}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader
              title={t('job.enrollmentStatus')}
              subtitle={
                isFarmer
                  ? 'How this job looks to a worker right now'
                  : 'Your place on the crew for this job'
              }
            />

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-ink-100 bg-surface-sunken p-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <UserRound className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink-900">{statusBadge.label}</p>
                <p className="text-xs text-ink-500">
                  {status === 'enrolled'
                    ? `${enrolled} of ${required} positions taken`
                    : status === 'full'
                      ? `All ${required} positions are filled`
                      : status === 'closed'
                        ? 'This job is not accepting new workers'
                        : `${vacancies} ${t('common.vacancies')} still open`}
                </p>
              </div>
            </div>

            <div className="mt-4">
              {isFarmer ? (
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed text-ink-600">
                    {isOwnJob
                      ? 'This is a job you posted. Workers can enroll until every position is filled.'
                      : 'This is a sample job from another farm, shown so you can see how the board works.'}
                  </p>
                  <Button to="/jobs" variant="outline" fullWidth>
                    {t('job.backToMarketplace')}
                  </Button>
                </div>
              ) : status === 'enrolled' ? (
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed text-ink-600">
                    You are on the crew for this job. Withdrawing frees one position for
                    another worker.
                  </p>
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => withdraw(job)}
                    leadingIcon={<Users className="h-4 w-4" />}
                  >
                    {t('job.withdrawFrom')}
                  </Button>
                </div>
              ) : status === 'available' ? (
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed text-ink-600">
                    {vacancies} {t('common.vacancies')} left on a crew of {required}. Joining takes
                    one place and can be withdrawn at any time.
                  </p>
                  <Button
                    fullWidth
                    onClick={() => enroll(job)}
                    leadingIcon={<Users className="h-4 w-4" />}
                  >
                    {t('job.applyNow')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed text-ink-600">
                    {status === 'full'
                      ? 'Every position on this job is already filled. Try another job with vacancies.'
                      : 'This job is closed and is no longer accepting workers.'}
                  </p>
                  <Button to="/jobs" variant="outline" fullWidth>
                    {t('job.backToMarketplace')}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
