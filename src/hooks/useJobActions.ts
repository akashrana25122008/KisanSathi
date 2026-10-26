import { useCallback, useRef } from 'react'

import { useToast } from '@/components/ui/Toast'
import { useApp } from '@/store/AppContext'
import { vacanciesOf } from '@/store/appReducer'
import type { Job } from '@/store/types'

export type EnrollOutcome =
  | 'enrolled'
  | 'already-enrolled'
  | 'full'
  | 'closed'
  | 'missing'

/**
 * ---------------------------------------------------------------------------
 * Shared enrollment actions
 * ---------------------------------------------------------------------------
 * Home, the job board and the job detail page all need the exact same
 * enroll / withdraw behaviour, including the guards against double clicks and
 * overfilled jobs. This hook is the single place where that behaviour lives -
 * the reducer still re-checks the rules as a safety net.
 */
export function useJobActions() {
  const { state, dispatch } = useApp()
  const toast = useToast()

  /**
   * Ids that are mid-flight. A click that lands before React has re-rendered
   * (double click, or a very fast second tap) is ignored instead of filling
   * the last vacancy twice.
   */
  const busyRef = useRef<Set<string>>(new Set())

  const enroll = useCallback(
    (target: Job | string): EnrollOutcome => {
      const jobId = typeof target === 'string' ? target : target.id

      // Rapid repeat - the first click already reported the result.
      if (busyRef.current.has(jobId)) return 'already-enrolled'

      const job = state.jobs.find((item) => item.id === jobId)
      if (!job) {
        toast.error('Job not found', 'This job is no longer on the board.')
        return 'missing'
      }

      if (state.myEnrollments.includes(jobId)) {
        toast.info('Already enrolled', 'You are already signed up for this job.')
        return 'already-enrolled'
      }

      if (job.status !== 'open') {
        toast.warning('Job is closed', 'This job is no longer accepting workers.')
        return 'closed'
      }

      if (vacanciesOf(job) <= 0) {
        toast.warning(
          'No vacancies left',
          `All ${job.workersRequired} positions for this job are already filled.`,
        )
        return 'full'
      }

      busyRef.current.add(jobId)
      dispatch({ type: 'ENROLL', jobId })
      // Release the guard once the state update has been committed.
      window.setTimeout(() => {
        busyRef.current.delete(jobId)
      }, 0)

      toast.success(
        'Enrolled',
        `You joined "${job.title}". The farmer can now see you on the crew.`,
      )
      return 'enrolled'
    },
    [dispatch, state.jobs, state.myEnrollments, toast],
  )

  const withdraw = useCallback(
    (target: Job | string): boolean => {
      const jobId = typeof target === 'string' ? target : target.id

      if (!state.myEnrollments.includes(jobId)) {
        toast.info('Not enrolled', 'You are not signed up for this job.')
        return false
      }

      dispatch({ type: 'WITHDRAW', jobId })

      const job = state.jobs.find((item) => item.id === jobId)
      toast.warning(
        'Enrollment withdrawn',
        job
          ? `You left "${job.title}". One vacancy has been reopened.`
          : 'You left the job. One vacancy has been reopened.',
      )
      return true
    },
    [dispatch, state.jobs, state.myEnrollments, toast],
  )

  return { enroll, withdraw }
}
