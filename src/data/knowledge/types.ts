import type { CropKey } from '@/store/types'

/**
 * ---------------------------------------------------------------------------
 * Types for the local, offline farming knowledge base
 * ---------------------------------------------------------------------------
 * Everything here is plain data so that it can be checked by reading the file.
 * No network call, no model, no key.
 */

export type KnowledgeSource = {
  /** Human-readable source title. */
  title: string
  /** Who publishes it - helps the farmer judge how much to trust it. */
  org?: string
  /**
   * Working reference URL. Only set when the link has been verified to
   * resolve; general guidance deliberately carries no URL rather than a
   * plausible-looking one.
   */
  url?: string
  /** 'sourced' = points at a known public reference; 'general' = local guidance. */
  kind: 'sourced' | 'general'
}

/** The topics the assistant can talk about. Used for intent detection. */
export type KnowledgeCategory =
  | 'crop-planning'
  | 'cultivation'
  | 'soil'
  | 'water'
  | 'pest-disease'
  | 'rotation-weeds'
  | 'post-harvest'
  | 'livestock'
  | 'schemes-services'
  | 'live-data'
  | 'economics'

export type Localized = { en: string; hi: string }
export type LocalizedList = { en: string[]; hi: string[] }

/**
 * The four parts every good farming answer has. The assistant renders them in
 * this order so the farmer always sees the direct answer first.
 */
export type KnowledgeContent = {
  /** The short, direct answer to the question. */
  direct: Localized
  /** What the farmer can actually do next. */
  steps: LocalizedList
  /** What can go wrong if this is ignored. */
  precautions: LocalizedList
  /** When the answer is not enough and an expert is needed. */
  consult: Localized
}

export type KnowledgeEntry = {
  id: string
  /** Broad topic - used to route a question that matches several entries. */
  category?: KnowledgeCategory
  /** Keywords and phrases in English, Hindi and Hinglish for matching. */
  keywords: string[]
  /** Broad sub-topics for routing (legacy entries only). */
  tags?: string[]
  /** Crops this entry is specifically about (optional). */
  crops?: CropKey[]
  /** Short question/topic this answers. */
  question: string
  questionHi: string
  /** Answer in English. */
  answerEn: string
  /** Answer in Hindi (concise, practical). */
  answerHi: string
  /** Sources/references. */
  sources: KnowledgeSource[]
  /** If true, we should ask for more context. */
  needsContext?: boolean
  /** Hints about what context to ask for. */
  contextHints?: string[]
  /**
   * True when the topic is about information that changes every day (weather,
   * prices, scheme status). The assistant answers these honestly instead of
   * pretending to have a live feed.
   */
  liveData?: boolean
}

/**
 * Builds a knowledge entry from the four structured parts and renders the
 * plain-text answer that is shown in the chat.
 */
export function defineEntry(
  entry: Omit<KnowledgeEntry, 'answerEn' | 'answerHi'> & {
    content: KnowledgeContent
  },
): KnowledgeEntry {
  const { content, ...rest } = entry
  return {
    ...rest,
    answerEn: composeAnswer(content, 'en'),
    answerHi: composeAnswer(content, 'hi'),
  }
}

/** Renders the structured content as the chat answer. */
export function composeAnswer(content: KnowledgeContent, language: 'en' | 'hi'): string {
  const isHi = language === 'hi'
  const blocks: string[] = [isHi ? content.direct.hi : content.direct.en]

  const steps = isHi ? content.steps.hi : content.steps.en
  if (steps.length > 0) {
    blocks.push(
      `${isHi ? 'व्यावहारिक अगले कदम' : 'Practical next steps'}:\n${steps
        .map((step) => `- ${step}`)
        .join('\n')}`,
    )
  }

  const precautions = isHi ? content.precautions.hi : content.precautions.en
  if (precautions.length > 0) {
    blocks.push(
      `${isHi ? 'ध्यान रखने वाली बातें' : 'Precautions'}:\n${precautions
        .map((item) => `- ${item}`)
        .join('\n')}`,
    )
  }

  const consult = isHi ? content.consult.hi : content.consult.en
  if (consult.trim()) {
    blocks.push(
      `${isHi ? 'KVK / कृषि विशेषज्ञ से कब सलाह लें' : 'When to consult a KVK or agricultural expert'}:\n${consult}`,
    )
  }

  return blocks.join('\n\n')
}
