import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Camera, ImagePlus, Info, LoaderCircle, Sparkles, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Form'
import { CROP_MAP } from '@/data'
import { ApiClientError, analyzeCropPhoto, type PhotoAnalysis } from '@/lib/api'
import { pick } from '@/lib/i18n'
import { ImageInputError, prepareCropPhoto } from '@/lib/images'
import type { CropKey } from '@/store/types'

export interface PhotoCheckResult {
  analysis: PhotoAnalysis
  imageDataUrl: string
  description: string
}

export interface CropPhotoCheckProps {
  language: 'en' | 'hi'
  crop?: CropKey | ''
  visionConfigured: boolean | null
  onCompleted: (result: PhotoCheckResult) => void
  onCancel?: () => void
}

const SYMPTOM_OPTIONS = [
  { value: 'yellowing', en: 'Yellowing leaves', hi: 'पत्ते पीले होना' },
  { value: 'spots', en: 'Spots or lesions', hi: 'धब्बे या घाव' },
  { value: 'wilting', en: 'Wilting or drooping', hi: 'मुरझाना' },
  { value: 'pests', en: 'Insects or worm damage', hi: 'कीट या सुंडी का नुकसान' },
  { value: 'rotting', en: 'Rotting at base or roots', hi: 'जड़ या तने की सड़न' },
  { value: 'stunted', en: 'Poor or uneven growth', hi: 'कम या असमान बढ़वार' },
  { value: 'unclear', en: 'Not sure what I am seeing', hi: 'समझ नहीं आ रहा' },
]

const WATER_OPTIONS = [
  { value: 'dry', en: 'Too little water', hi: 'पानी बहुत कम' },
  { value: 'normal', en: 'Normal watering', hi: 'सामान्य सिंचाई' },
  { value: 'over', en: 'Too much water', hi: 'पानी बहुत ज़्यादा' },
  { value: 'waterlogged', en: 'Water standing in field', hi: 'खेत में पानी खड़ा' },
  { value: 'none', en: 'Rain only, no irrigation', hi: 'सिर्फ़ बारिश, सिंचाई नहीं' },
  { value: 'unclear', en: 'Not sure', hi: 'पता नहीं' },
]

export function CropPhotoCheck({
  language,
  crop,
  visionConfigured,
  onCompleted,
  onCancel,
}: CropPhotoCheckProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState('')
  const [description, setDescription] = useState('')
  const [symptom, setSymptom] = useState('')
  const [water, setWater] = useState('')
  const [age, setAge] = useState('')
  const [preparing, setPreparing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const cropMeta = crop ? CROP_MAP[crop] : null

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError('')
    setPreparing(true)
    try {
      const dataUrl = await prepareCropPhoto(file)
      setImageDataUrl(dataUrl)
      setPreview(dataUrl)
    } catch (fileError) {
      setError(
        fileError instanceof ImageInputError
          ? fileError.message
          : pick(
              language,
              'Could not open that photo. Try a JPG, PNG or WebP under 20 MB.',
              'वह फोटो खुल नहीं सकी। 20 MB से कम की JPG, PNG या WebP आज़माएँ।',
            ),
      )
    } finally {
      setPreparing(false)
    }
  }

  const clearPhoto = () => {
    setPreview('')
    setImageDataUrl('')
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!imageDataUrl) {
      setError(pick(language, 'Add a crop photo first.', 'पहले फसल की फोटो जोड़ें।'))
      return
    }
    if (!symptom) {
      setError(pick(language, 'Choose what you can see on the crop.', 'फसल पर क्या दिख रहा है चुनें।'))
      return
    }
    setBusy(true)
    try {
      const result = await analyzeCropPhoto({
        imageDataUrl,
        description: description.trim(),
        context: {
          crop: crop || undefined,
          symptom,
          water: water || undefined,
          age: age.trim() || undefined,
        },
        language,
      })
      onCompleted({
        analysis: result,
        imageDataUrl,
        description: description.trim(),
      })
    } catch (requestError) {
      if (requestError instanceof ApiClientError) {
        setError(
          requestError.code === 'rate_limited'
            ? pick(
                language,
                `Too many photo checks. Try again in ${requestError.retryAfter ?? 15} minutes.`,
                `बहुत फोटो जाँच हो गईं। ${requestError.retryAfter ?? 15} मिनट बाद कोशिश करें।`,
              )
            : requestError.message,
        )
      } else {
        setError(
          pick(
            language,
            'The photo check could not be completed. Please try again.',
            'फोटो जाँच पूरी नहीं हो सकी। कृपया दोबारा कोशिश करें।',
          ),
        )
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <section
      data-testid="photo-check"
      className="rounded-2xl border border-ink-200 bg-white p-4 shadow-card sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow flex items-center gap-1.5">
            <Camera className="h-3.5 w-3.5" aria-hidden="true" />
            {pick(language, 'Crop photo check', 'फसल फोटो जाँच')}
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-ink-900">
            {pick(language, 'Show us what you can see', 'जो दिख रहा है वह दिखाएं')}
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-500">
            {pick(
              language,
              'A clear photo plus a short description helps narrow down what to inspect next. This is a possibility list, not a confirmed diagnosis.',
              'साफ फोटो और छोटा विवरण अगली जाँच को आसान बनाता है। यह संभावनाओं की सूची है, पक्का निदान नहीं।',
            )}
          </p>
        </div>
        <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-info-50 text-info-700 sm:flex">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <div
        data-testid="photo-vision-note"
        className="mt-4 flex items-start gap-2 rounded-lg border border-ink-200 bg-surface-sunken px-3 py-2 text-xs leading-relaxed text-ink-600"
      >
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden="true" />
        {visionConfigured === null
          ? pick(
              language,
              'Checking image analysis availability.',
              'छवि विश्लेषण की उपलब्धता जाँची जा रही है।',
            )
          : visionConfigured
            ? pick(
                language,
                'Image analysis is available for this check only. The photo is not saved to your profile.',
                'छवि विश्लेषण केवल इस जाँच के लिए उपलब्ध है। फोटो आपकी प्रोफ़ाइल में सेव नहीं होती।',
              )
            : pick(
                language,
                'Image analysis unavailable — guidance will be based on your description.',
                'छवि विश्लेषण उपलब्ध नहीं है — मार्गदर्शन आपके विवरण पर आधारित होगा।',
              )}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleFile}
            data-testid="photo-input"
          />
          {preview ? (
            <div className="flex flex-col gap-3 rounded-xl border border-ink-200 bg-surface-sunken p-3 sm:flex-row sm:items-center">
              <img
                src={preview}
                alt={pick(language, 'Selected crop photo preview', 'चुनी गई फसल फोटो')}
                className="h-40 w-full rounded-lg object-cover sm:h-24 sm:w-32"
              />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                  <ImagePlus className="h-4 w-4 text-brand-600" aria-hidden="true" />
                  {pick(language, 'Photo ready', 'फोटो तैयार')}
                </p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {pick(
                    language,
                    'It was resized in your browser before upload.',
                    'अपलोड से पहले ब्राउज़र में इसे छोटा किया गया।',
                  )}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => fileRef.current?.click()}
                    disabled={busy || preparing}
                  >
                    {pick(language, 'Replace photo', 'फोटो बदलें')}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={clearPhoto}
                    disabled={busy}
                    leadingIcon={<Trash2 className="h-4 w-4" />}
                  >
                    {pick(language, 'Remove', 'हटाएँ')}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={preparing || busy}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 bg-surface-sunken px-4 py-8 text-center transition-colors hover:border-brand-300 hover:bg-brand-50/50 disabled:cursor-wait disabled:opacity-70"
            >
              {preparing ? (
                <LoaderCircle className="h-7 w-7 animate-spin text-brand-600" aria-hidden="true" />
              ) : (
                <Camera className="h-7 w-7 text-brand-600" aria-hidden="true" />
              )}
              <span className="text-sm font-semibold text-ink-900">
                {preparing
                  ? pick(language, 'Preparing photo...', 'फोटो तैयार हो रही है...')
                  : pick(language, 'Add a crop photo', 'फसल की फोटो जोड़ें')}
              </span>
              <span className="text-xs text-ink-500">
                {pick(language, 'JPG, PNG or WebP, up to 20 MB', 'JPG, PNG या WebP, 20 MB तक')}
              </span>
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label={pick(language, 'What can you see?', 'क्या दिख रहा है?')}
            value={symptom}
            onChange={(event) => setSymptom(event.target.value)}
            required
            data-testid="photo-symptom"
          >
            <option value="">{pick(language, 'Choose a symptom', 'लक्षण चुनें')}</option>
            {SYMPTOM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {language === 'hi' ? option.hi : option.en}
              </option>
            ))}
          </Select>
          <Select
            label={pick(language, 'Water situation', 'पानी की स्थिति')}
            value={water}
            onChange={(event) => setWater(event.target.value)}
          >
            <option value="">{pick(language, 'Optional', 'वैकल्पिक')}</option>
            {WATER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {language === 'hi' ? option.hi : option.en}
              </option>
            ))}
          </Select>
          <Input
            label={pick(language, 'Crop age or stage', 'फसल की उम्र या अवस्था')}
            value={age}
            onChange={(event) => setAge(event.target.value)}
            hint={pick(language, 'e.g. 4 weeks after sowing', 'उदा. बुवाई के 4 हफ्ते बाद')}
            placeholder={pick(language, 'Optional', 'वैकल्पिक')}
          />
          <div className="flex items-end">
            <div className="w-full rounded-xl border border-ink-100 bg-surface-sunken px-3 py-2 text-xs text-ink-600">
              <p className="font-semibold text-ink-800">
                {pick(language, 'Focus crop', 'मुख्य फसल')}
              </p>
              <p className="mt-0.5">
                {cropMeta
                  ? language === 'hi'
                    ? cropMeta.labelHi
                    : cropMeta.label
                  : pick(language, 'Not set in profile', 'प्रोफ़ाइल में सेट नहीं')}
              </p>
            </div>
          </div>
        </div>

        <Textarea
          label={pick(language, 'Describe the problem', 'समस्या का विवरण')}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          maxLength={800}
          hint={pick(
            language,
            'When did it start, which part is affected and whether it is patchy.',
            'कब शुरू हुआ, कौन-सा हिस्सा प्रभावित है और क्या धब्बों में है।',
          )}
          placeholder={pick(
            language,
            'e.g. Yellow spots on lower leaves for 4 days, one corner of the field.',
            'उदा. 4 दिन से निचली पत्तियों पर पीले धब्बे, खेत के एक कोने में।',
          )}
        />

        {error ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-danger-100 bg-danger-50 px-3 py-2 text-sm font-medium text-danger-700"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 border-t border-ink-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] leading-relaxed text-ink-500">
            {pick(
              language,
              'Do not rely on this check for pesticide or fertilizer decisions.',
              'कीटनाशक या उर्वरक के फैसले के लिए इस जाँच पर निर्भर न रहें।',
            )}
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            {onCancel ? (
              <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
                {pick(language, 'Back to chat', 'चैट पर लौटें')}
              </Button>
            ) : null}
            <Button
              type="submit"
              disabled={busy || preparing || !imageDataUrl || !symptom}
              data-testid="analyze-photo"
              leadingIcon={
                busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />
              }
            >
              {busy
                ? pick(language, 'Checking photo...', 'फोटो जाँची जा रही है...')
                : pick(language, 'Check this photo', 'यह फोटो जाँचें')}
            </Button>
          </div>
        </div>
      </form>
    </section>
  )
}
