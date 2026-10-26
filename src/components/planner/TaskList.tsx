import {
  Briefcase,
  CalendarDays,
  CalendarRange,
  Check,
  Pencil,
  Plus,
  Trash2,
  Users,
} from 'lucide-react'

import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import {
  formatDateRange,
  formatPlanNumber,
  todayISO,
  type PlannerTask,
} from '@/lib/planner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/store/AppContext'

export interface TaskListProps {
  tasks: PlannerTask[]
  onToggle: (task: PlannerTask) => void
  onEdit: (task: PlannerTask) => void
  onRemove: (task: PlannerTask) => void
  onCreateJob: (task: PlannerTask) => void
  onAddTask: () => void
}

function TaskRow({
  task,
  last,
  onToggle,
  onEdit,
  onRemove,
  onCreateJob,
}: {
  task: PlannerTask
  last: boolean
  onToggle: (task: PlannerTask) => void
  onEdit: (task: PlannerTask) => void
  onRemove: (task: PlannerTask) => void
  onCreateJob: (task: PlannerTask) => void
}) {
  const { state } = useApp()
  const t = useT()
  const language = state.language

  const name = language === 'hi' ? task.nameHi : task.nameEn
  const templateDescription =
    language === 'hi' ? task.descriptionHi : task.descriptionEn
  const description = task.descriptionOverride ?? templateDescription
  const now = todayISO()
  const overdue = !task.done && task.startDate < now
  const isToday = !task.done && task.startDate === now
  const labour = task.labour

  return (
    <li className="relative pl-10 sm:pl-12">
      <span
        className={cn(
          'absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold',
          task.done
            ? 'border-brand-600 bg-brand-600 text-white'
            : task.custom
              ? 'border-info-200 bg-info-50 text-info-700'
              : 'border-ink-200 bg-white text-ink-600',
        )}
        aria-hidden="true"
      >
        {task.done ? (
          <Check className="h-4 w-4" />
        ) : task.custom ? (
          <Plus className="h-4 w-4" />
        ) : (
          task.stageNumber
        )}
      </span>
      {!last ? (
        <span
          className="absolute -bottom-3 left-[13px] top-8 w-px bg-ink-200"
          aria-hidden="true"
        />
      ) : null}

      <article
        id={task.id}
        data-testid="planner-task"
        data-task-id={task.id}
        data-done={task.done ? 'true' : 'false'}
        aria-labelledby={`${task.id}-title`}
        className={cn(
          'scroll-mt-24 rounded-xl border p-4 transition-colors',
          task.done
            ? 'border-brand-200 bg-brand-50/40'
            : 'border-ink-200 bg-white',
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3
                id={`${task.id}-title`}
                className={cn(
                  'text-sm font-semibold tracking-tight sm:text-base',
                  task.done
                    ? 'text-ink-500 line-through decoration-ink-300'
                    : 'text-ink-900',
                )}
              >
                {name}
              </h3>
              {task.custom ? <Badge tone="info">{t('planner.customTask')}</Badge> : null}
              {task.done ? (
                <Badge tone="brand" icon={<Check className="h-3 w-3" />}>
                  {t('planner.completedBadge')}
                </Badge>
              ) : null}
              {overdue ? <Badge tone="danger">{t('planner.overdue')}</Badge> : null}
              {isToday ? <Badge tone="harvest">{t('planner.today')}</Badge> : null}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                {formatDateRange(task.startDate, task.endDate, language)}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {task.custom
                  ? t('planner.customTask')
                  : t('planner.stage', { number: task.stageNumber ?? 0 })}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {task.offsetDays >= 0
                  ? t('planner.day', { day: task.offsetDays })
                  : t('planner.beforeStart')}
              </span>
            </div>
          </div>

          <label className="no-print inline-flex shrink-0 cursor-pointer select-none items-center gap-2 rounded-lg p-1 text-xs font-medium text-ink-600 hover:bg-white">
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => onToggle(task)}
              className="peer sr-only"
              aria-label={
                task.done ? t('planner.markIncomplete') : t('planner.markComplete')
              }
              data-testid="task-toggle"
            />
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400 peer-focus-visible:ring-offset-2',
                task.done
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-ink-300 bg-white text-transparent',
              )}
              aria-hidden="true"
            >
              <Check className="h-4 w-4" />
            </span>
            <span>{task.done ? t('planner.completed') : t('planner.markComplete')}</span>
          </label>
        </div>

        <p
          className={cn(
            'mt-3 text-sm leading-relaxed',
            task.done ? 'text-ink-500' : 'text-ink-600',
          )}
        >
          {description}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge tone="neutral" icon={<CalendarRange className="h-3 w-3" />}>
            {t('planner.approx')}
          </Badge>
          {labour ? (
            <Badge tone="info" icon={<Users className="h-3 w-3" />}>
              {t('planner.illustrative')}
            </Badge>
          ) : null}
          {task.jobReady ? (
            <Badge tone="harvest" icon={<Briefcase className="h-3 w-3" />}>
              {t('planner.jobReady')}
            </Badge>
          ) : null}
          {task.descriptionOverride ? (
            <Badge tone="outline" icon={<Pencil className="h-3 w-3" />}>
              {t('planner.edited')}
            </Badge>
          ) : null}
        </div>

        <div className="mt-3 rounded-lg border border-ink-100 bg-surface-sunken px-3 py-2.5">
          {labour ? (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-800">
                  <Users className="h-3.5 w-3.5 text-ink-400" aria-hidden="true" />
                  {t('planner.labourTitle')}
                  <span className="font-normal text-ink-500">
                    ·{' '}
                    {labour.source === 'farmer'
                      ? t('planner.farmerEstimate')
                      : t('planner.illustrative')}
                  </span>
                </p>
                <p className="text-xs font-semibold text-brand-800">
                  {t('planner.workersValue', { workers: labour.workers })}
                  <span className="mx-1 text-ink-300" aria-hidden="true">·</span>
                  {t('planner.durationValue', { days: labour.durationDays })}
                </p>
              </div>

              <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
                {labour.source === 'template' && labour.workersPerAcre !== null ? (
                  <>
                    {t('planner.formula', {
                      perAcre: formatPlanNumber(labour.workersPerAcre, language),
                      area: formatPlanNumber(labour.areaAcres, language),
                    })}
                    {labour.minApplied ? (
                      <> · {t('planner.minimumCrew', { min: labour.workers })}</>
                    ) : null}
                    {labour.capped ? (
                      <> · {t('planner.capped', { max: labour.maxWorkers ?? '' })}</>
                    ) : null}
                  </>
                ) : (
                  t('planner.farmerEstimateHint')
                )}
              </p>

              {(language === 'hi' ? labour.noteHi : labour.noteEn) ? (
                <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
                  {language === 'hi' ? labour.noteHi : labour.noteEn}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-700">
                <Users className="h-3.5 w-3.5 text-ink-400" aria-hidden="true" />
                {t('planner.noLabour')}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
                {t('planner.noLabourHint')}
              </p>
            </>
          )}
        </div>

        <div className="no-print mt-3 flex flex-wrap items-center gap-2">
          {task.jobReady ? (
            <Button
              size="sm"
              leadingIcon={<Briefcase className="h-4 w-4" />}
              onClick={() => onCreateJob(task)}
              data-testid="task-create-job"
            >
              {t('planner.createJob')}
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="secondary"
            leadingIcon={<Pencil className="h-4 w-4" />}
            onClick={() => onEdit(task)}
            aria-label={`${t('planner.editTask')}: ${name}`}
            data-testid="task-edit"
          >
            {t('planner.editTask')}
          </Button>
          {task.custom ? (
            <Button
              size="sm"
              variant="ghost"
              className="text-danger-600 hover:bg-danger-50 hover:text-danger-700"
              leadingIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => onRemove(task)}
              aria-label={`${t('planner.removeTask')}: ${name}`}
              data-testid="task-remove"
            >
              {t('planner.removeTask')}
            </Button>
          ) : null}
        </div>
      </article>
    </li>
  )
}

/** The crop-stage timeline. Base stages always render; custom tasks sit in date order. */
export function TaskList({
  tasks,
  onToggle,
  onEdit,
  onRemove,
  onCreateJob,
  onAddTask,
}: TaskListProps) {
  const t = useT()

  return (
    <Card flush className="overflow-visible" data-testid="planner-timeline">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-100 p-4 sm:p-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink-900">{t('planner.timelineTitle')}</h2>
          <p className="mt-0.5 text-xs text-ink-500">
            {t('planner.timelineSubtitle', { count: tasks.length })}
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="no-print"
          leadingIcon={<Plus className="h-4 w-4" />}
          onClick={onAddTask}
        >
          {t('planner.addTask')}
        </Button>
      </div>

      {tasks.length > 0 ? (
        <ol className="space-y-3 p-4 sm:p-5">
          {tasks.map((task, index) => (
            <TaskRow
              key={task.id}
              task={task}
              last={index === tasks.length - 1}
              onToggle={onToggle}
              onEdit={onEdit}
              onRemove={onRemove}
              onCreateJob={onCreateJob}
            />
          ))}
        </ol>
      ) : (
        <p className="p-5 text-sm text-ink-500">{t('planner.emptyTitle')}</p>
      )}
    </Card>
  )
}
