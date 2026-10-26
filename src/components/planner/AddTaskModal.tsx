import { useState, type FormEvent } from 'react'

import { JOB_ACTIVITIES } from '@/lib/jobs'
import { useT } from '@/lib/i18n'
import {
  isValidISODate,
  todayISO,
  type NewCustomTaskInput,
} from '@/lib/planner'
import type { PlannerJobActivity } from '@/data/cropStages'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Form'
import { Modal } from '@/components/ui/Modal'

export interface AddTaskModalProps {
  open: boolean
  defaultDate?: string
  onClose: () => void
  onAdd: (input: NewCustomTaskInput) => void
}

interface FormErrors {
  name?: string
  description?: string
  date?: string
  workers?: string
}

function AddTaskDialog({
  defaultDate,
  onClose,
  onAdd,
}: {
  defaultDate?: string
  onClose: () => void
  onAdd: (input: NewCustomTaskInput) => void
}) {
  const t = useT()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(
    defaultDate && isValidISODate(defaultDate) ? defaultDate : todayISO(),
  )
  const [workers, setWorkers] = useState('')
  const [activity, setActivity] = useState<PlannerJobActivity>('Weeding')
  const [errors, setErrors] = useState<FormErrors>({})

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: FormErrors = {}
    const trimmedName = name.trim()
    const trimmedDescription = description.trim()

    if (trimmedName.length < 2 || trimmedName.length > 80) {
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
    if (workers.trim()) {
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

    onAdd({
      name: trimmedName,
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
      title={t('planner.addTitle')}
      description={t('planner.addSub')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('planner.cancel')}
          </Button>
          <Button type="submit" form="task-add-form" data-testid="task-add-submit">
            {t('planner.addButton')}
          </Button>
        </>
      }
    >
      <form id="task-add-form" className="space-y-4" onSubmit={handleSubmit} noValidate>
        <Input
          label={t('planner.taskName')}
          required
          value={name}
          placeholder={t('planner.namePlaceholder')}
          error={errors.name}
          onChange={(event) => {
            setName(event.target.value)
            setErrors((current) => ({ ...current, name: undefined }))
          }}
          data-testid="task-add-name"
        />

        <Textarea
          label={t('planner.description')}
          required
          value={description}
          placeholder={t('planner.descriptionPlaceholder')}
          error={errors.description}
          onChange={(event) => {
            setDescription(event.target.value)
            setErrors((current) => ({ ...current, description: undefined }))
          }}
          data-testid="task-add-description"
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
          data-testid="task-add-date"
        />

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
            data-testid="task-add-workers"
          />
          <Select
            label={t('planner.workType')}
            value={activity}
            onChange={(event) => setActivity(event.target.value as PlannerJobActivity)}
            data-testid="task-add-activity"
          >
            {JOB_ACTIVITIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
      </form>
    </Modal>
  )
}

/** Unmounts when closed so the next open starts with empty fields. */
export function AddTaskModal({ open, defaultDate, onClose, onAdd }: AddTaskModalProps) {
  if (!open) return null
  return <AddTaskDialog defaultDate={defaultDate} onClose={onClose} onAdd={onAdd} />
}
