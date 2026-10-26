import type { PlannerPlan } from '@/lib/planner'

export type Role = 'farmer' | 'worker'

export type UiLanguage = 'hi' | 'en'

export type CropKey =
  | 'wheat'
  | 'paddy'
  | 'cotton'
  | 'sugarcane'
  | 'maize'
  | 'soybean'
  | 'mustard'
  | 'tomato'
  | 'onion'
  | 'chilli'
  | 'potato'
  | 'groundnut'

export type JobStatus = 'open' | 'filled' | 'completed'

export type GenderPreference = 'any' | 'male' | 'female'

export interface Job {
  id: string
  title: string
  titleHi: string
  activity: string
  crop: CropKey
  farmName: string
  village: string
  district: string
  state: string
  /** Total workers the farmer wants on site. */
  workersRequired: number
  /** Worker ids already enrolled for this job. */
  enrolledWorkerIds: string[]
  wagePerDay: number
  /** `yyyy-mm-dd` */
  workDate: string
  startTime: string
  durationDays: number
  amenities: string[]
  genderPreference: GenderPreference
  notes: string
  /**
   * Free-text description shown on cards and the detail page. Optional so
   * that records persisted by earlier versions of the prototype still load;
   * `notes` is used as the fallback.
   */
  description?: string
  postedBy: string
  postedAt: string
  status: JobStatus
  /** Every record in this prototype is illustrative sample data. */
  isSample: boolean
}

export interface Worker {
  id: string
  name: string
  village: string
  district: string
  skills: string[]
  rating: number
  completedJobs: number
  languages: string[]
  phone: string
  /** Tailwind-friendly colour token used for the avatar chip. */
  accent: string
}

export interface Profile {
  name: string
  village: string
  district: string
  state: string
  landHolding: string
  phone: string
  phoneVerified?: boolean
  languages: string[]
  preferredCrop: CropKey | ''
  photoUrl?: string
}

export interface Activity {
  id: string
  title: string
  titleHi: string
  date: string
  crop: CropKey
  cropLabel: string
  detail: string
  workers: number
  kind: 'sowing' | 'spraying' | 'scouting' | 'irrigation' | 'harvest' | 'weeding'
}

export interface AppState {
  role: Role
  language: UiLanguage
  profile: Profile
  jobs: Job[]
  activities: Activity[]
  /** Ids of jobs the current demo worker has enrolled in. */
  myEnrollments: string[]
  /** The farmer's active crop plan, including their edits and custom tasks. */
  planner: PlannerPlan | null
}
