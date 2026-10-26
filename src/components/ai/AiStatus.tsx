import { ChevronDown, CircleCheck, Server, ShieldCheck } from 'lucide-react'

import { AI_DISCLAIMER, AI_SAFETY_NOTE } from '@/data/aiKnowledge'
import { pick, useT } from '@/lib/i18n'

export interface AiStatusProps {
  language: 'en' | 'hi'
  chatConfigured: boolean
  visionConfigured: boolean
}

/**
 * A compact "Local AI" indicator. The full explanation of offline behaviour,
 * privacy, GroqCloud routing and photo limits lives in the collapsible help,
 * so the main page stays focused on the conversation.
 */
export function AiStatus({ language, chatConfigured, visionConfigured }: AiStatusProps) {
  const t = useT()

  return (
    <details
      data-testid="ai-status"
      className="group relative rounded-xl text-sm"
    >
      <summary
        data-testid="ai-status-summary"
        className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs text-ink-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800 [&::-webkit-details-marker]:hidden"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <span className="font-semibold text-ink-900">
          {chatConfigured
            ? pick(language, 'Local + Groq AI', 'स्थानीय + Groq AI')
            : pick(language, 'Local AI', 'स्थानीय AI')}
        </span>
        <span aria-hidden="true">·</span>
        <span>{pick(language, 'How it works', 'यह कैसे काम करता है')}</span>
        <ChevronDown
          className="h-3.5 w-3.5 shrink-0 transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>

      <div
        data-testid="ai-status-details"
        className="absolute right-0 top-full z-30 mt-2 max-h-[70vh] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-ink-200 bg-white px-4 py-3 shadow-pop"
      >
        <p className="text-sm font-semibold text-ink-900">{t('ai.status.title')}</p>

        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-ink-600">
          <li>{t('ai.status.offline')}</li>
          {chatConfigured ? (
            <li className="flex items-start gap-1.5">
              <Server className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden="true" />
              <span>
                {pick(
                  language,
                  'Local answers stay on this device. Only a question the local knowledge base cannot answer is sent to GroqCloud, with limited farm context - never your name or phone number.',
                  'स्थानीय उत्तर इसी डिवाइस पर रहते हैं। केवल वह सवाल जिसका जवाब स्थानीय ज्ञान-आधार में नहीं है, सीमित खेत-जानकारी के साथ GroqCloud को भेजा जाता है - आपका नाम या फ़ोन नंबर कभी नहीं।',
                )}
              </span>
            </li>
          ) : (
            <li>{t('ai.status.noRemote')}</li>
          )}
          <li>
            {chatConfigured
              ? pick(
                  language,
                  'Local answers are free. GroqCloud use follows the server operator’s plan and limits.',
                  'स्थानीय उत्तर निःशुल्क हैं। GroqCloud का उपयोग सर्वर संचालक की योजना और सीमाओं पर निर्भर है।',
                )
              : t('ai.status.free')}
          </li>
          <li>
            {visionConfigured
              ? pick(
                  language,
                  'A photo check you start can use GroqCloud vision for that request. The photo is not saved to your profile.',
                  'आपकी शुरू की गई फोटो जाँच उस अनुरोध के लिए GroqCloud vision का उपयोग कर सकती है। फोटो आपकी प्रोफ़ाइल में सेव नहीं होती।',
                )
              : pick(
                  language,
                  'Image analysis is not available in this build. A photo check gives a local checklist based on your description.',
                  'इस बिल्ड में छवि विश्लेषण उपलब्ध नहीं है। फोटो जाँच आपके विवरण पर आधारित स्थानीय सूची देती है।',
                )}
          </li>
          <li>{t('ai.status.topics')}</li>
        </ul>

        <div className="mt-3 flex items-start gap-2 border-t border-ink-100 pt-3">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden="true" />
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] leading-relaxed text-ink-500">
              {language === 'hi' ? AI_DISCLAIMER.hi : AI_DISCLAIMER.en}
            </p>
            <p className="text-[11px] leading-relaxed text-ink-500">
              {language === 'hi' ? AI_SAFETY_NOTE.hi : AI_SAFETY_NOTE.en}
            </p>
          </div>
        </div>
      </div>
    </details>
  )
}
