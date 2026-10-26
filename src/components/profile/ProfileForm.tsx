import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Camera, Check, LoaderCircle, Trash2, Upload } from 'lucide-react'

import { CROPS } from '@/data'
import { pick } from '@/lib/i18n'
import { ImageInputError, prepareProfilePhoto } from '@/lib/images'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Form'
import type { UiLanguage } from '@/store/types'

export interface ProfileDraft {
  name: string
  state: string
  district: string
  village: string
  primaryCrop: string
  landSize: string
  language: UiLanguage
  photoUrl?: string
}

export interface ProfileFormValue extends ProfileDraft {
  photoDataUrl?: string
  removePhoto?: boolean
}

interface ProfileFormProps {
  initial: ProfileDraft
  phone?: string
  submitLabel: string
  saving: boolean
  errors: Record<string, string>
  onSubmit: (value: ProfileFormValue) => void
  secondaryAction?: { label: string; onClick: () => void }
}

export function ProfileForm({
  initial,
  phone,
  submitLabel,
  saving,
  errors,
  onSubmit,
  secondaryAction,
}: ProfileFormProps) {
  const [name, setName] = useState(initial.name)
  const [stateName, setStateName] = useState(initial.state)
  const [district, setDistrict] = useState(initial.district)
  const [village, setVillage] = useState(initial.village)
  const [primaryCrop, setPrimaryCrop] = useState(initial.primaryCrop)
  const [landSize, setLandSize] = useState(initial.landSize)
  const [language, setLanguage] = useState<UiLanguage>(initial.language)
  const [photoPreview, setPhotoPreview] = useState(initial.photoUrl ?? '')
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>()
  const [removePhoto, setRemovePhoto] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [preparing, setPreparing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setPhotoError('')
    setPreparing(true)
    try {
      const dataUrl = await prepareProfilePhoto(file)
      setPhotoDataUrl(dataUrl)
      setPhotoPreview(dataUrl)
      setRemovePhoto(false)
    } catch (error) {
      setPhotoError(
        error instanceof ImageInputError
          ? error.message
          : pick(language, 'Could not prepare that photo.', 'वह फोटो तैयार नहीं हो सकी।'),
      )
    } finally {
      setPreparing(false)
    }
  }

  const handleRemovePhoto = () => {
    setPhotoDataUrl(undefined)
    setPhotoPreview('')
    setRemovePhoto(true)
    setPhotoError('')
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit({
      name,
      state: stateName,
      district,
      village,
      primaryCrop,
      landSize,
      language,
      photoDataUrl,
      removePhoto,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="profile-form">
      <div className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-surface-sunken p-4 sm:flex-row sm:items-center">
        <div className="relative">
          <Avatar
            name={name || 'Kisan'}
            src={photoPreview || undefined}
            size="lg"
            accent="bg-brand-600"
            className="h-16 w-16"
          />
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm ring-1 ring-ink-100">
            <Camera className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-900">
            {pick(language, 'Profile photo', 'प्रोफ़ाइल फोटो')}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-500">
            {pick(
              language,
              'Optional. It is resized in your browser and saved to your account.',
              'वैकल्पिक। यह आपके ब्राउज़र में छोटी होकर आपके खाते में सेव होती है।',
            )}
          </p>
          {photoError ? <p className="mt-1 text-xs font-medium text-danger-600">{photoError}</p> : null}
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleFile}
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileRef.current?.click()}
              disabled={preparing || saving}
              leadingIcon={
                preparing ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )
              }
            >
              {photoPreview
                ? pick(language, 'Change photo', 'फोटो बदलें')
                : pick(language, 'Add photo', 'फोटो जोड़ें')}
            </Button>
            {photoPreview ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleRemovePhoto}
                disabled={saving}
                leadingIcon={<Trash2 className="h-4 w-4" />}
              >
                {pick(language, 'Remove', 'हटाएँ')}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={pick(language, 'Full name', 'पूरा नाम')}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          autoComplete="name"
          error={errors.name}
          placeholder={pick(language, 'e.g. Ramesh Kumar', 'उदा. रमेश कुमार')}
          containerClassName="sm:col-span-2"
        />
        <Input
          label={pick(language, 'State', 'राज्य')}
          value={stateName}
          onChange={(event) => setStateName(event.target.value)}
          required
          autoComplete="address-level1"
          error={errors.state}
          placeholder={pick(language, 'e.g. Uttar Pradesh', 'उदा. उत्तर प्रदेश')}
        />
        <Input
          label={pick(language, 'District', 'ज़िला')}
          value={district}
          onChange={(event) => setDistrict(event.target.value)}
          required
          autoComplete="address-level2"
          error={errors.district}
          placeholder={pick(language, 'e.g. Rampur', 'उदा. रामपुर')}
        />
        <Input
          label={pick(language, 'Village', 'गाँव')}
          value={village}
          onChange={(event) => setVillage(event.target.value)}
          required
          autoComplete="address-level3"
          error={errors.village}
          placeholder={pick(language, 'e.g. Barkatpur', 'उदा. बरकतपुर')}
        />
        <Input
          label={pick(language, 'Land size', 'जोत का आकार')}
          value={landSize}
          onChange={(event) => setLandSize(event.target.value)}
          required
          error={errors.landSize}
          placeholder={pick(language, 'e.g. 2.5 acres', 'उदा. 2.5 एकड़')}
          hint={pick(language, 'Acres, hectares or bigha.', 'एकड़, हेक्टेयर या बीघा।')}
        />
        <Select
          label={pick(language, 'Primary crop', 'मुख्य फसल')}
          value={primaryCrop}
          onChange={(event) => setPrimaryCrop(event.target.value)}
          required
          error={errors.primaryCrop}
          containerClassName="sm:col-span-2"
        >
          <option value="">{pick(language, 'Choose a crop', 'फसल चुनें')}</option>
          {CROPS.map((crop) => (
            <option key={crop.key} value={crop.key}>
              {language === 'hi' ? crop.labelHi : crop.label}
            </option>
          ))}
        </Select>
        {phone ? (
          <div className="sm:col-span-2">
            <p className="text-sm font-medium text-ink-700">
              {pick(language, 'Verified mobile', 'सत्यापित मोबाइल')}
            </p>
            <p className="mt-1 inline-flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-800">
              <Check className="h-4 w-4" aria-hidden="true" />
              {phone}
            </p>
          </div>
        ) : null}
        <div className="sm:col-span-2">
          <p className="text-sm font-medium text-ink-700">
            {pick(language, 'Assistant language', 'सहायक की भाषा')}
          </p>
          <div className="mt-1.5 inline-flex rounded-xl border border-ink-200 bg-white p-1">
            {(['en', 'hi'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                aria-pressed={language === code}
                className={
                  language === code
                    ? 'rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white'
                    : 'rounded-lg px-3 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-50'
                }
              >
                {code === 'en' ? 'English' : 'हिंदी'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-ink-100 pt-4 sm:flex-row sm:justify-end">
        {secondaryAction ? (
          <Button type="button" variant="ghost" onClick={secondaryAction.onClick} disabled={saving}>
            {secondaryAction.label}
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={saving || preparing}
          leadingIcon={
            saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />
          }
        >
          {saving ? pick(language, 'Saving...', 'सेव हो रहा है...') : submitLabel}
        </Button>
      </div>
    </form>
  )
}
