import { useMemo, useState, type FormEvent } from 'react'
import { CalendarRange, Info } from 'lucide-react'

import { CROP_MAP, DISTRICTS } from '@/data'
import {
  PLANNER_CROPS,
  PLANNER_CROP_MAP,
  isPlannerCrop,
} from '@/data/cropStages'
import { useT, type StringKey } from '@/lib/i18n'
import {
  validatePlannerInput,
  type PlannerErrorCode,
  type PlannerFormValues,
  type PlannerInput,
  type PlannerValidation,
} from '@/lib/planner'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Form'
import { useToast } from '@/components/ui/Toast'
import { useApp } from '@/store/AppContext'

/** Maps engine error codes to localised messages. */
function errorKeyFor(
  field: keyof PlannerValidation,
  code: PlannerErrorCode,
): StringKey {
  if (field === 'crop') {
    return code === 'unsupported'
      ? 'planner.errorCropUnsupported'
      : 'planner.errorCropRequired'
  }
  if (field === 'area') {
    if (code === 'range') return 'planner.errorAreaRange'
    if (code === 'invalid') return 'planner.errorAreaInvalid'
    return 'planner.errorAreaRequired'
  }
  if (field === 'district') {
    return code === 'invalid'
      ? 'planner.errorDistrictInvalid'
      : 'planner.errorDistrictRequired'
  }
  if (code === 'range') return 'planner.errorDateRange'
  if (code === 'invalid') return 'planner.errorDateInvalid'
  return 'planner.errorDateRequired'
}

export interface PlanFormProps {
  initial: PlannerFormValues
  submitLabel: string
  onSubmit: (input: PlannerInput) => void
  onCancel?: () => void
  /** Optional note under the submit button. */
  note?: string
}

/**
 * The four planner inputs. Validation is handled by the local engine so the
 * rules can be tested outside React; this component only maps the codes to
 * localised messages.
 */
export function PlanForm({ initial, submitLabel, onSubmit, onCancel, note }: PlanFormProps) {
  const { state } = useApp()
  const t = useT()
  const toast = useToast()

  const [values, setValues] = useState<PlannerFormValues>(initial)
  const [errors, setErrors] = useState<PlannerValidation>({})

  const meta = isPlannerCrop(values.crop) ? PLANNER_CROP_MAP[values.crop] : null
  const cropInfo = isPlannerCrop(values.crop) ? CROP_MAP[values.crop] : null

  const startLabel = meta
    ? state.language === 'hi'
      ? meta.startLabelHi
      : meta.startLabelEn
    : t('planner.startDate')
  const startHint = meta
    ? state.language === 'hi'
      ? meta.startHintHi
      : meta.startHintEn
    : t('planner.startDateHint')

  const timingNote = useMemo(() => {
    if (!meta) return null
    return state.language === 'hi' ? meta.timingNoteHi : meta.timingNoteEn
  }, [meta, state.language])

  const clearError = (field: keyof PlannerValidation) => {
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const setField = (
    field: keyof PlannerFormValues,
    value: string,
    errorField: keyof PlannerValidation,
  ) => {
    setValues((current) => ({ ...current, [field]: value }))
    clearError(errorField)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const result = validatePlannerInput(values)
    if (!result.input) {
      setErrors(result.errors)
      toast.error(t('planner.fixFields'), t('planner.fixFieldsBody'))
      return
    }
    setErrors({})
    onSubmit(result.input)
  }

  const errorText = (field: keyof PlannerValidation) => {
    const code = errors[field]
    return code ? t(errorKeyFor(field, code)) : undefined
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <Select
        label={t('planner.crop')}
        required
        value={values.crop}
        error={errorText('crop')}
        onChange={(event) => setField('crop', event.target.value, 'crop')}
        data-testid="planner-crop"
      >
        <option value="">{t('planner.cropPlaceholder')}</option>
        {PLANNER_CROPS.map((crop) => {
          const info = CROP_MAP[crop.key]
          const label = state.language === 'hi' ? info.labelHi : info.label
          return (
            <option key={crop.key} value={crop.key}>
              {info.glyph} {label}
            </option>
          )
        })}
      </Select>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t('planner.area')}
          type="number"
          inputMode="decimal"
          min={0.1}
          max={100}
          step={0.1}
          required
          value={values.area}
          error={errorText('area')}
          hint={t('planner.areaHint')}
          onChange={(event) => setField('area', event.target.value, 'area')}
          data-testid="planner-area"
        />
        <Select
          label={t('planner.district')}
          required
          value={values.district}
          error={errorText('district')}
          onChange={(event) => setField('district', event.target.value, 'district')}
          data-testid="planner-district"
        >
          <option value="">{t('planner.districtPlaceholder')}</option>
          {DISTRICTS.map((district) => (
            <option key={district.name} value={district.name}>
              {district.name}, {district.state}
            </option>
          ))}
        </Select>
      </div>

      <Input
        label={startLabel}
        type="date"
        required
        value={values.sowingDate}
        error={errorText('date')}
        hint={startHint}
        onChange={(event) => setField('sowingDate', event.target.value, 'date')}
        data-testid="planner-date"
      />

      {cropInfo && meta ? (
        <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-3">
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-brand-800">
            <span aria-hidden="true">{cropInfo.glyph}</span>
            {state.language === 'hi' ? cropInfo.labelHi : cropInfo.label}
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-brand-700 ring-1 ring-brand-200">
              {state.language === 'hi' ? meta.seasonHi : meta.seasonEn}
            </span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-brand-800/80">{timingNote}</p>
        </div>
      ) : null}

      <div className={cn('flex flex-wrap items-center gap-3', onCancel && 'justify-end')}>
        {onCancel ? (
          <Button variant="secondary" onClick={onCancel}>
            {t('planner.cancel')}
          </Button>
        ) : null}
        <Button
          type="submit"
          fullWidth={!onCancel}
          leadingIcon={<CalendarRange className="h-4 w-4" />}
          data-testid="planner-submit"
        >
          {submitLabel}
        </Button>
      </div>

      <p className="flex items-start gap-1.5 text-xs leading-relaxed text-ink-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {note ?? t('planner.formNote')}
      </p>
    </form>
  )
}
