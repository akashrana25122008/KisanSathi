import type { ReactNode } from 'react'
import {
  CalendarDays,
  CalendarRange,
  Clock,
  MapPin,
  Plus,
  Printer,
  Ruler,
  Settings2,
  Trash2,
} from 'lucide-react'

import { CROP_MAP, DISTRICTS } from '@/data'
import { PLANNER_CROP_MAP } from '@/data/cropStages'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import {
  formatPlanDate,
  formatPlanNumber,
  planSpanDays,
  todayISO,
  type PlannerPlan,
  type PlannerProgress,
  type PlannerTask,
} from '@/lib/planner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useApp } from '@/store/AppContext'

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
  hint?: ReactNode
}) {
  return (
    <div className="min-w-0 rounded-xl border border-ink-100 bg-surface-sunken px-3 py-2.5">
      <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-500">
        <span className="text-ink-400" aria-hidden="true">
          {icon}
        </span>
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-sm font-semibold text-ink-900">{value}</dd>
      {hint ? <dd className="truncate text-[11px] text-ink-500">{hint}</dd> : null}
    </div>
  )
}

export interface PlanSummaryProps {
  plan: PlannerPlan
  tasks: PlannerTask[]
  progress: PlannerProgress
  upcoming: PlannerTask[]
  settingsOpen: boolean
  onAddTask: () => void
  onToggleSettings: () => void
  onClear: () => void
}

/**
 * The at-a-glance card above the work timeline: crop, area, progress and the
 * next few unfinished steps. Actions are visually secondary to the timeline.
 */
export function PlanSummary({
  plan,
  tasks,
  progress,
  upcoming,
  settingsOpen,
  onAddTask,
  onToggleSettings,
  onClear,
}: PlanSummaryProps) {
  const { state } = useApp()
  const t = useT()
  const language = state.language

  const crop = CROP_MAP[plan.crop]
  const meta = PLANNER_CROP_MAP[plan.crop]
  const cropLabel = language === 'hi' ? crop.labelHi : crop.label
  const season = language === 'hi' ? meta.seasonHi : meta.seasonEn
  const districtMeta = DISTRICTS.find((item) => item.name === plan.district)
  const spanDays = planSpanDays(tasks)
  const now = todayISO()

  return (
    <Card className="overflow-hidden" data-testid="planner-summary">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-2xl ring-1 ring-brand-100"
            aria-hidden="true"
          >
            {crop.glyph}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold tracking-tight text-ink-900 sm:text-xl">
              {t('planner.planFor', { crop: cropLabel })}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge tone="brand">{season}</Badge>
              <Badge tone="neutral" icon={<CalendarRange className="h-3 w-3" />}>
                {t('planner.approx')}
              </Badge>
            </div>
          </div>
        </div>

        <div className="no-print flex flex-wrap gap-2">
          <Button
            size="sm"
            leadingIcon={<Plus className="h-4 w-4" />}
            onClick={onAddTask}
            data-testid="planner-add-task"
          >
            {t('planner.addTask')}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            leadingIcon={<Settings2 className="h-4 w-4" />}
            onClick={onToggleSettings}
            data-testid="planner-toggle-settings"
          >
            {settingsOpen ? t('planner.hideSettings') : t('planner.planSettings')}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            leadingIcon={<Printer className="h-4 w-4" />}
            onClick={() => window.print()}
            aria-label={t('planner.print')}
          >
            {t('planner.print')}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-danger-600 hover:bg-danger-50 hover:text-danger-700"
            leadingIcon={<Trash2 className="h-4 w-4" />}
            onClick={onClear}
            data-testid="planner-clear"
          >
            {t('planner.clearPlan')}
          </Button>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          icon={<Ruler className="h-3.5 w-3.5" />}
          label={t('planner.area')}
          value={t('planner.areaValue', {
            area: formatPlanNumber(plan.areaAcres, language),
          })}
        />
        <Stat
          icon={<MapPin className="h-3.5 w-3.5" />}
          label={t('planner.district')}
          value={plan.district}
          hint={districtMeta?.state}
        />
        <Stat
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          label={t('planner.startDate')}
          value={formatPlanDate(plan.sowingDate, language)}
          hint={t('planner.dayZero')}
        />
        <Stat
          icon={<Clock className="h-3.5 w-3.5" />}
          label={t('planner.spanLabel')}
          value={t('planner.spanValue', { days: spanDays })}
        />
      </dl>

      <div className="mt-5 rounded-xl border border-ink-100 bg-surface-sunken p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-ink-900">{t('planner.progressTitle')}</p>
          <p className="text-sm font-semibold text-brand-700">{progress.percent}%</p>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.percent}
          aria-label={t('planner.progressTitle')}
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-ink-100"
        >
          <div
            className="h-full rounded-full bg-brand-500 transition-[width] duration-300"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-ink-500">
          <span>
            {t('planner.progressCount', {
              done: progress.done,
              total: progress.total,
            })}
          </span>
          <span className="inline-flex flex-wrap items-center gap-x-2">
            <span className="font-medium text-ink-700">
              {t('planner.workerDays', {
                days: formatPlanNumber(progress.workerDays, language),
              })}
            </span>
            <span aria-hidden="true">·</span>
            <span>{t('planner.crewTasks', { count: progress.crewEstimated })}</span>
          </span>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-ink-900">{t('planner.nextUp')}</h3>
          <span className="text-xs text-ink-500">
            {t('planner.taskCount', { count: progress.total })}
          </span>
        </div>

        {upcoming.length > 0 ? (
          <ul className="mt-1 divide-y divide-ink-100">
            {upcoming.map((task) => {
              const overdue = task.startDate < now
              const name = language === 'hi' ? task.nameHi : task.nameEn
              return (
                <li key={task.id}>
                  <a
                    href={`#${task.id}`}
                    className="group flex items-center gap-3 rounded-lg py-2.5 transition-colors hover:bg-brand-50/60 focus-visible:bg-brand-50/60"
                  >
                    <span
                      className={cn(
                        'h-2 w-2 shrink-0 rounded-full',
                        overdue ? 'bg-danger-500' : 'bg-brand-500',
                      )}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink-800 group-hover:text-brand-800">
                        {name}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-ink-500">
                        <span>{formatPlanDate(task.startDate, language)}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {task.offsetDays >= 0
                            ? t('planner.day', { day: task.offsetDays })
                            : t('planner.beforeStart')}
                        </span>
                      </span>
                    </span>
                    {overdue ? <Badge tone="danger">{t('planner.overdue')}</Badge> : null}
                  </a>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="mt-2 rounded-xl border border-brand-100 bg-brand-50/60 px-3 py-2.5 text-sm text-brand-800">
            {t('planner.nextUpEmpty')}
          </p>
        )}
      </div>
    </Card>
  )
}
