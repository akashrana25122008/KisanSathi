import { SAMPLE_ACTIVITIES, SAMPLE_JOBS } from '@/data'
import type {
  PlannerCustomTask,
  PlannerPlan,
  PlannerTaskOverride,
} from '@/lib/planner'
import type { AppState, Job, Profile, Role, UiLanguage } from '@/store/types'

/** The demo account that the prototype is signed in as. */
export const CURRENT_WORKER_ID = 'w-self'

export const EMPTY_PROFILE: Profile = {
  name: '',
  village: '',
  district: '',
  state: '',
  landHolding: '',
  phone: '',
  phoneVerified: false,
  languages: ['Hindi', 'English'],
  preferredCrop: '',
  photoUrl: '',
}

export const DEFAULT_PROFILE: Profile = EMPTY_PROFILE

export const initialState: AppState = {
  role: 'farmer',
  language: 'en',
  profile: DEFAULT_PROFILE,
  jobs: SAMPLE_JOBS,
  activities: SAMPLE_ACTIVITIES,
  myEnrollments: [],
  planner: null,
}

export type Action =
  | { type: 'SET_ROLE'; role: Role }
  | { type: 'SET_LANGUAGE'; language: UiLanguage }
  | { type: 'ENROLL'; jobId: string }
  | { type: 'WITHDRAW'; jobId: string }
  | { type: 'CREATE_JOB'; job: Job }
  | { type: 'UPDATE_PROFILE'; profile: Partial<Profile> }
  | { type: 'HYDRATE_PROFILE'; profile: Profile; language?: UiLanguage }
  | { type: 'CLEAR_SESSION' }
  | { type: 'SET_PLAN'; plan: PlannerPlan }
  | {
      type: 'UPDATE_PLAN_TASK'
      taskId: string
      patch: PlannerTaskOverride
    }
  | { type: 'ADD_CUSTOM_TASK'; task: PlannerCustomTask }
  | {
      type: 'UPDATE_CUSTOM_TASK'
      taskId: string
      patch: Partial<Omit<PlannerCustomTask, 'id'>>
    }
  | { type: 'REMOVE_CUSTOM_TASK'; taskId: string }
  | { type: 'CLEAR_PLAN' }
  | { type: 'RESET_DEMO' }

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, role: action.role }

    case 'SET_LANGUAGE':
      return { ...state, language: action.language }

    case 'ENROLL': {
      // The reducer is the last line of defence for the enrollment rules:
      // no duplicates, no enrolling in a closed job and never overfilling a
      // job - even if two clicks land before React re-renders.
      if (state.myEnrollments.includes(action.jobId)) return state

      const target = state.jobs.find((job) => job.id === action.jobId)
      if (!target) return state
      if (target.status !== 'open') return state
      if (target.enrolledWorkerIds.includes(CURRENT_WORKER_ID)) return state
      if (target.enrolledWorkerIds.length >= target.workersRequired) return state

      return {
        ...state,
        myEnrollments: [...state.myEnrollments, action.jobId],
        jobs: state.jobs.map((job) =>
          job.id === action.jobId
            ? { ...job, enrolledWorkerIds: [...job.enrolledWorkerIds, CURRENT_WORKER_ID] }
            : job,
        ),
      }
    }

    case 'WITHDRAW': {
      if (!state.myEnrollments.includes(action.jobId)) return state
      return {
        ...state,
        myEnrollments: state.myEnrollments.filter((id) => id !== action.jobId),
        jobs: state.jobs.map((job) =>
          job.id === action.jobId
            ? {
                ...job,
                enrolledWorkerIds: job.enrolledWorkerIds.filter(
                  (id) => id !== CURRENT_WORKER_ID,
                ),
              }
            : job,
        ),
      }
    }

    case 'CREATE_JOB':
      return { ...state, jobs: [action.job, ...state.jobs] }

    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.profile } }

    case 'HYDRATE_PROFILE':
      return {
        ...state,
        profile: action.profile,
        language: action.language ?? state.language,
      }

    case 'CLEAR_SESSION':
      return {
        ...state,
        profile: EMPTY_PROFILE,
        myEnrollments: [],
        planner: null,
      }

    case 'SET_PLAN':
      return { ...state, planner: action.plan }

    case 'UPDATE_PLAN_TASK': {
      if (!state.planner) return state
      return {
        ...state,
        planner: {
          ...state.planner,
          overrides: {
            ...state.planner.overrides,
            [action.taskId]: {
              ...state.planner.overrides[action.taskId],
              ...action.patch,
            },
          },
        },
      }
    }

    case 'ADD_CUSTOM_TASK': {
      if (!state.planner) return state
      return {
        ...state,
        planner: {
          ...state.planner,
          customTasks: [...state.planner.customTasks, action.task],
        },
      }
    }

    case 'UPDATE_CUSTOM_TASK': {
      if (!state.planner) return state
      return {
        ...state,
        planner: {
          ...state.planner,
          customTasks: state.planner.customTasks.map((task) =>
            task.id === action.taskId ? { ...task, ...action.patch } : task,
          ),
        },
      }
    }

    case 'REMOVE_CUSTOM_TASK': {
      if (!state.planner) return state
      return {
        ...state,
        planner: {
          ...state.planner,
          customTasks: state.planner.customTasks.filter(
            (task) => task.id !== action.taskId,
          ),
        },
      }
    }

    case 'CLEAR_PLAN':
      return { ...state, planner: null }

    case 'RESET_DEMO':
      return {
        ...initialState,
        role: state.role,
        language: state.language,
        profile: state.profile,
      }

    default:
      return state
  }
}

/* ---------------------------------------------------------------------------
   Selectors
--------------------------------------------------------------------------- */

/** Remaining positions on a job = required minus enrolled. */
export function vacanciesOf(job: Job): number {
  return Math.max(0, job.workersRequired - job.enrolledWorkerIds.length)
}

/** Percentage of the crew that is already enrolled (0-100). */
export function filledPercentOf(job: Job): number {
  if (job.workersRequired <= 0) return 100
  return Math.round((job.enrolledWorkerIds.length / job.workersRequired) * 100)
}

/**
 * The enrollment state of the signed-in demo worker for a given job.
 * Shared by the cards, the detail page and the action hook so every view
 * agrees on what the worker can do next.
 */
export type EnrollmentStatus = 'enrolled' | 'full' | 'closed' | 'available'

export function enrollmentStatusOf(
  job: Job,
  myEnrollments: string[],
): EnrollmentStatus {
  if (myEnrollments.includes(job.id)) return 'enrolled'
  if (job.status !== 'open') return 'closed'
  if (vacanciesOf(job) <= 0) return 'full'
  return 'available'
}
