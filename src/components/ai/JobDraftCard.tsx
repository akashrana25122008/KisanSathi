import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, ClipboardList, Info } from 'lucide-react'

import { CROPS, DISTRICTS } from '@/data'
import { JOB_ACTIVITIES } from '@/lib/jobs'
import {
  missingDraftKeys,
  type DraftField,
  type DraftFieldKey,
  type JobDraft,
} from '@/lib/aiEngine'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Form'

function todayISO(): string {
  const now = new Date()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const day = `${now.getDate()}`.padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/** Human label for a draft field in the active language. */
function labelOf(field: DraftField, language: 'en' | 'hi'): string {
  return language === 'hi' ? field.labelHi : field.labelEn
}

export interface JobDraftCardProps {
  draft: JobDraft
  language: 'en' | 'hi'
  /** Opens the existing post form with the reviewed values. */
  onConfirm: (fields: DraftField[]) => void
}

/**
 * An editable, self-contained job draft. Nothing is published here - the
 * farmer must review every value and explicitly open the real posting form.
 */
export function JobDraftCard({ draft, language, onConfirm }: JobDraftCardProps) {
  const t = useT()

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(draft.fields.map((field) => [field.key, field.value])),
  )

  // The live field list with the farmer's edits applied.
  const fields = useMemo(
    () => draft.fields.map((field) => ({ ...field, value: values[field.key] ?? '' })),
    [draft.fields, values],
  )

  const missingKeys = useMemo(() => missingDraftKeys(fields), [fields])

  const invalidNumbers = useMemo(
    () =>
      fields.some(
        (field) =>
          field.type === 'number' &&
          (!Number.isFinite(Number(field.value)) || Number(field.value) < 1),
      ),
    [fields],
  )

  const canConfirm = missingKeys.length === 0 && !invalidNumbers

  const update = (key: DraftFieldKey, value: string) =>
    setValues((current) => ({ ...current, [key]: value }))

  const missingLabels = missingKeys.map((key) => {
    const field = draft.fields.find((item) => item.key === key)
    return field ? labelOf(field, language) : key
  })

  const renderControl = (field: DraftField) => {
    const label = labelOf(field, language)
    const isMissing = missingKeys.includes(field.key)
    const error = isMissing ? t('ai.missing') : undefined
    const shared = {
      label,
      error,
      value: field.value,
    }

    if (field.type === 'select') {
      const options =
        field.key === 'crop'
          ? CROPS.map((crop) => ({ value: crop.key, label: `${crop.glyph} ${crop.label}` }))
          : field.key === 'district'
            ? DISTRICTS.map((district) => ({
                value: district.name,
                label: `${district.name}, ${district.state}`,
              }))
            : JOB_ACTIVITIES.map((activity) => ({ value: activity, label: activity }))

      return (
        <Select
          key={field.key}
          label={label}
          error={error}
          value={field.value}
          onChange={(event) => update(field.key, event.target.value)}
        >
          <option value="">{language === 'hi' ? 'चुनें…' : 'Select…'}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      )
    }

    if (field.type === 'date') {
      return (
        <Input
          key={field.key}
          {...shared}
          type="date"
          min={todayISO()}
          onChange={(event) => update(field.key, event.target.value)}
        />
      )
    }

    if (field.type === 'number') {
      return (
        <Input
          key={field.key}
          {...shared}
          type="number"
          inputMode="numeric"
          min={1}
          onChange={(event) => update(field.key, event.target.value)}
        />
      )
    }

    if (field.key === 'description') {
      return (
        <Textarea
          key={field.key}
          {...shared}
          containerClassName="sm:col-span-2"
          rows={2}
          maxLength={400}
          placeholder={
            language === 'hi'
              ? 'मज़दूरों को क्या बताना है? (वैकल्पिक)'
              : 'Anything workers should know? (optional)'
          }
          onChange={(event) => update(field.key, event.target.value)}
        />
      )
    }

    return (
      <Input
        key={field.key}
        {...shared}
        containerClassName={field.key === 'title' ? 'sm:col-span-2' : undefined}
        maxLength={field.key === 'title' ? 80 : 60}
        onChange={(event) => update(field.key, event.target.value)}
      />
    )
  }

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-brand-200 bg-white" data-testid="job-draft">
      <div className="flex flex-wrap items-center gap-2 border-b border-brand-100 bg-brand-50 px-3 py-2">
        <ClipboardList className="h-4 w-4 text-brand-700" aria-hidden="true" />
        <p className="text-sm font-semibold text-brand-800">{t('ai.draftTitle')}</p>
        <span className="ml-auto text-[11px] font-medium text-brand-700">
          {t('ai.draftReview')}
        </span>
      </div>

      <div className="p-3">
        <div className="grid gap-3 sm:grid-cols-2">{fields.map(renderControl)}</div>

        {draft.warnings.length > 0 ? (
          <ul className="mt-3 space-y-1.5 rounded-lg border border-harvest-200 bg-harvest-50 p-2.5">
            {draft.warnings.map((warning) => (
              <li
                key={warning.en}
                className="flex items-start gap-1.5 text-xs leading-relaxed text-harvest-800"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {language === 'hi' ? warning.hi : warning.en}
              </li>
            ))}
          </ul>
        ) : null}

        {missingKeys.length > 0 ? (
          <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-danger-50 p-2.5 text-xs leading-relaxed text-danger-700" data-testid="draft-missing">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {language === 'hi'
              ? `अनुपस्थित: ${missingLabels.join(', ')}। इन्हें ऊपर भरें - मान अनुमान नहीं लगाए जाते।`
              : `Missing: ${missingLabels.join(', ')}. Fill these above - values are never guessed.`}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button
            data-testid="draft-confirm"
            onClick={() => onConfirm(fields)}
            disabled={!canConfirm}
            leadingIcon={<CheckCircle2 className="h-4 w-4" />}
          >
            {t('ai.confirmOpen')}
          </Button>
          <p
            className={cn(
              'text-xs',
              canConfirm ? 'text-ink-500' : 'font-medium text-danger-600',
            )}
          >
            {canConfirm
              ? t('ai.confirmHint')
              : language === 'hi'
                ? 'आगे बढ़ने के लिए हाइलाइट किए गए फ़ील्ड भरें।'
                : 'Fill the highlighted fields to continue.'}
          </p>
        </div>
      </div>
    </div>
  )
}
