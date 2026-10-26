import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'

import { CROPS } from '@/data'
import { readStored, writeStored } from '@/hooks/useLocalStorage'
import { sanitizeJobs } from '@/lib/jobs'
import { sanitizePlanner } from '@/lib/planner'
import { useAuth } from '@/store/AuthContext'
import { appReducer, CURRENT_WORKER_ID, initialState, type Action } from '@/store/appReducer'
import type { AppState, CropKey, Profile } from '@/store/types'
import type { AuthUser } from '@/lib/api'

function cropKeyOf(value: string): CropKey | '' {
  return CROPS.some((crop) => crop.key === value) ? (value as CropKey) : ''
}

function profileFromUser(user: AuthUser): Profile {
  return {
    name: user.name,
    village: user.village,
    district: user.district,
    state: user.state,
    landHolding: user.landSize,
    phone: user.phoneDisplay || user.phone,
    phoneVerified: true,
    languages: user.language === 'hi' ? ['Hindi', 'English'] : ['English', 'Hindi'],
    preferredCrop: cropKeyOf(user.primaryCrop),
    photoUrl: user.photoUrl,
  }
}

const STORAGE_KEY = 'kisansathi:v1'
const SCHEMA_VERSION = 2
/** v1 payloads predate the crop planner and are safely migrated on load. */
const SUPPORTED_VERSIONS = new Set([1, SCHEMA_VERSION])

interface PersistedShape {
  version: number
  state: Partial<AppState>
}

/**
 * Restores a previous session.
 *
 * Persisted demo data is treated as untrusted input: malformed jobs are
 * dropped, impossible crew sizes are clamped and the enrollment list is
 * repaired so it always agrees with the jobs it points at. A corrupted
 * localStorage entry can therefore never break the marketplace.
 */
function loadPersisted(): AppState {
  const stored = readStored<PersistedShape | null>(STORAGE_KEY, null)
  if (!stored || !SUPPORTED_VERSIONS.has(stored.version) || !stored.state) {
    return initialState
  }

  const partial = stored.state
  const restoredJobs = sanitizeJobs(partial.jobs)
  const jobs = restoredJobs.length > 0 ? restoredJobs : initialState.jobs

  const restoredEnrollments = Array.isArray(partial.myEnrollments)
    ? partial.myEnrollments.filter(
        (id): id is string => typeof id === 'string' && jobs.some((job) => job.id === id),
      )
    : []

  // Repair: a job that lists the demo worker on its crew implies an
  // enrollment that was lost when the record was written.
  const myEnrollments = [...new Set(restoredEnrollments)]
  for (const job of jobs) {
    if (job.enrolledWorkerIds.includes(CURRENT_WORKER_ID) && !myEnrollments.includes(job.id)) {
      myEnrollments.push(job.id)
    }
  }

  return {
    ...initialState,
    role: partial.role === 'worker' ? 'worker' : 'farmer',
    language: partial.language === 'hi' ? 'hi' : 'en',
    jobs,
    activities: initialState.activities,
    myEnrollments,
    planner: sanitizePlanner(partial.planner),
  }
}

interface AppContextValue {
  state: AppState
  dispatch: (action: Action) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadPersisted)
  const { user } = useAuth()
  const hydratedUserId = useRef<string | null>(null)

  useEffect(() => {
    if (user) {
      hydratedUserId.current = user.id
      dispatch({
        type: 'HYDRATE_PROFILE',
        profile: profileFromUser(user),
        language: user.language,
      })
      return
    }
    if (hydratedUserId.current) {
      hydratedUserId.current = null
      dispatch({ type: 'CLEAR_SESSION' })
    }
  }, [user])

  useEffect(() => {
    const payload: PersistedShape = {
      version: SCHEMA_VERSION,
      state: {
        role: state.role,
        language: state.language,
        // The signed-in profile is server-backed and must not be cached in
        // localStorage, where it would leave the phone number on the device.
        jobs: state.jobs,
        myEnrollments: state.myEnrollments,
        planner: state.planner,
      },
    }
    writeStored(STORAGE_KEY, payload)
  }, [state])

  const value = useMemo<AppContextValue>(() => ({ state, dispatch }), [state])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used inside <AppProvider>')
  }
  return context
}

/** Convenience hook: the current role plus a setter. */
export function useRole(): [AppState['role'], (role: AppState['role']) => void] {
  const { state, dispatch } = useApp()
  const setRole = useCallback(
    (role: AppState['role']) => dispatch({ type: 'SET_ROLE', role }),
    [dispatch],
  )
  return [state.role, setRole]
}
