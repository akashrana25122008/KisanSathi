import { CROP_MAP, DISTRICTS } from '@/data'
import {
  PLANNER_CROP_KEYS,
  PLANNER_LIMITS,
  isPlannerCrop,
  stagesForCrop,
  type PlannerCropKey,
  type PlannerJobActivity,
  type PlannerLabourModel,
  type StageCategory,
} from '@/data/cropStages'
import { JOB_ACTIVITIES } from '@/lib/jobs'
import type { Profile } from '@/store/types'

/**
 * ---------------------------------------------------------------------------
 * Crop-to-Work Planner - deterministic planning engine
 * ---------------------------------------------------------------------------
 * All calculations run locally. A plan stores only the farmer's choices and
 * edits; the stage list is rebuilt from the crop template every time. That
 * keeps persisted data small and means a reload can never replace a farmer's
 * completed tasks, edited descriptions or custom tasks.
 *
 * The engine never produces fertiliser doses, pesticide instructions or yield
 * predictions. Dates are approximate and labour counts are illustrative demo
 * assumptions, clearly labelled in the UI.
 */

/* ---------------------------------------------------------------------------
   Types
   --------------------------------------------------------------------------- */

export interface PlannerTaskOverride {
  done?: boolean
  /** Farmer's own wording; shown in both UI languages. */
  description?: string
  /** yyyy-mm-dd. Moves the whole stage start date. */
  date?: string
}

export interface PlannerCustomTask {
  id: string
  name: string
  description: string
  /** yyyy-mm-dd */
  date: string
  /** Whole workers, or `null` when the farmer did not estimate a crew. */
  workers: number | null
  activity: PlannerJobActivity
  done: boolean
}

export interface PlannerPlan {
  id: string
  crop: PlannerCropKey
  areaAcres: number
  district: string
  /** Day 0: sowing, planting or nursery date (yyyy-mm-dd). */
  sowingDate: string
  createdAt: string
  overrides: Record<string, PlannerTaskOverride>
  customTasks: PlannerCustomTask[]
}

export interface PlannerFormValues {
  crop: string
  area: string
  district: string
  sowingDate: string
}

export interface PlannerInput {
  crop: PlannerCropKey
  areaAcres: number
  district: string
  sowingDate: string
}

export type PlannerErrorCode = 'required' | 'invalid' | 'range' | 'unsupported'

export interface PlannerValidation {
  crop?: PlannerErrorCode
  area?: PlannerErrorCode
  district?: PlannerErrorCode
  date?: PlannerErrorCode
}

export interface PlannerValidationResult {
  errors: PlannerValidation
  input?: PlannerInput
}

export interface PlannerLabour {
  workers: number
  durationDays: number
  /** Workers × days for this stage, if the full crew works the whole window. */
  workerDays: number
  /** Template value; `null` for a farmer-entered custom estimate. */
  workersPerAcre: number | null
  areaAcres: number
  /** True when the area-scaled crew was capped at the template maximum. */
  capped: boolean
  /** True when the template minimum crew was larger than the scaled result. */
  minApplied: boolean
  /** Template cap, or `null` for a farmer-entered estimate. */
  maxWorkers: number | null
  source: 'template' | 'farmer'
  noteEn?: string
  noteHi?: string
}

export interface PlannerTask {
  id: string
  /** Set for template stages, `null` for custom tasks. */
  templateId: string | null
  custom: boolean
  /** Template order (1-based). Custom tasks have no stage number. */
  stageNumber: number | null
  nameEn: string
  nameHi: string
  descriptionEn: string
  descriptionHi: string
  /** Farmer-edited description, when present. */
  descriptionOverride?: string
  startDate: string
  endDate: string
  defaultStartDate: string
  defaultDescriptionEn: string
  defaultDescriptionHi: string
  offsetDays: number
  durationDays: number
  category: StageCategory | 'custom'
  done: boolean
  labour: PlannerLabour | null
  jobActivity: PlannerJobActivity | null
  jobReady: boolean
}

export interface PlannerProgress {
  total: number
  done: number
  remaining: number
  percent: number
  workerDays: number
  crewEstimated: number
}

export interface PlannerJobPrefill {
  title?: string
  activity?: string
  crop?: PlannerCropKey
  village?: string
  district?: string
  workersRequired?: string
  /** Always blank: the farmer must choose the wage in the post form. */
  wagePerDay?: string
  workDate?: string
  durationDays?: string
  notes?: string
}

/* ---------------------------------------------------------------------------
   Date helpers
   --------------------------------------------------------------------------- */

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  if (month < 1 || month > 12 || day < 1 || day > 31) return false
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

export function todayISO(): string {
  const now = new Date()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const day = `${now.getDate()}`.padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function addDays(iso: string, days: number): string {
  if (!isValidISODate(iso)) return iso
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days))
  const nextMonth = `${date.getUTCMonth() + 1}`.padStart(2, '0')
  const nextDay = `${date.getUTCDate()}`.padStart(2, '0')
  return `${date.getUTCFullYear()}-${nextMonth}-${nextDay}`
}

/** Whole days from `from` to `to`; negative when `to` is earlier. */
export function diffDays(from: string, to: string): number {
  if (!isValidISODate(from) || !isValidISODate(to)) return 0
  const [fy, fm, fd] = from.split('-').map(Number)
  const [ty, tm, td] = to.split('-').map(Number)
  const a = Date.UTC(fy, fm - 1, fd)
  const b = Date.UTC(ty, tm - 1, td)
  return Math.round((b - a) / 86_400_000)
}

/** Locale-aware date label, without timezone drift. */
export function formatPlanDate(iso: string, language: 'en' | 'hi'): string {
  if (!isValidISODate(iso)) return iso
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function formatDateRange(
  start: string,
  end: string,
  language: 'en' | 'hi',
): string {
  if (start === end) return formatPlanDate(start, language)
  return `${formatPlanDate(start, language)} – ${formatPlanDate(end, language)}`
}

/** Whole-number formatting for acreage, wages and crew estimates. */
export function formatPlanNumber(value: number, language: 'en' | 'hi'): string {
  return new Intl.NumberFormat(language === 'hi' ? 'hi-IN' : 'en-IN', {
    maximumFractionDigits: 2,
  }).format(value)
}

/* ---------------------------------------------------------------------------
   Validation & plan creation
   --------------------------------------------------------------------------- */

const MIN_DATE_YEAR = 2000
const MAX_DATE_YEAR = 2100

export function validatePlannerInput(values: PlannerFormValues): PlannerValidationResult {
  const errors: PlannerValidation = {}

  const crop = values.crop.trim()
  if (!crop) errors.crop = 'required'
  else if (!isPlannerCrop(crop)) errors.crop = 'unsupported'

  const areaRaw = values.area.trim()
  const area = Number(areaRaw)
  if (!areaRaw) errors.area = 'required'
  else if (!Number.isFinite(area) || area <= 0) errors.area = 'invalid'
  else if (area < PLANNER_LIMITS.areaMin || area > PLANNER_LIMITS.areaMax) errors.area = 'range'

  const district = values.district.trim()
  if (!district) errors.district = 'required'
  else if (!DISTRICTS.some((item) => item.name === district)) errors.district = 'invalid'

  const sowingDate = values.sowingDate.trim()
  if (!sowingDate) errors.date = 'required'
  else if (!isValidISODate(sowingDate)) errors.date = 'invalid'
  else {
    const year = Number(sowingDate.slice(0, 4))
    if (year < MIN_DATE_YEAR || year > MAX_DATE_YEAR) errors.date = 'range'
  }

  if (Object.keys(errors).length > 0 || !isPlannerCrop(crop)) return { errors }

  return {
    errors,
    input: {
      crop,
      areaAcres: Math.round(area * 100) / 100,
      district,
      sowingDate,
    },
  }
}

export function createPlannerPlan(input: PlannerInput): PlannerPlan {
  return {
    id: `plan-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    crop: input.crop,
    areaAcres: Math.round(input.areaAcres * 100) / 100,
    district: input.district,
    sowingDate: input.sowingDate,
    createdAt: todayISO(),
    overrides: {},
    customTasks: [],
  }
}

/** Sensible starting values, reusing the profile where it maps cleanly. */
export function initialPlannerForm(
  plan: PlannerPlan | null,
  profile: Profile,
): PlannerFormValues {
  if (plan) {
    return {
      crop: plan.crop,
      area: String(plan.areaAcres),
      district: plan.district,
      sowingDate: plan.sowingDate,
    }
  }

  return {
    crop: isPlannerCrop(profile.preferredCrop) ? profile.preferredCrop : '',
    area: parseAreaFromLandHolding(profile.landHolding),
    district: DISTRICTS.some((item) => item.name === profile.district)
      ? profile.district
      : '',
    sowingDate: todayISO(),
  }
}

/** Reads the first number out of a free-text land holding such as "4.5 acres". */
export function parseAreaFromLandHolding(value: string): string {
  const match = value.match(/\d+(?:\.\d+)?/)
  if (!match) return ''
  const acres = Number(match[0])
  if (!Number.isFinite(acres) || acres < PLANNER_LIMITS.areaMin) return ''
  return String(Math.min(PLANNER_LIMITS.areaMax, Math.round(acres * 100) / 100))
}

/* ---------------------------------------------------------------------------
   Labour scaling
   --------------------------------------------------------------------------- */

function scaleTemplateLabour(
  model: PlannerLabourModel,
  areaAcres: number,
  durationDays: number,
): PlannerLabour {
  const raw = model.workersPerAcre * areaAcres
  // Small floating point guard so 2 × 3 does not ceil to 7.
  const roundedUp = Math.ceil(raw - 1e-9)
  const workers = Math.max(model.minWorkers, Math.min(model.maxWorkers, roundedUp))

  return {
    workers,
    durationDays,
    workerDays: workers * durationDays,
    workersPerAcre: model.workersPerAcre,
    areaAcres,
    capped: roundedUp > model.maxWorkers,
    minApplied: roundedUp < model.minWorkers,
    maxWorkers: model.maxWorkers,
    source: 'template',
    noteEn: model.noteEn,
    noteHi: model.noteHi,
  }
}

function customLabour(workers: number): PlannerLabour {
  return {
    workers,
    durationDays: 1,
    workerDays: workers,
    workersPerAcre: null,
    areaAcres: 0,
    capped: false,
    minApplied: false,
    maxWorkers: null,
    source: 'farmer',
  }
}

/* ---------------------------------------------------------------------------
   Task building
   --------------------------------------------------------------------------- */

export function buildPlannerTasks(plan: PlannerPlan): PlannerTask[] {
  const baseTasks: PlannerTask[] = stagesForCrop(plan.crop).map((stage, index) => {
    const override = plan.overrides[stage.id]
    const defaultStartDate = addDays(plan.sowingDate, stage.offsetDays)
    const startDate =
      override?.date && isValidISODate(override.date) ? override.date : defaultStartDate
    const endDate = addDays(startDate, stage.durationDays - 1)
    const labour = stage.labour
      ? scaleTemplateLabour(stage.labour, plan.areaAcres, stage.durationDays)
      : null

    return {
      id: stage.id,
      templateId: stage.id,
      custom: false,
      stageNumber: index + 1,
      nameEn: stage.nameEn,
      nameHi: stage.nameHi,
      descriptionEn: stage.descriptionEn,
      descriptionHi: stage.descriptionHi,
      descriptionOverride:
        override?.description && override.description.trim()
          ? override.description.trim()
          : undefined,
      startDate,
      endDate,
      defaultStartDate,
      defaultDescriptionEn: stage.descriptionEn,
      defaultDescriptionHi: stage.descriptionHi,
      offsetDays: diffDays(plan.sowingDate, startDate),
      durationDays: stage.durationDays,
      category: stage.category,
      done: override?.done === true,
      labour,
      jobActivity: stage.jobActivity,
      jobReady: stage.jobActivity !== null && labour !== null,
    }
  })

  const customTasks: PlannerTask[] = plan.customTasks.map((task) => ({
    id: task.id,
    templateId: null,
    custom: true,
    stageNumber: null,
    nameEn: task.name,
    nameHi: task.name,
    descriptionEn: task.description,
    descriptionHi: task.description,
    descriptionOverride: undefined,
    startDate: task.date,
    endDate: task.date,
    defaultStartDate: task.date,
    defaultDescriptionEn: task.description,
    defaultDescriptionHi: task.description,
    offsetDays: diffDays(plan.sowingDate, task.date),
    durationDays: 1,
    category: 'custom',
    done: task.done,
    labour: task.workers !== null ? customLabour(task.workers) : null,
    jobActivity: task.workers !== null ? task.activity : null,
    jobReady: task.workers !== null && task.workers > 0,
  }))

  return [...baseTasks, ...customTasks].sort(
    (a, b) =>
      a.startDate.localeCompare(b.startDate) ||
      (a.stageNumber ?? 999) - (b.stageNumber ?? 999) ||
      a.nameEn.localeCompare(b.nameEn),
  )
}

export function plannerProgress(tasks: PlannerTask[]): PlannerProgress {
  const total = tasks.length
  const done = tasks.filter((task) => task.done).length
  return {
    total,
    done,
    remaining: total - done,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
    workerDays: tasks.reduce((sum, task) => sum + (task.labour?.workerDays ?? 0), 0),
    crewEstimated: tasks.filter((task) => task.labour !== null).length,
  }
}

/** The next incomplete tasks in date order, including any overdue work. */
export function upcomingTasks(tasks: PlannerTask[], limit = 3): PlannerTask[] {
  return tasks
    .filter((task) => !task.done)
    .sort(
      (a, b) =>
        a.startDate.localeCompare(b.startDate) ||
        (a.stageNumber ?? 999) - (b.stageNumber ?? 999),
    )
    .slice(0, limit)
}

/** First start to last end, inclusive. */
export function planSpanDays(tasks: PlannerTask[]): number {
  if (tasks.length === 0) return 0
  const start = tasks.reduce(
    (earliest, task) => (task.startDate < earliest ? task.startDate : earliest),
    tasks[0].startDate,
  )
  const end = tasks.reduce(
    (latest, task) => (task.endDate > latest ? task.endDate : latest),
    tasks[0].endDate,
  )
  return diffDays(start, end) + 1
}

/* ---------------------------------------------------------------------------
   Custom tasks
   --------------------------------------------------------------------------- */

export function makeCustomTaskId(): string {
  return `task-custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export interface NewCustomTaskInput {
  name: string
  description: string
  date: string
  workers: number | null
  activity: PlannerJobActivity
}

export function createCustomTask(input: NewCustomTaskInput): PlannerCustomTask {
  return {
    id: makeCustomTaskId(),
    name: input.name.trim().slice(0, 80),
    description: input.description.trim().slice(0, 400),
    date: input.date,
    workers: input.workers,
    activity: input.activity,
    done: false,
  }
}

/* ---------------------------------------------------------------------------
   Job marketplace bridge
   --------------------------------------------------------------------------- */

/**
 * Builds the prefill for the existing `JobPostModal`.
 *
 * Known values are passed through. The daily wage is deliberately blank - labour
 * rates vary by place and season, so the farmer must set it in the form rather
 * than receiving a made-up number.
 */
export function taskToJobPrefill(
  task: PlannerTask,
  plan: PlannerPlan,
  profile: Profile,
): PlannerJobPrefill {
  if (!task.jobReady || !task.labour) return {}

  const cropLabel = CROP_MAP[plan.crop].label
  const title = `${cropLabel} ${task.nameEn}`.slice(0, 80)
  const description = task.descriptionOverride ?? task.descriptionEn
  const notes = [description, '', `From the ${cropLabel} crop plan. Dates and crew are approximate - confirm before publishing.`]
    .join('\n')
    .slice(0, 400)

  return {
    title,
    activity: task.jobActivity ?? undefined,
    crop: plan.crop,
    village: profile.village.trim() || undefined,
    district: plan.district,
    workersRequired: String(task.labour.workers),
    wagePerDay: '',
    // A past task date is not silently moved. The post form opens on its own
    // default date so the farmer explicitly chooses a future work date.
    workDate: task.startDate >= todayISO() ? task.startDate : undefined,
    durationDays: String(Math.min(60, Math.max(1, task.durationDays))),
    notes,
  }
}

/* ---------------------------------------------------------------------------
   Persistence safety
   --------------------------------------------------------------------------- */

const PLAN_ACTIVITIES = new Set<string>(JOB_ACTIVITIES)
const PLANNER_CROP_SET = new Set<string>(PLANNER_CROP_KEYS)
const DISTRICT_SET = new Set(DISTRICTS.map((district) => district.name))

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function sanitizeOverride(value: unknown): PlannerTaskOverride | null {
  if (!isRecord(value)) return null
  const override: PlannerTaskOverride = {}

  if (value.done === true) override.done = true
  else if (value.done === false) override.done = false

  if (typeof value.description === 'string') {
    const description = value.description.trim().slice(0, 600)
    if (description) override.description = description
  }

  if (typeof value.date === 'string' && isValidISODate(value.date)) {
    override.date = value.date
  }

  return Object.keys(override).length > 0 ? override : null
}

function sanitizeCustomTask(value: unknown): PlannerCustomTask | null {
  if (!isRecord(value)) return null

  const id = asString(value.id).trim()
  const name = asString(value.name).trim().slice(0, 80)
  const date = asString(value.date)
  if (!id || !name || !isValidISODate(date)) return null
  const year = Number(date.slice(0, 4))
  if (year < MIN_DATE_YEAR || year > MAX_DATE_YEAR) return null

  const activityRaw = asString(value.activity)
  const workersRaw = value.workers
  const numericWorkers =
    workersRaw === null || workersRaw === undefined || workersRaw === ''
      ? null
      : Number(workersRaw)
  const workers =
    numericWorkers !== null && Number.isFinite(numericWorkers)
      ? clampNumber(Math.round(numericWorkers), 1, 100)
      : null

  return {
    id,
    name,
    description: asString(value.description).trim().slice(0, 400),
    date,
    workers,
    activity: PLAN_ACTIVITIES.has(activityRaw)
      ? (activityRaw as PlannerJobActivity)
      : 'Weeding',
    done: value.done === true,
  }
}

/**
 * Rebuilds a plan from untrusted localStorage data. A plan that cannot be
 * understood is dropped; impossible values are clamped rather than crashing
 * the planner.
 */
export function sanitizePlanner(value: unknown): PlannerPlan | null {
  if (!isRecord(value)) return null

  const crop = asString(value.crop)
  if (!PLANNER_CROP_SET.has(crop) || !isPlannerCrop(crop)) return null

  const rawArea = Number(value.areaAcres)
  const areaAcres = Number.isFinite(rawArea)
    ? clampNumber(Math.round(rawArea * 100) / 100, PLANNER_LIMITS.areaMin, PLANNER_LIMITS.areaMax)
    : 1

  const districtRaw = asString(value.district)
  const district = DISTRICT_SET.has(districtRaw) ? districtRaw : DISTRICTS[0].name

  const sowingRaw = asString(value.sowingDate)
  const sowingDate = isValidISODate(sowingRaw) ? sowingRaw : todayISO()

  const createdAtRaw = asString(value.createdAt)
  const createdAt = isValidISODate(createdAtRaw) ? createdAtRaw : todayISO()

  const stageIds = new Set(stagesForCrop(crop).map((stage) => stage.id))
  const overrides: Record<string, PlannerTaskOverride> = {}
  if (isRecord(value.overrides)) {
    for (const [taskId, raw] of Object.entries(value.overrides)) {
      if (!stageIds.has(taskId)) continue
      const override = sanitizeOverride(raw)
      if (override) overrides[taskId] = override
    }
  }

  const customTasks: PlannerCustomTask[] = []
  const seenCustomIds = new Set<string>()
  if (Array.isArray(value.customTasks)) {
    for (const entry of value.customTasks) {
      if (customTasks.length >= PLANNER_LIMITS.maxCustomTasks) break
      const task = sanitizeCustomTask(entry)
      if (!task || seenCustomIds.has(task.id)) continue
      seenCustomIds.add(task.id)
      customTasks.push(task)
    }
  }

  return {
    id: asString(value.id).trim() || `plan-${crop}-${sowingDate}`,
    crop,
    areaAcres,
    district,
    sowingDate,
    createdAt,
    overrides,
    customTasks,
  }
}
