import { AI_KNOWLEDGE_BASE } from '@/data/knowledge'

export type {
  KnowledgeCategory,
  KnowledgeContent,
  KnowledgeEntry,
  KnowledgeSource,
  Localized,
  LocalizedList,
} from '@/data/knowledge'
export { VERIFIED_SOURCE_URLS } from '@/data/knowledge'

/**
 * ---------------------------------------------------------------------------
 * CURATED LOCAL KNOWLEDGE BASE (KisanSathi AI - Local Prototype)
 * ---------------------------------------------------------------------------
 * All content is hand-curated and ships inside the app. Information here is
 * general guidance only - not a substitute for expert/local advice.
 * Claims are either marked as "sourced" with reference titles/URLs or as
 * "general suggestion". We never fabricate citations, current weather,
 * mandi prices, scheme eligibility, fertilizer dosages, or pesticide
 * instructions.
 *
 * The entries themselves live in `src/data/knowledge/` - one file per topic -
 * so the topic list stays readable. This module keeps the public surface
 * that the rest of the app imports.
 */

export { AI_KNOWLEDGE_BASE }

export const AI_DISCLAIMER = {
  en: 'This is KisanSathi AI - a local prototype with a curated knowledge base. It is not a live AI service or a substitute for advice from a Krishi Vigyan Kendra (KVK) or a qualified agricultural expert.',
  hi: 'यह किसानसाथी AI एक स्थानीय प्रोटोटाइप है जिसमें क्यूरेटेड नॉलेज बेस है। यह लाइव AI सेवा नहीं है और किसी विशेषज्ञ या कृषि विज्ञान केंद्र (KVK) की सलाह का विकल्प नहीं है।',
}

export const AI_SAFETY_NOTE = {
  en: 'For fertilizer doses, pesticide use, government scheme eligibility, mandi prices, or current weather, please consult your local KVK/extension officer - these change frequently and must not be guessed.',
  hi: 'उर्वरक की मात्रा, कीटनाशक, सरकारी योजनाओं की पात्रता, मंडी भाव या मौसम की जानकारी के लिए अपने स्थानीय KVK या कृषि विस्तार अधिकारी से संपर्क करें - ये लगातार बदलते हैं और अनुमान नहीं लगाना चाहिए।',
}

/** Quick prompt suggestions shown in the UI. */
export const AI_SUGGESTIONS = [
  {
    id: 's1',
    textEn: 'How do I plan crop rotation for this season?',
    textHi: 'इस मौसम के लिए फसल चक्र की योजना कैसे बनाएं?',
  },
  {
    id: 's2',
    textEn: 'When should I irrigate wheat?',
    textHi: 'गेहूँ में सिंचाई कब करें?',
  },
  {
    id: 's3',
    textEn: 'General tips for pest scouting',
    textHi: 'कीट निगरानी के सामान्य सुझाव',
  },
  {
    id: 's4',
    textEn: 'Which crop should I grow on my land?',
    textHi: 'मेरी ज़मीन पर कौन सी फसल लगाएं?',
  },
  {
    id: 's5',
    textEn: 'How do I test my soil and use compost?',
    textHi: 'मिट्टी की जांच और कम्पोस्ट कैसे करें?',
  },
  {
    id: 's6',
    textEn: 'How do I store grain after harvest?',
    textHi: 'कटाई के बाद दाना कैसे सुरक्षित रखें?',
  },
  {
    id: 's7',
    textEn: 'What government schemes can I apply for?',
    textHi: 'मैं किन सरकारी योजनाओं के लिए आवेदन कर सकता हूँ?',
  },
  {
    id: 's8',
    textEn: 'Help me draft a job: need 8 workers for wheat harvesting in Rampur on Friday at 1,500/day',
    textHi: 'मदद करें: शुक्रवार को रामपुर में गेहूँ की कटाई के लिए 8 मजदूर चाहिए, 1,500 रुपये प्रतिदिन',
  },
]
