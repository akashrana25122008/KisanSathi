import { useMemo, useState } from 'react'
import { ClipboardList, Filter, Plus, RotateCcw, Search } from 'lucide-react'

import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { CROPS, DISTRICTS } from '@/data'
import {
  DEFAULT_JOB_FILTERS,
  JOB_ACTIVITIES,
  filterJobs,
  isJobFilterActive,
  sortJobs,
  type JobFilters,
  type JobSort,
} from '@/lib/jobs'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Form'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { JobCard } from '@/components/jobs/JobCard'
import { JobPostModal } from '@/components/jobs/JobPostModal'
import { useApp } from '@/store/AppContext'
import { useJobActions } from '@/hooks/useJobActions'

export function JobsPage() {
  const { state } = useApp()
  const t = useT()
  const { enroll, withdraw } = useJobActions()

  const [postOpen, setPostOpen] = useState(false)
  const [filters, setFilters] = useState<JobFilters>(DEFAULT_JOB_FILTERS)
  const [sort, setSort] = useState<JobSort>('newest')

  const isFarmer = state.role === 'farmer'

  /**
   * The ids that belong to the signed-in user for the current role. A farmer
   * owns the jobs they posted, a worker owns the jobs they applied for.
   */
  const myJobIds = useMemo(() => {
    if (isFarmer) {
      return state.jobs
        .filter((job) => job.postedBy === state.profile.name)
        .map((job) => job.id)
    }
    return state.myEnrollments
  }, [isFarmer, state.jobs, state.myEnrollments, state.profile.name])

  const filteredJobs = useMemo(
    () => filterJobs(state.jobs, filters, { myJobIds }),
    [filters, myJobIds, state.jobs],
  )

  const jobs = useMemo(() => sortJobs(filteredJobs, sort), [filteredJobs, sort])

  const filtersActive = isJobFilterActive(filters)
  const scopeMine = filters.scope === 'mine'

  const patch = (next: Partial<JobFilters>) =>
    setFilters((current) => ({ ...current, ...next }))

  const clearFilters = () => {
    setFilters({ ...DEFAULT_JOB_FILTERS, scope: filters.scope })
    setSort('newest')
  }

  const scopeLabelMine = isFarmer ? t('job.scopeMineFarmer') : t('job.scopeMineWorker')

  const pageTitle = scopeMine ? scopeLabelMine : t('job.all')
  const pageDescription = scopeMine
    ? isFarmer
      ? t('home.myJobsSub')
      : t('job.myApplicationsSub')
    : isFarmer
      ? t('job.allSub')
      : t('job.allSub')

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={isFarmer ? 'Manage' : 'Find work'}
        title={pageTitle}
        description={pageDescription}
        actions={
          isFarmer ? (
            <Button onClick={() => setPostOpen(true)} leadingIcon={<Plus className="h-4 w-4" />}>
              {t('job.post')}
            </Button>
          ) : (
            <Button
              to="/"
              variant="secondary"
              leadingIcon={<ClipboardList className="h-4 w-4" />}
            >
              {t('nav.dashboard')}
            </Button>
          )
        }
      />

      <Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            label={t('common.search')}
            placeholder={t('common.searchPlaceholder')}
            leadingIcon={<Search className="h-4 w-4" />}
            value={filters.query}
            onChange={(event) => patch({ query: event.target.value })}
            containerClassName="md:col-span-2"
          />
          <Select
            label={t('job.crop')}
            value={filters.crop}
            onChange={(event) => patch({ crop: event.target.value as JobFilters['crop'] })}
          >
            <option value="all">{t('common.all')}</option>
            {CROPS.map((item) => (
              <option key={item.key} value={item.key}>
                {item.glyph} {item.label}
              </option>
            ))}
          </Select>
          <Select
            label={t('job.activity')}
            value={filters.activity}
            onChange={(event) => patch({ activity: event.target.value })}
          >
            <option value="all">{t('common.all')}</option>
            {JOB_ACTIVITIES.map((activity) => (
              <option key={activity} value={activity}>
                {activity}
              </option>
            ))}
          </Select>
          <Select
            label={t('job.district')}
            value={filters.district}
            onChange={(event) => patch({ district: event.target.value })}
          >
            <option value="all">{t('common.all')}</option>
            {DISTRICTS.map((district) => (
              <option key={district.name} value={district.name}>
                {district.name}, {district.state}
              </option>
            ))}
          </Select>
          <Select
            label="Sort by"
            value={sort}
            onChange={(event) => setSort(event.target.value as JobSort)}
          >
            <option value="newest">{t('job.sortNewest')}</option>
            <option value="wage">{t('job.sortWage')}</option>
            <option value="date">{t('job.sortDate')}</option>
          </Select>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink-700">{t('common.filters')}</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={filters.onlyVacancies}
                onClick={() => patch({ onlyVacancies: !filters.onlyVacancies })}
                className={cn(
                  'inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors',
                  filters.onlyVacancies
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300',
                )}
              >
                <Filter className="h-4 w-4" aria-hidden="true" />
                {t('job.vacanciesOnly')}
              </button>
              <button
                type="button"
                aria-pressed={scopeMine}
                onClick={() => patch({ scope: scopeMine ? 'all' : 'mine' })}
                className={cn(
                  'inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors',
                  scopeMine
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300',
                )}
              >
                {scopeLabelMine}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-500">
          <p>
            {t('job.showing')}{' '}
            <span className="font-semibold text-ink-900">{jobs.length}</span> {t('job.of')}{' '}
            <span className="font-semibold text-ink-900">{state.jobs.length}</span>{' '}
            {t('job.results')}
          </p>

          {filtersActive ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              leadingIcon={<RotateCcw className="h-4 w-4" />}
            >
              {t('common.clearFilters')}
            </Button>
          ) : null}
        </div>
      </Card>

      {jobs.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-6 w-6" />}
          title={t('job.noResults')}
          description={t('job.noResultsHint')}
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              {filtersActive ? (
                <Button variant="outline" onClick={clearFilters}>
                  {t('common.clearFilters')}
                </Button>
              ) : null}
              {isFarmer ? (
                <Button onClick={() => setPostOpen(true)} leadingIcon={<Plus className="h-4 w-4" />}>
                  {t('job.post')}
                </Button>
              ) : null}
            </div>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onEnroll={!isFarmer ? (target) => enroll(target) : undefined}
              onWithdraw={!isFarmer ? (target) => withdraw(target) : undefined}
            />
          ))}
        </div>
      )}

      <JobPostModal open={postOpen} onClose={() => setPostOpen(false)} />
    </div>
  )
}
