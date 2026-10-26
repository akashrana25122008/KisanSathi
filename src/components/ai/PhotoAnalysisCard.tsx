import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Eye,
  Info,
  Microscope,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'

import type { PhotoAnalysis } from '@/lib/api'
import { pick } from '@/lib/i18n'

const CONFIDENCE_STYLES = {
  low: 'bg-harvest-100 text-harvest-800',
  medium: 'bg-info-100 text-info-800',
  high: 'bg-brand-100 text-brand-800',
}

export interface PhotoAnalysisCardProps {
  analysis: PhotoAnalysis
  language: 'en' | 'hi'
  imageDataUrl?: string
  description?: string
}

export function PhotoAnalysisCard({
  analysis,
  language,
  imageDataUrl,
  description,
}: PhotoAnalysisCardProps) {
  const analyzed = analysis.visionAnalyzed
  const confidenceLabel =
    analysis.confidence === 'high'
      ? pick(language, 'Higher confidence', 'अधिक भरोसा')
      : analysis.confidence === 'medium'
        ? pick(language, 'Some confidence', 'कुछ भरोसा')
        : pick(language, 'Low confidence', 'कम भरोसा')

  return (
    <div
      data-testid="photo-analysis"
      data-vision-analyzed={analyzed ? 'true' : 'false'}
      className="mt-3 overflow-hidden rounded-xl border border-ink-200 bg-surface-sunken"
    >
      {imageDataUrl ? (
        <div className="flex flex-col gap-3 border-b border-ink-200 bg-white p-3 sm:flex-row">
          <img
            src={imageDataUrl}
            alt={pick(language, 'Uploaded crop photo', 'अपलोड की गई फसल फोटो')}
            className="h-36 w-full rounded-lg object-cover sm:h-28 sm:w-28"
          />
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-semibold text-ink-700">
              <Camera className="h-3 w-3" aria-hidden="true" />
              {pick(language, 'Crop photo check', 'फसल फोटो जाँच')}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-600">
              {description ||
                pick(
                  language,
                  'Checked with the details you provided.',
                  'आपकी दी गई जानकारी के साथ जाँचा गया।',
                )}
            </p>
          </div>
        </div>
      ) : null}

      <div className="p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={
              analyzed
                ? 'inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-2.5 py-1 text-[11px] font-semibold text-brand-800'
                : 'inline-flex items-center gap-1.5 rounded-full bg-harvest-100 px-2.5 py-1 text-[11px] font-semibold text-harvest-900'
            }
          >
            {analyzed ? (
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {analyzed
              ? pick(language, 'Photo analysed by server vision', 'सर्वर vision से फोटो जाँची गई')
              : pick(language, 'Photo not analysed - local check', 'फोटो जाँची नहीं गई - स्थानीय जाँच')}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${CONFIDENCE_STYLES[analysis.confidence]}`}
          >
            <Microscope className="h-3.5 w-3.5" aria-hidden="true" />
            {confidenceLabel}
          </span>
        </div>

        {analyzed ? null : (
          <p
            data-testid="photo-not-analyzed"
            className="mt-3 flex items-start gap-2 rounded-lg border border-harvest-200 bg-harvest-50 px-3 py-2 text-xs font-medium leading-relaxed text-harvest-900"
          >
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {pick(
              language,
              'Image analysis unavailable — guidance is based on your description.',
              'छवि विश्लेषण उपलब्ध नहीं है — मार्गदर्शन आपके विवरण पर आधारित है।',
            )}
          </p>
        )}

        <p
          className={
            analyzed
              ? 'mt-3 flex items-start gap-2 rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-xs leading-relaxed text-brand-900'
              : 'mt-3 flex items-start gap-2 rounded-lg border border-harvest-200 bg-harvest-50 px-3 py-2 text-xs leading-relaxed text-harvest-900'
          }
        >
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {analysis.notice}
        </p>

        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            {pick(language, 'Possible issue', 'संभावित समस्या')}
          </p>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-ink-900">
            {analysis.possibleIssue}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-600">{analysis.whyItMayFit}</p>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-ink-200 bg-white p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
              <Stethoscope className="h-3.5 w-3.5" aria-hidden="true" />
              {pick(language, 'What to inspect', 'क्या जाँचें')}
            </p>
            <ul className="mt-2 space-y-1.5">
              {analysis.whatToInspect.map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-xs leading-relaxed text-ink-700">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-400" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-ink-200 bg-white p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
              <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
              {pick(language, 'Safe next steps', 'सुरक्षित अगले कदम')}
            </p>
            <ul className="mt-2 space-y-1.5">
              {analysis.safeNextSteps.map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-xs leading-relaxed text-ink-700">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-3 rounded-lg bg-white px-3 py-2 text-xs leading-relaxed text-ink-700 ring-1 ring-ink-200">
          <span className="font-semibold text-ink-900">
            {pick(language, 'When to contact a KVK: ', 'KVK से कब मिलें: ')}
          </span>
          {analysis.whenToContactKvk}
        </p>

        <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-ink-500">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {analysis.disclaimer}
        </p>
      </div>
    </div>
  )
}
