import { CROP_MAP } from '@/data'
import { vacanciesOf } from '@/store/appReducer'
import type { CropKey, Job, JobStatus } from '@/store/types'

/**
 * ---------------------------------------------------------------------------
 * Shared job-domain helpers
 * ---------------------------------------------------------------------------
 * The marketplace has three screens (home, board and detail) that all need the
 * same filtering, sorting and safety rules. Keeping them here means a job
 * looks and behaves identically wherever it is rendered, and the rules are
 * only written once.
 */

/** Every farm activity a job can be posted for. */
export const JOB_ACTIVITIES = [
  'Harvesting',
  'Weeding',
  'Transplanting',
  'Sowing',
  'Irrigation',
  'Picking',
  'Threshing',
  'Spraying',
] as const

export type JobSort = 'newest' | 'wage' | 'date'

export type JobScope = 'all' | 'mine'

export interface JobFilters {
  /** Free-text search over title, crop, activity and location. */
  query: string
  crop: CropKey | 'all'
  activity: string
  district: string
  /** Only show jobs that still have room on the crew. */
  onlyVacancies: boolean
  /** `mine` = jobs I posted (farmer) or applied for (worker). */
  scope: JobScope
}

export const DEFAULT_JOB_FILTERS: JobFilters = {
  query: '',
  crop: 'all',
  activity: 'all',
  district: 'all',
  onlyVacancies: false,
  scope: 'all',
}

/** True when anything other than the default scope is applied. */
export function isJobFilterActive(filters: JobFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.crop !== 'all' ||
    filters.activity !== 'all' ||
    filters.district !== 'all' ||
    filters.onlyVacancies
  )
}

/** All text a job can be found by. */
function searchableText(job: Job): string {
  const crop = CROP_MAP[job.crop]
  return [
    job.title,
    job.titleHi,
    job.description ?? job.notes,
    crop.label,
    crop.labelHi,
    job.activity,
    job.farmName,
    job.village,
    job.district,
    job.state,
    job.postedBy,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

/** Title, crop or location - the three things a farmer or worker types. */
export function matchesJobQuery(job: Job, query: string): boolean {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return true
  return searchableText(job).includes(trimmed)
}

/**
 * Applies the marketplace filters. `myJobIds` carries the ids that belong to
 * the signed-in user for the current role (jobs I posted as a farmer, jobs I
 * applied for as a worker) so the same helper serves both roles.
 */
export function filterJobs(
  jobs: Job[],
  filters: JobFilters,
  options: { myJobIds?: string[] } = {},
): Job[] {
  const myJobIds = options.myJobIds ?? []

  return jobs.filter((job) => {
    if (filters.scope === 'mine' && !myJobIds.includes(job.id)) return false
    if (!matchesJobQuery(job, filters.query)) return false
    if (filters.crop !== 'all' && job.crop !== filters.crop) return false
    if (filters.activity !== 'all' && job.activity !== filters.activity) return false
    if (filters.district !== 'all' && job.district !== filters.district) return false
    if (filters.onlyVacancies && vacanciesOf(job) <= 0) return false

    return true
  })
}

export function sortJobs(jobs: Job[], sort: JobSort): Job[] {
  return [...jobs].sort((a, b) => {
    if (sort === 'wage') return b.wagePerDay - a.wagePerDay
    if (sort === 'date') return a.workDate.localeCompare(b.workDate)
    return b.postedAt.localeCompare(a.postedAt)
  })
}

/** The description text for a job, falling back to legacy `notes`. */
export function jobDescription(job: Job): string {
  return job.description ?? job.notes ?? ''
}

/* ---------------------------------------------------------------------------
   Persistence safety
   --------------------------------------------------------------------------- */

const CROP_KEYS = new Set<string>(Object.keys(CROP_MAP))
const JOB_STATUSES = new Set<JobStatus>(['open', 'filled', 'completed'])
const GENDER_PREFERENCES = new Set(['any', 'male', 'female'])

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric)) return fallback
  return Math.min(max, Math.max(min, Math.round(numeric)))
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

/**
 * Rebuilds a job from unknown persisted data. Malformed records are dropped
 * (`null`) and impossible values are clamped, so a corrupted localStorage
 * entry can never crash the marketplace.
 */
export function sanitizeJob(value: unknown): Job | null {
  if (typeof value !== 'object' || value === null) return null

  const raw = value as Record<string, unknown>
  const id = asString(raw.id).trim()
  const title = asString(raw.title).trim()
  if (!id || !title) return null

  const crop = asString(raw.crop)
  const workersRequired = clampInt(raw.workersRequired, 1, 100, 1)

  // Never keep more enrolled workers than the job has seats.
  const enrolledWorkerIds = Array.from(
    new Set(asStringArray(raw.enrolledWorkerIds)),
  ).slice(0, workersRequired)

  const status = asString(raw.status) as JobStatus

  return {
    id,
    title,
    titleHi: asString(raw.titleHi, title) || title,
    activity: asString(raw.activity, 'Harvesting') || 'Harvesting',
    crop: CROP_KEYS.has(crop) ? (crop as CropKey) : 'wheat',
    farmName: asString(raw.farmName, 'Local farm') || 'Local farm',
    village: asString(raw.village, 'Unknown village') || 'Unknown village',
    district: asString(raw.district, 'Unknown district') || 'Unknown district',
    state: asString(raw.state, 'Uttar Pradesh') || 'Uttar Pradesh',
    workersRequired,
    enrolledWorkerIds,
    wagePerDay: clampInt(raw.wagePerDay, 1, 100000, 1),
    workDate: asString(raw.workDate, '2026-01-01') || '2026-01-01',
    startTime: asString(raw.startTime, '06:00') || '06:00',
    durationDays: clampInt(raw.durationDays, 1, 60, 1),
    amenities: asStringArray(raw.amenities),
    genderPreference: GENDER_PREFERENCES.has(asString(raw.genderPreference))
      ? (asString(raw.genderPreference) as Job['genderPreference'])
      : 'any',
    notes: asString(raw.notes),
    description:
      typeof raw.description === 'string' ? raw.description : undefined,
    postedBy: asString(raw.postedBy, 'Unknown farmer') || 'Unknown farmer',
    postedAt: asString(raw.postedAt, '2026-01-01') || '2026-01-01',
    status: JOB_STATUSES.has(status) ? status : 'open',
    isSample: raw.isSample === true,
  }
}

/** Sanitizes a whole list, dropping records that cannot be repaired. */
export function sanitizeJobs(value: unknown): Job[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const jobs: Job[] = []

  for (const entry of value) {
    const job = sanitizeJob(entry)
    if (!job || seen.has(job.id)) continue
    seen.add(job.id)
    jobs.push(job)
  }

  return jobs
}
