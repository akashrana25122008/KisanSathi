import { useState, type FormEvent } from 'react'
import { RotateCcw } from 'lucide-react'

import { JOB_ACTIVITIES } from '@/lib/jobs'
import { useT } from '@/lib/i18n'
import { isValidISODate, type PlannerTask } from '@/lib/planner'
import type { PlannerJobActivity } from '@/data/cropStages'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'
import { useApp } from '@/store/AppContext'

export interface TaskEditValues {
  name: string
  description: string
  date: string
  workers: number | null
  activity: PlannerJobActivity
}

export interface TaskEditModalProps {
  task: PlannerTask | null
  onClose: () => void
  onSave: (task: PlannerTask, values: TaskEditValues) => void
}

interface FormErrors {
  name?: string
  description?: string
  date?: string
  workers?: string
}

function TaskEditDialog({
  task,
  onClose,
  onSave,
}: {
  task: PlannerTask
  onClose: () => void
  onSave: (task: PlannerTask, values: TaskEditValues) => void
}) {
  const { state } = useApp()
  const t = useT()
  const language = state.language

  const initialDescription =
    task.descriptionOverride ??
    (language === 'hi' ? task.descriptionHi : task.descriptionEn)
  const [name, setName] = useState(task.custom ? task.nameEn : '')
  const [description, setDescription] = useState(initialDescription)
  const [date, setDate] = useState(task.startDate)
  const [workers, setWorkers] = useState(
    task.custom && task.labour ? String(task.labour.workers) : '',
  )
  const [activity, setActivity] = useState<PlannerJobActivity>(
    task.jobActivity ?? 'Weeding',
  )
  const [errors, setErrors] = useState<FormErrors>({})

  const resetToTemplate = () => {
    setDescription(
      language === 'hi' ? task.defaultDescriptionHi : task.defaultDescriptionEn,
    )
    setDate(task.defaultStartDate)
    setErrors({})
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: FormErrors = {}
    const trimmedName = name.trim()
    const trimmedDescription = description.trim()

    if (task.custom && (trimmedName.length < 2 || trimmedName.length > 80)) {
      nextErrors.name = t('planner.errorName')
    }
    if (!trimmedDescription) {
      nextErrors.description = t('planner.errorDescriptionRequired')
    } else if (trimmedDescription.length > 400) {
      nextErrors.description = t('planner.errorDescription')
    }
    if (!isValidISODate(date)) {
      nextErrors.date = t('planner.errorDate')
    }

    let nextWorkers: number | null = null
    if (task.custom && workers.trim()) {
      const numeric = Number(workers)
      if (!Number.isInteger(numeric) || numeric < 1 || numeric > 100) {
        nextErrors.workers = t('planner.errorWorkers')
      } else {
        nextWorkers = numeric
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onSave(task, {
      name: task.custom ? trimmedName : task.nameEn,
      description: trimmedDescription,
      date,
      workers: nextWorkers,
      activity,
    })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={task.custom ? t('planner.editCustomTitle') : t('planner.editBaseTitle')}
      description={task.custom ? t('planner.editCustomSub') : t('planner.editBaseSub')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('planner.cancel')}
          </Button>
          <Button type="submit" form="task-edit-form" data-testid="task-edit-save">
            {t('planner.saveChanges')}
          </Button>
        </>
      }
    >
      <form id="task-edit-form" className="space-y-4" onSubmit={handleSubmit} noValidate>
        <Input
          label={t('planner.taskName')}
          value={task.custom ? name : language === 'hi' ? task.nameHi : task.nameEn}
          disabled={!task.custom}
          error={errors.name}
          onChange={(event) => {
            setName(event.target.value)
            setErrors((current) => ({ ...current, name: undefined }))
          }}
          data-testid="task-edit-name"
        />

        <Textarea
          label={t('planner.description')}
          required
          value={description}
          error={errors.description}
          hint={t('planner.descriptionHint')}
          onChange={(event) => {
            setDescription(event.target.value)
            setErrors((current) => ({ ...current, description: undefined }))
          }}
          data-testid="task-edit-description"
        />

        <Input
          label={t('planner.date')}
          type="date"
          required
          value={date}
          error={errors.date}
          hint={t('planner.dateHint')}
          onChange={(event) => {
            setDate(event.target.value)
            setErrors((current) => ({ ...current, date: undefined }))
          }}
          data-testid="task-edit-date"
        />

        {task.custom ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('planner.workers')}
              type="number"
              inputMode="numeric"
              min={1}
              max={100}
              step={1}
              value={workers}
              error={errors.workers}
              hint={t('planner.workersHint')}
              onChange={(event) => {
                setWorkers(event.target.value)
                setErrors((current) => ({ ...current, workers: undefined }))
              }}
              data-testid="task-edit-workers"
            />
            <Select
              label={t('planner.workType')}
              value={activity}
              onChange={(event) =>
                setActivity(event.target.value as PlannerJobActivity)
              }
              data-testid="task-edit-activity"
            >
              {JOB_ACTIVITIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              leadingIcon={<RotateCcw className="h-4 w-4" />}
              onClick={resetToTemplate}
              data-testid="task-edit-reset"
            >
              {t('planner.resetFields')}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  )
}

/** Rendered only when a task is selected, so each open starts from saved values. */
export function TaskEditModal({ task, onClose, onSave }: TaskEditModalProps) {
  if (!task) return null
  return <TaskEditDialog key={task.id} task={task} onClose={onClose} onSave={onSave} />
}
