import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Info,
  Sprout,
} from 'lucide-react'

import { CROP_MAP } from '@/data'
import {
  PLANNER_LIMITS,
  PLANNER_REFERENCES,
  PLANNER_REFERENCE_NOTE,
  PLANNER_SAFETY,
} from '@/data/cropStages'
import { useT } from '@/lib/i18n'
import {
  buildPlannerTasks,
  createCustomTask,
  createPlannerPlan,
  formatPlanNumber,
  initialPlannerForm,
  plannerProgress,
  upcomingTasks,
  type NewCustomTaskInput,
  type PlannerInput,
  type PlannerJobPrefill,
  type PlannerPlan,
  type PlannerTask,
} from '@/lib/planner'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { JobPostModal, type FormState } from '@/components/jobs/JobPostModal'
import { AddTaskModal } from '@/components/planner/AddTaskModal'
import { JobFromTaskModal } from '@/components/planner/JobFromTaskModal'
import { PlanForm } from '@/components/planner/PlanForm'
import { PlanSummary } from '@/components/planner/PlanSummary'
import { TaskEditModal, type TaskEditValues } from '@/components/planner/TaskEditModal'
import { TaskList } from '@/components/planner/TaskList'
import { useApp } from '@/store/AppContext'

/**
 * Crop-to-Work Planner.
 *
 * The page only keeps transient UI state (open modals, the setup panel). The
 * crop plan itself, including every completion, edit and custom task, lives in
 * the shared reducer and is persisted to localStorage.
 */
export function PlannerPage() {
  const { state, dispatch } = useApp()
  const t = useT()
  const toast = useToast()

  const plan = state.planner
  const language = state.language

  const tasks = useMemo(() => (plan ? buildPlannerTasks(plan) : []), [plan])
  const progress = useMemo(() => plannerProgress(tasks), [tasks])
  const upcoming = useMemo(() => upcomingTasks(tasks), [tasks])
  const initialForm = useMemo(
    () => initialPlannerForm(plan, state.profile),
    [plan, state.profile],
  )

  const [setupOpen, setSetupOpen] = useState(false)
  const [pendingInput, setPendingInput] = useState<PlannerInput | null>(null)
  const [clearOpen, setClearOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<PlannerTask | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [removeTask, setRemoveTask] = useState<PlannerTask | null>(null)
  const [jobTask, setJobTask] = useState<PlannerTask | null>(null)
  const [postOpen, setPostOpen] = useState(false)
  const [postPrefill, setPostPrefill] = useState<Partial<FormState> | undefined>(undefined)

  const safetyTitle =
    language === 'hi' ? PLANNER_SAFETY.titleHi : PLANNER_SAFETY.titleEn
  const safetyBody = language === 'hi' ? PLANNER_SAFETY.bodyHi : PLANNER_SAFETY.bodyEn
  const safetyData =
    language === 'hi' ? PLANNER_SAFETY.dataNoteHi : PLANNER_SAFETY.dataNoteEn
  const safetyNoDose =
    language === 'hi' ? PLANNER_SAFETY.noDoseHi : PLANNER_SAFETY.noDoseEn
  const safetyDisclosure =
    language === 'hi' ? PLANNER_SAFETY.disclosureHi : PLANNER_SAFETY.disclosureEn
  const referenceNote =
    language === 'hi' ? PLANNER_REFERENCE_NOTE.hi : PLANNER_REFERENCE_NOTE.en

  const cropLabel = (crop: keyof typeof CROP_MAP) =>
    language === 'hi' ? CROP_MAP[crop].labelHi : CROP_MAP[crop].label

  const announcePlan = (next: PlannerPlan, replaced: boolean) => {
    const count = buildPlannerTasks(next).length
    if (replaced) {
      toast.success(t('planner.replacedToast'), t('planner.replacedBody'))
      return
    }
    toast.success(
      t('planner.createdToast'),
      t('planner.createdBody', {
        crop: cropLabel(next.crop),
        area: formatPlanNumber(next.areaAcres, language),
        count,
      }),
    )
  }

  const handlePlanSubmit = (input: PlannerInput) => {
    if (plan) {
      setPendingInput(input)
      return
    }
    const next = createPlannerPlan(input)
    dispatch({ type: 'SET_PLAN', plan: next })
    setSetupOpen(false)
    announcePlan(next, false)
  }

  const confirmReplace = () => {
    if (!pendingInput) return
    const next = createPlannerPlan(pendingInput)
    dispatch({ type: 'SET_PLAN', plan: next })
    setPendingInput(null)
    setSetupOpen(false)
    announcePlan(next, true)
  }

  const handleToggle = (task: PlannerTask) => {
    if (task.custom) {
      dispatch({
        type: 'UPDATE_CUSTOM_TASK',
        taskId: task.id,
        patch: { done: !task.done },
      })
      return
    }
    dispatch({
      type: 'UPDATE_PLAN_TASK',
      taskId: task.id,
      patch: { done: !task.done },
    })
  }

  const handleEditSave = (task: PlannerTask, values: TaskEditValues) => {
    if (task.custom) {
      dispatch({
        type: 'UPDATE_CUSTOM_TASK',
        taskId: task.id,
        patch: {
          name: values.name,
          description: values.description,
          date: values.date,
          workers: values.workers,
          activity: values.activity,
        },
      })
    } else {
      dispatch({
        type: 'UPDATE_PLAN_TASK',
        taskId: task.id,
        patch: { description: values.description, date: values.date },
      })
    }
    setEditingTask(null)
    toast.success(t('planner.taskUpdated'), t('planner.taskUpdatedBody'))
  }

  const handleAdd = (input: NewCustomTaskInput) => {
    if (!plan) return
    if (plan.customTasks.length >= PLANNER_LIMITS.maxCustomTasks) {
      toast.error(
        t('planner.customLimitTitle'),
        t('planner.customLimitBody', { max: PLANNER_LIMITS.maxCustomTasks }),
      )
      return
    }
    const task = createCustomTask(input)
    dispatch({ type: 'ADD_CUSTOM_TASK', task })
    setAddOpen(false)
    toast.success(t('planner.customAdded'), t('planner.customAddedBody'))
  }

  const confirmRemove = () => {
    if (!removeTask) return
    dispatch({ type: 'REMOVE_CUSTOM_TASK', taskId: removeTask.id })
    setRemoveTask(null)
    toast.success(t('planner.customRemoved'), t('planner.customRemovedBody'))
  }

  const handleJobContinue = (prefill: PlannerJobPrefill) => {
    setJobTask(null)
    setPostPrefill(prefill)
    setPostOpen(true)
  }

  const confirmClear = () => {
    dispatch({ type: 'CLEAR_PLAN' })
    setClearOpen(false)
    setSetupOpen(false)
    toast.success(t('planner.clearedToast'), t('planner.clearedBody'))
  }

  const removeTaskName = removeTask
    ? language === 'hi'
      ? removeTask.nameHi
      : removeTask.nameEn
    : ''

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('planner.eyebrow')}
        title={t('planner.title')}
        description={t('planner.subtitle')}
      />

      <Card className="border-harvest-200 bg-harvest-50/70" data-testid="planner-safety">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-harvest-100 text-harvest-700">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-harvest-900">{safetyTitle}</p>
              <Badge tone="harvest">{t('common.sampleData')}</Badge>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-harvest-800">{safetyBody}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-harvest-800/80">{safetyData}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-harvest-800/70">
              {safetyDisclosure} {safetyNoDose}
            </p>
          </div>
        </div>
      </Card>

      {plan ? (
        <div className="space-y-6">
          {setupOpen ? (
            <Card data-testid="planner-settings">
              <CardHeader
                title={t('planner.setupTitle')}
                subtitle={t('planner.setupSubtitle')}
              />
              <div className="mt-4">
                <PlanForm
                  key={plan.id}
                  initial={initialForm}
                  submitLabel={t('planner.replace')}
                  onSubmit={handlePlanSubmit}
                  onCancel={() => setSetupOpen(false)}
                />
              </div>
            </Card>
          ) : null}

          <PlanSummary
            plan={plan}
            tasks={tasks}
            progress={progress}
            upcoming={upcoming}
            settingsOpen={setupOpen}
            onAddTask={() => setAddOpen(true)}
            onToggleSettings={() => setSetupOpen((open) => !open)}
            onClear={() => setClearOpen(true)}
          />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
            <TaskList
              tasks={tasks}
              onToggle={handleToggle}
              onEdit={setEditingTask}
              onRemove={setRemoveTask}
              onCreateJob={setJobTask}
              onAddTask={() => setAddOpen(true)}
            />

            <aside className="space-y-4" aria-label={t('planner.assumptionsTitle')}>
              <Card>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                  <Info className="h-4 w-4 text-brand-600" aria-hidden="true" />
                  {t('planner.assumptionsTitle')}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-ink-500">
                  {t('planner.assumptionsTiming')}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-ink-500">{safetyData}</p>
                <p className="mt-2 text-xs leading-relaxed text-ink-500">{safetyNoDose}</p>
              </Card>

              <Card>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                  <ExternalLink className="h-4 w-4 text-brand-600" aria-hidden="true" />
                  {t('planner.referencesTitle')}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-ink-500">{referenceNote}</p>
                <ul className="mt-3 space-y-2">
                  {PLANNER_REFERENCES.map((reference) => (
                    <li key={reference.id}>
                      <a
                        href={reference.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 rounded-lg border border-ink-100 bg-surface-sunken px-2.5 py-2 text-xs font-medium text-ink-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
                      >
                        <span className="min-w-0 flex-1">
                          {language === 'hi' ? reference.labelHi : reference.labelEn}
                        </span>
                        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="sr-only">{t('planner.referenceVisit')}</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/jobs"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
                >
                  {t('planner.viewJobs')}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </Card>
            </aside>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start">
          <Card data-testid="planner-setup">
            <CardHeader
              title={t('planner.setupTitle')}
              subtitle={t('planner.setupSubtitle')}
            />
            <div className="mt-4">
              <PlanForm
                initial={initialForm}
                submitLabel={t('planner.generate')}
                onSubmit={handlePlanSubmit}
              />
            </div>
          </Card>

          <Card className="relative overflow-hidden" data-testid="planner-empty">
            <div className="field-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
            <div className="relative flex h-full flex-col items-center justify-center px-2 py-6 text-center sm:py-10">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                <Sprout className="h-7 w-7" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-ink-900">
                {t('planner.emptyTitle')}
              </h2>
              <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-500">
                {t('planner.emptyBody')}
              </p>
              <ul className="mt-5 space-y-2 text-left text-sm text-ink-600">
                {[
                  t('planner.emptyPoint1'),
                  t('planner.emptyPoint2'),
                  t('planner.emptyPoint3'),
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-brand-500"
                      aria-hidden="true"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 max-w-sm text-xs leading-relaxed text-ink-500">
                {t('planner.emptyFoot')}
              </p>
            </div>
          </Card>
        </div>
      )}

      <AddTaskModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
      />

      <TaskEditModal
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleEditSave}
      />

      <JobFromTaskModal
        task={jobTask}
        plan={plan}
        profile={state.profile}
        onClose={() => setJobTask(null)}
        onContinue={handleJobContinue}
      />

      <JobPostModal
        open={postOpen}
        onClose={() => setPostOpen(false)}
        prefill={postPrefill}
      />

      <Modal
        open={pendingInput !== null}
        onClose={() => setPendingInput(null)}
        title={t('planner.replaceTitle')}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingInput(null)}>
              {t('planner.replaceKeep')}
            </Button>
            <Button onClick={confirmReplace} data-testid="planner-replace-confirm">
              {t('planner.replaceConfirm')}
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-ink-600">
          {t('planner.replaceBody', {
            done: progress.done,
            custom: plan?.customTasks.length ?? 0,
          })}
        </p>
      </Modal>

      <Modal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title={t('planner.clearTitle')}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setClearOpen(false)}>
              {t('planner.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={confirmClear}
              data-testid="planner-clear-confirm"
            >
              {t('planner.clearConfirm')}
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-ink-600">{t('planner.clearBody')}</p>
      </Modal>

      <Modal
        open={removeTask !== null}
        onClose={() => setRemoveTask(null)}
        title={t('planner.removeTitle')}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRemoveTask(null)}>
              {t('planner.keepTask')}
            </Button>
            <Button
              variant="danger"
              onClick={confirmRemove}
              data-testid="planner-remove-confirm"
            >
              {t('planner.removeConfirm')}
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-ink-600">
          {t('planner.removeBody', { name: removeTaskName })}
        </p>
      </Modal>
    </div>
  )
}
