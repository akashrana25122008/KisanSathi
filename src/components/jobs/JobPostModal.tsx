import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Check } from 'lucide-react'

import { cn } from '@/lib/cn'
import { CROP_MAP, CROPS, DISTRICTS } from '@/data'
import { JOB_ACTIVITIES } from '@/lib/jobs'
import { useT } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { useApp } from '@/store/AppContext'
import type { CropKey, Job, Profile } from '@/store/types'

const AMENITIES = ['Chai', 'Paani', 'Meal', 'Transport', 'Medical kit']

/** Sensible limits so a typo cannot create an impossible job. */
const JOB_LIMITS = {
  workers: { min: 1, max: 100 },
  wage: { min: 1, max: 10000 },
  duration: { min: 1, max: 60 },
  description: 400,
} as const

export interface FormState {
  title: string
  activity: string
  crop: CropKey
  village: string
  district: string
  workersRequired: string
  wagePerDay: string
  workDate: string
  startTime: string
  durationDays: string
  amenities: string[]
  notes: string
}

function todayISO(): string {
  const now = new Date()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const day = `${now.getDate()}`.padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function emptyForm(profile: Profile): FormState {
  return {
    title: '',
    activity: 'Harvesting',
    crop: profile.preferredCrop || 'wheat',
    village: profile.village || 'Barkatpur',
    district: profile.district || 'Rampur',
    workersRequired: '8',
    wagePerDay: '450',
    workDate: todayISO(),
    startTime: '06:00',
    durationDays: '2',
    amenities: ['Chai', 'Paani'],
    notes: '',
  }
}

/** Unique, collision-proof id for a farmer-created job. */
function createJobId(): string {
  const stamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 8)
  return `job-${stamp}-${random}`
}

/**
 * Drops `undefined` entries from a prefill.
 *
 * `{ ...defaults, ...prefill }` would otherwise overwrite a valid default with
 * `undefined` (for example when a caller only supplies the fields it knows),
 * which then crashes on `.trim()`. Callers can now pass partial objects freely.
 */
function definedPrefill(prefill?: Partial<FormState>): Partial<FormState> {
  if (!prefill) return {}
  return Object.fromEntries(
    Object.entries(prefill).filter(([, value]) => value !== undefined),
  ) as Partial<FormState>
}

export interface JobPostModalProps {
  open: boolean
  onClose: () => void
  /** Optional prefill, e.g. when a crop-plan stage is converted into a job. */
  prefill?: Partial<FormState>
}

export function JobPostModal({ open, onClose, prefill }: JobPostModalProps) {
  const { state, dispatch } = useApp()
  const t = useT()
  const toast = useToast()
  const [form, setForm] = useState<FormState>({
    ...emptyForm(state.profile),
    ...definedPrefill(prefill),
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [publishing, setPublishing] = useState(false)
  /**
   * Guards against a double click publishing the same job twice. A ref is
   * used on purpose: the flag has to be set synchronously, before React has
   * re-rendered, otherwise the second click still sees `false`.
   */
  const publishingRef = useRef(false)

  // Always open on a clean form - a cancelled post must not leak into the
  // next one. `prefill` is a stable literal at every call site, so it is
  // intentionally not part of the dependency list.
  useEffect(() => {
    if (!open) return
    setForm({ ...emptyForm(state.profile), ...definedPrefill(prefill) })
    setErrors({})
    setPublishing(false)
    publishingRef.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const selectedDistrict = useMemo(
    () => DISTRICTS.find((district) => district.name === form.district),
    [form.district],
  )

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key as string]) return current
      const next = { ...current }
      delete next[key as string]
      return next
    })
  }

  const toggleAmenity = (amenity: string) => {
    setForm((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity],
    }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    // A second click (or an Enter key right after the first) must not create
    // a second copy of the same job post.
    if (publishingRef.current) return
    const nextErrors: Record<string, string> = {}

    const title = form.title.trim()
    if (!title) {
      nextErrors.title = 'Give the job a short, clear title.'
    } else if (title.length < 5) {
      nextErrors.title = 'Use at least 5 characters so workers recognise the job.'
    } else if (title.length > 80) {
      nextErrors.title = 'Keep the title under 80 characters.'
    }

    const village = form.village.trim()
    if (!village) {
      nextErrors.village = 'Enter the village name.'
    } else if (village.length > 60) {
      nextErrors.village = 'Keep the village name under 60 characters.'
    }

    if (!form.district) {
      nextErrors.district = 'Choose a district.'
    }

    const workers = Number(form.workersRequired)
    if (!Number.isFinite(workers) || !Number.isInteger(workers)) {
      nextErrors.workersRequired = 'Enter a whole number of workers.'
    } else if (workers < JOB_LIMITS.workers.min) {
      nextErrors.workersRequired = `At least ${JOB_LIMITS.workers.min} worker is required.`
    } else if (workers > JOB_LIMITS.workers.max) {
      nextErrors.workersRequired = `A single job can need at most ${JOB_LIMITS.workers.max} workers.`
    }

    const wage = Number(form.wagePerDay)
    if (!Number.isFinite(wage) || !Number.isInteger(wage)) {
      nextErrors.wagePerDay = 'Enter a whole number of rupees.'
    } else if (wage < JOB_LIMITS.wage.min) {
      nextErrors.wagePerDay = `The daily wage must be at least ₹${JOB_LIMITS.wage.min}.`
    } else if (wage > JOB_LIMITS.wage.max) {
      nextErrors.wagePerDay = `The daily wage must be at most ₹${JOB_LIMITS.wage.max}.`
    }

    const duration = Number(form.durationDays)
    if (!Number.isFinite(duration) || !Number.isInteger(duration)) {
      nextErrors.durationDays = 'Enter a whole number of days.'
    } else if (duration < JOB_LIMITS.duration.min) {
      nextErrors.durationDays = 'The work lasts at least 1 day.'
    } else if (duration > JOB_LIMITS.duration.max) {
      nextErrors.durationDays = `The work can run for at most ${JOB_LIMITS.duration.max} days.`
    }

    if (!form.workDate) {
      nextErrors.workDate = 'Pick a start date.'
    } else if (form.workDate < todayISO()) {
      nextErrors.workDate = 'The start date cannot be in the past.'
    }

    if (form.notes.trim().length > JOB_LIMITS.description) {
      nextErrors.notes = `Keep the description under ${JOB_LIMITS.description} characters.`
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      toast.error('Please fix the highlighted fields', 'Some job details are missing.')
      return
    }

    const crop = CROP_MAP[form.crop]
    const description = form.notes.trim()

    const job: Job = {
      id: createJobId(),
      title,
      titleHi: title,
      activity: form.activity,
      crop: form.crop,
      farmName: `${state.profile.name.split(' ')[0] ?? 'My'} Farm`,
      village,
      district: form.district,
      state: selectedDistrict?.state ?? 'Uttar Pradesh',
      workersRequired: workers,
      enrolledWorkerIds: [],
      wagePerDay: wage,
      workDate: form.workDate,
      startTime: form.startTime || '06:00',
      durationDays: duration,
      amenities: form.amenities,
      genderPreference: 'any',
      notes: description,
      description,
      postedBy: state.profile.name,
      postedAt: todayISO(),
      status: 'open',
      isSample: false,
    }

    dispatch({ type: 'CREATE_JOB', job })
    publishingRef.current = true
    setPublishing(true)
    toast.success(
      'Job posted',
      `${workers} worker${workers > 1 ? 's' : ''} needed for ${crop.label.toLowerCase()} ${form.activity.toLowerCase()}.`,
    )
    setForm({ ...emptyForm(state.profile), ...definedPrefill(prefill) })
    setErrors({})
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('job.post')}
      description="Tell nearby workers what is needed, how many people, and what you will pay."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} type="submit" form="job-post-form" disabled={publishing}>
            Publish job
          </Button>
        </>
      }
    >
      <form id="job-post-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Input
          label="Job title"
          placeholder="e.g. Wheat harvesting support needed"
          required
          maxLength={80}
          value={form.title}
          error={errors.title}
          onChange={(event) => set('title', event.target.value)}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            label="Activity"
            value={form.activity}
            onChange={(event) => set('activity', event.target.value)}
          >
            {JOB_ACTIVITIES.map((activity) => (
              <option key={activity} value={activity}>
                {activity}
              </option>
            ))}
          </Select>

          <Select
            label="Crop"
            value={form.crop}
            onChange={(event) => set('crop', event.target.value as CropKey)}
          >
            {CROPS.map((crop) => (
              <option key={crop.key} value={crop.key}>
                {crop.glyph} {crop.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Village"
            required
            maxLength={60}
            value={form.village}
            error={errors.village}
            onChange={(event) => set('village', event.target.value)}
          />
          <Select
            label="District"
            required
            value={form.district}
            error={errors.district}
            onChange={(event) => set('district', event.target.value)}
          >
            {DISTRICTS.map((district) => (
              <option key={district.name} value={district.name}>
                {district.name}, {district.state}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Input
            label="Workers needed"
            type="number"
            inputMode="numeric"
            min={JOB_LIMITS.workers.min}
            max={JOB_LIMITS.workers.max}
            required
            value={form.workersRequired}
            error={errors.workersRequired}
            onChange={(event) => set('workersRequired', event.target.value)}
          />
          <Input
            label="Daily wage (₹)"
            type="number"
            inputMode="numeric"
            min={JOB_LIMITS.wage.min}
            max={JOB_LIMITS.wage.max}
            step={10}
            required
            value={form.wagePerDay}
            error={errors.wagePerDay}
            onChange={(event) => set('wagePerDay', event.target.value)}
          />
          <Input
            label="Duration (days)"
            type="number"
            inputMode="numeric"
            min={JOB_LIMITS.duration.min}
            max={JOB_LIMITS.duration.max}
            required
            value={form.durationDays}
            error={errors.durationDays}
            onChange={(event) => set('durationDays', event.target.value)}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Work date"
            type="date"
            min={todayISO()}
            required
            value={form.workDate}
            error={errors.workDate}
            onChange={(event) => set('workDate', event.target.value)}
          />
          <Input
            label="Start time"
            type="time"
            value={form.startTime}
            onChange={(event) => set('startTime', event.target.value)}
          />
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink-700">Facilities on site</legend>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((amenity) => {
              const active = form.amenities.includes(amenity)
              return (
                <button
                  key={amenity}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleAmenity(amenity)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                    active
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300',
                  )}
                >
                  {active ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                  {amenity}
                </button>
              )
            })}
          </div>
        </fieldset>

        <Textarea
          label="Job description (optional)"
          placeholder="What should a worker bring? Any special instructions?"
          hint={`${form.notes.trim().length}/${JOB_LIMITS.description} characters`}
          error={errors.notes}
          maxLength={JOB_LIMITS.description}
          value={form.notes}
          onChange={(event) => set('notes', event.target.value)}
        />
      </form>
    </Modal>
  )
}
