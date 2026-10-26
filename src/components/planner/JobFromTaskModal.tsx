import {
  AlertTriangle,
  CalendarDays,
  Clock,
  IndianRupee,
  Info,
  ListChecks,
  Users,
} from 'lucide-react'

import { CROP_MAP } from '@/data'
import { useT } from '@/lib/i18n'
import {
  formatDateRange,
  formatPlanDate,
  taskToJobPrefill,
  todayISO,
  type PlannerJobPrefill,
  type PlannerPlan,
  type PlannerTask,
} from '@/lib/planner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useApp } from '@/store/AppContext'
import type { Profile } from '@/store/types'

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink-100 bg-surface-sunken px-3 py-2">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-ink-900">{value}</dd>
    </div>
  )
}

function JobFromTaskDialog({
  task,
  plan,
  profile,
  onClose,
  onContinue,
}: {
  task: PlannerTask
  plan: PlannerPlan
  profile: Profile
  onClose: () => void
  onContinue: (prefill: PlannerJobPrefill) => void
}) {
  const { state } = useApp()
  const t = useT()
  const language = state.language
  const prefill = taskToJobPrefill(task, plan, profile)
  const dateIsPast = task.startDate < todayISO()
  const crop = CROP_MAP[plan.crop]
  const cropLabel = language === 'hi' ? crop.labelHi : crop.label
  const name = language === 'hi' ? task.nameHi : task.nameEn
  const labour = task.labour

  return (
    <Modal
      open
      onClose={onClose}
      title={t('planner.jobDraftTitle')}
      description={t('planner.jobDraftSub')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('planner.cancel')}
          </Button>
          <Button
            leadingIcon={<ListChecks className="h-4 w-4" />}
            onClick={() => onContinue(prefill)}
            data-testid="planner-job-draft-continue"
          >
            {t('planner.jobOpenForm')}
          </Button>
        </>
      }
    >
      <div data-testid="planner-job-draft" className="space-y-4">
        <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">
            {t('planner.jobTask')}
          </p>
          <p className="mt-1 text-sm font-semibold text-ink-900">{name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge tone="brand" icon={<CalendarDays className="h-3 w-3" />}>
              {formatDateRange(task.startDate, task.endDate, language)}
            </Badge>
            {labour ? (
              <Badge tone="info" icon={<Users className="h-3 w-3" />}>
                {t('planner.workersValue', { workers: labour.workers })}
              </Badge>
            ) : null}
            {task.jobActivity ? (
              <Badge tone="harvest">{task.jobActivity}</Badge>
            ) : null}
          </div>
        </div>

        {dateIsPast ? (
          <div
            className="flex items-start gap-2 rounded-xl border border-harvest-200 bg-harvest-50 p-3 text-sm text-harvest-800"
            data-testid="planner-job-draft-past-date"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p className="leading-relaxed">{t('planner.jobDatePast')}</p>
          </div>
        ) : null}

        <section aria-labelledby="job-prefilled-heading">
          <h3
            id="job-prefilled-heading"
            className="text-sm font-semibold text-ink-900"
          >
            {t('planner.jobPrefilled')}
          </h3>
          <dl className="mt-2 grid gap-2 sm:grid-cols-2">
            {prefill.activity ? (
              <Field label={t('planner.workType')} value={prefill.activity} />
            ) : null}
            <Field label={t('planner.crop')} value={cropLabel} />
            {labour ? (
              <Field
                label={t('planner.labourTitle')}
                value={t('planner.workersValue', { workers: labour.workers })}
              />
            ) : null}
            {prefill.workDate ? (
              <Field
                label={t('planner.date')}
                value={formatPlanDate(prefill.workDate, language)}
              />
            ) : null}
            {prefill.village ? (
              <Field
                label={t('planner.village')}
                value={`${prefill.village}, ${prefill.district ?? ''}`}
              />
            ) : (
              <Field
                label={t('planner.district')}
                value={prefill.district ?? plan.district}
              />
            )}
          </dl>
        </section>

        <section aria-labelledby="job-confirm-heading">
          <h3 id="job-confirm-heading" className="text-sm font-semibold text-ink-900">
            {t('planner.jobConfirmFields')}
          </h3>
          <ul className="mt-2 space-y-2">
            <li className="flex items-start gap-2 rounded-lg border border-ink-100 px-3 py-2">
              <IndianRupee className="mt-0.5 h-4 w-4 shrink-0 text-harvest-600" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-ink-800">{t('planner.jobWage')}</p>
                <p className="text-xs leading-relaxed text-ink-500">
                  {t('planner.jobWageHint')}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2 rounded-lg border border-ink-100 px-3 py-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-ink-800">{t('planner.jobStartTime')}</p>
                <p className="text-xs leading-relaxed text-ink-500">
                  {t('planner.jobFacilities')}
                </p>
              </div>
            </li>
          </ul>
        </section>

        <p className="flex items-start gap-1.5 text-xs leading-relaxed text-ink-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {t('planner.jobDraftHint')}
        </p>
      </div>
    </Modal>
  )
}

/** Rendered only for a selected task; the actual post form is opened by the page. */
export function JobFromTaskModal({
  task,
  plan,
  profile,
  onClose,
  onContinue,
}: {
  task: PlannerTask | null
  plan: PlannerPlan | null
  profile: Profile
  onClose: () => void
  onContinue: (prefill: PlannerJobPrefill) => void
}) {
  if (!task || !plan) return null
  return (
    <JobFromTaskDialog
      key={task.id}
      task={task}
      plan={plan}
      profile={profile}
      onClose={onClose}
      onContinue={onContinue}
    />
  )
}
