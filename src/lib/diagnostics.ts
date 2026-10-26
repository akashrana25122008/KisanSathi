import { CROP_MAP } from '@/data'
import {
  AGE_LABELS,
  CONDITION_LABELS,
  DIAGNOSTIC_CAUSES,
  DIAGNOSTIC_SOURCES,
  SYMPTOM_LABELS,
  WATER_LABELS,
  type DiagnosticAge,
  type DiagnosticCause,
  type DiagnosticConditions,
  type DiagnosticSymptom,
  type DiagnosticWater,
} from '@/data/aiDiagnostics'
import type { KnowledgeSource } from '@/data/aiKnowledge'
import { findCrop } from '@/lib/cropDetect'
import { normalizeText, stripNukta as stripNuktaText, toAsciiDigits } from '@/lib/text'
import type { CropKey } from '@/store/types'

/**
 * ---------------------------------------------------------------------------
 * KisanSathi AI - guided crop diagnostic (local, multi-turn)
 * ---------------------------------------------------------------------------
 * This is a real conversational state machine, not a keyword lookup. The
 * session remembers the crop, the reported symptom, the plant age, the
 * watering situation and the recent conditions, asks for the next missing
 * piece one question at a time, and finally produces a ranked list of
 * *possible* causes with the reasons, the checks and the safe next steps.
 *
 * It never confirms a diagnosis, never names a pesticide, never gives a
 * fertilizer dose and never invents weather, prices or scheme details.
 */

/* ---------------------------------------------------------------------------
   Types
   --------------------------------------------------------------------------- */

export type DiagnosticStage = 'crop' | 'age' | 'symptom' | 'water' | 'conditions'

export interface DiagnosticAnswer {
  stage: DiagnosticStage
  questionEn: string
  questionHi: string
  answerEn: string
  answerHi: string
}

export interface DiagnosticSession {
  id: string
  /** True once a diagnostic conversation has been started. */
  started: boolean
  /** True once the analysis has been delivered. */
  finished: boolean
  crop?: CropKey
  age?: DiagnosticAge
  symptom?: DiagnosticSymptom
  water?: DiagnosticWater
  conditions?: DiagnosticConditions
  /** Every question that was asked and the answer that was understood. */
  answers: DiagnosticAnswer[]
  /** Extra free-text notes the farmer added after the analysis. */
  notes: string[]
  startedAt: number
  updatedAt: number
}

export interface DiagnosticOutcome {
  kind: 'question' | 'analysis' | 'restarted'
  textEn: string
  textHi: string
  sources: KnowledgeSource[]
  needsContext: boolean
  contextHints: string[]
  /** Short label of the step, used by the UI status line. */
  stageLabelEn: string
  stageLabelHi: string
}

export interface QuickReply {
  textEn: string
  textHi: string
}

/* ---------------------------------------------------------------------------
   Term matching helpers
   --------------------------------------------------------------------------- */

/** Removes the Devanagari nukta so "बढ़" and "बढ" compare equal. */
function stripNukta(text: string): string {
  return stripNuktaText(text)
}

/** Normalises a farmer's message for matching (digits + nukta friendly). */
function normalizeDiag(text: string): string {
  return stripNukta(normalizeText(toAsciiDigits(text)))
}

function hasTerm(normalized: string, term: string): boolean {
  const needle = stripNukta(term)
  if (/[\u0900-\u097F]/.test(needle)) return normalized.includes(needle)
  if (needle.includes(' ')) {
    /* The padded text makes the phrase match at the start, in the middle and
       at the end of the message - and also when the message *is* the phrase
       ("not sure", "standing water"). */
    return ` ${normalized} `.includes(` ${needle} `)
  }
  if (` ${normalized} `.includes(` ${needle} `)) return true
  /* Farmers write the same word in another form ("rained", "wilting",
     "spotted"). A prefix match keeps the check useful; short words are left
     alone so that they cannot match something unrelated. */
  if (needle.length < 4) return false
  return ` ${normalized} `.split(' ').some((word) => word.startsWith(needle))
}

/** True when every given word appears in the message (order free). */
function hasAllWords(normalized: string, words: string[]): boolean {
  return words.every((word) => hasTerm(normalized, word))
}

function hasAny(normalized: string, terms: string[]): boolean {
  return terms.some((term) => hasTerm(normalized, term))
}

/* ---------------------------------------------------------------------------
   Question catalogue
   --------------------------------------------------------------------------- */

const STAGE_LABEL: Record<DiagnosticStage, { en: string; hi: string }> = {
  crop: { en: 'Crop', hi: 'फसल' },
  age: { en: 'Plant age', hi: 'पौधे की उम्र' },
  symptom: { en: 'Visible symptoms', hi: 'दिखने वाले लक्षण' },
  water: { en: 'Watering and drainage', hi: 'सिंचाई और जल निकास' },
  conditions: { en: 'Recent conditions', hi: 'हाल की परिस्थितियाँ' },
}

const STAGE_QUESTION: Record<DiagnosticStage, { en: string; hi: string }> = {
  crop: {
    en: 'Which crop is affected? You can say potato, wheat, tomato, paddy, cotton, maize, onion, chilli, mustard, soybean, sugarcane or groundnut.',
    hi: 'कौन सी फसल प्रभावित है? आलू, गेहूँ, टमाटर, धान, कपास, मक्का, प्याज, मिर्च, सरसों, सोयाबीन, गन्ना या मूंगफली कह सकते हैं।',
  },
  age: {
    en: 'How old are the plants? (just sown · 1-2 weeks · 3-6 weeks · 1-3 months · older and flowering)',
    hi: 'पौधे कितने दिन के हैं? (अभी बुवाई की · 1-2 सप्ताह · 3-6 सप्ताह · 1-3 महीने · पुराने और फूल आ रहे हैं)',
  },
  symptom: {
    en: 'What can you see on the plants? (yellow leaves · wilting · no growth · spots on the leaves · insects or worms · rotting at the base · not sure)',
    hi: 'पौधों पर क्या दिख रहा है? (पत्ते पीले · मुरझाना · बढ़वार नहीं हो रही · पत्तों पर धब्बे · कीट या सुंडी · जड़ में सड़न · पता नहीं)',
  },
  water: {
    en: 'How is the field watered? (too little water · a normal schedule · too much water or water standing in the field · no irrigation, rain only)',
    hi: 'खेत में पानी कैसा है? (पानी बहुत कम · सामान्य सिंचाई · बहुत ज़्यादा पानी या खेत में पानी खड़ा · सिंचाई नहीं, सिर्फ़ बारिश)',
  },
  conditions: {
    en: 'What has happened in the last week or two? (heavy rain · a hot spell · cold nights or frost · nothing unusual)',
    hi: 'पिछले एक-दो हफ़्ते में क्या हुआ? (तेज़ बारिश · तेज़ गर्मी · ठंडी रातें या पाला · कुछ ख़ास नहीं)',
  },
}

const UNSURE_TERMS = [
  'not sure',
  'dont know',
  "don't know",
  'no idea',
  'unclear',
  ' pata nahi',
  'pata nahi',
  'मालूम नहीं',
  'पता नहीं',
  'जानकारी नहीं',
]

const RESTART_TERMS = [
  'restart',
  'start over',
  'start again',
  'reset',
  'new check',
  'fresh start',
  'restart karo',
  'restart kro',
  'dubara',
  'phir se',
  'phir se shuru',
  'नया चेक',
  'शुरू से',
  'दोबारा',
  'रीसेट',
]

/* ---------------------------------------------------------------------------
   Symptom detection (used to recognise the very first question and the
   answers that arrive during the conversation)
   --------------------------------------------------------------------------- */

const SYMPTOM_TERMS: Array<{ symptom: DiagnosticSymptom; terms: string[] }> = [
  {
    symptom: 'yellowing',
    terms: [
      'yellow',
      'yellowing',
      'yellowish',
      'pale',
      'pila',
      'pili',
      'peela',
      'peeli',
      'पीले',
      'पीला',
      'पीली',
      'पीलापन',
    ],
  },
  {
    symptom: 'wilting',
    terms: [
      'wilt',
      'wilting',
      'wilted',
      'drooping',
      'droop',
      'marg raha',
      'marg rahe',
      'marg gaye',
      'suk raha',
      'suk rahi',
      'मुरझा',
      'मुरझाना',
      'मर रहे',
      'सूख रहे',
      'सूखे',
    ],
  },
  {
    symptom: 'rotting',
    terms: ['rotting', 'rotted', 'root rot', 'सड़', 'सड़न', 'गले', 'गला', 'sad hua'],
  },
  {
    symptom: 'pests',
    terms: [
      'insect',
      'insects',
      'aphid',
      'aphids',
      'worm',
      'worms',
      'borer',
      'bug',
      'bugs',
      'keet',
      'kide',
      'keeda',
      'sundi',
      'कीट',
      'कीड़े',
      'कीड़ा',
      'सुंडी',
      'इल्ली',
      'माहू',
    ],
  },
  {
    symptom: 'spots',
    terms: ['spot', 'spots', 'lesion', 'lesions', 'rust', 'dhabbe', 'dhabba', 'धब्बे', 'धब्बा', 'दागे'],
  },
  {
    symptom: 'stunted',
    terms: [
      'not growing',
      'not grow',
      'no growth',
      'not sprouting',
      'not developing',
      'slow growth',
      'growing slowly',
      'slowly',
      'stunted',
      'poor growth',
      'nahi badh',
      'nahi ho raha',
      'nahi ho rahe',
      'nahi ho rahi',
      'grow nahi',
      'badh nahi',
      'बढ़ नहीं',
      'बढ़ नही',
      'बढ़ना नहीं',
      'नहीं बढ़',
      'बढ़वार',
      'धीमी',
    ],
  },
]

/** Words that mean "the whole crop", used when no crop name is given. */
const GENERIC_CROP_TERMS = [
  'crop',
  'plants',
  'plant',
  'फसल',
  'पौधे',
  'पौधों',
  'पौधा',
  'खेत',
]

/* ---------------------------------------------------------------------------
   Parsers
   --------------------------------------------------------------------------- */

function parseAge(text: string): DiagnosticAge | undefined {
  const n = normalizeDiag(text)
  if (hasAny(n, UNSURE_TERMS)) return 'unclear'

  const num = '(\\d{1,2}|a|an|one|two|three|four|five|six|seven|eight|nine|ten|ek|do|teen|char|paanch|tees)'

  const months = n.match(
    new RegExp(`${num}\\s*(?:-\\s*\\d{1,2}\\s*)?(?:month|months|mahina|mahine|महीना|महीने)`),
  )
  if (months) return 'growing'

  const weeks = n.match(
    new RegExp(
      `${num}\\s*(?:-\\s*\\d{1,2}\\s*)?(?:week|weeks|saptah|saptaah|hafte|hafta|haftay|hafton|सप्ताह)`,
    ),
  )
  if (weeks) return 'young'

  const days = n.match(new RegExp(`${num}\\s*(?:day|days|din|dina|dine|दिन)`))
  if (days) return 'young'

  if (
    hasAny(n, [
      'just sown',
      'just planted',
      'newly sown',
      'just germinated',
      'lagaya',
      'lagayi',
      'naya',
      'naye',
      'ताजा',
      'अभी',
      'बुवाई',
      'लगाया',
      'लगाई',
    ])
  ) {
    return 'just-sown'
  }

  if (
    hasAny(n, [
      'flowering',
      'fruiting',
      'ready for harvest',
      'mature plant',
      'pakne',
      'phool',
      'फूल',
      'फल',
      'पक',
    ])
  ) {
    return 'mature'
  }

  return undefined
}

function parseSymptom(text: string): DiagnosticSymptom | undefined {
  const n = normalizeDiag(text)
  if (hasAny(n, UNSURE_TERMS)) return 'unclear'
  for (const entry of SYMPTOM_TERMS) {
    if (hasAny(n, entry.terms)) return entry.symptom
  }
  return undefined
}

function parseWater(text: string): DiagnosticWater | undefined {
  const n = normalizeDiag(text)
  if (hasAny(n, UNSURE_TERMS)) return 'unclear'

  if (
    hasAny(n, [
      'standing water',
      'waterlogged',
      'water logged',
      'water standing',
      'paani khada',
      'paani ruka',
      'पानी खड़ा',
      'पानी रुका',
      'जलभरा',
      'जल भरा',
      'बहुत ज़्यादा पानी',
      'बहुत ज्यादा पानी',
    ])
  ) {
    return 'waterlogged'
  }

  /* "water is standing in the field" - the two words come in any order. */
  if (hasAllWords(n, ['standing', 'water'])) return 'waterlogged'

  if (
    hasAny(n, [
      'no irrigation',
      'without irrigation',
      'rainfed',
      'rain fed',
      'only rain',
      'no watering',
      'bina sinchai',
      'बिना सिंचाई',
      'सिर्फ बारिश',
      'सिर्फ़ बारिश',
      'पानी नहीं',
    ])
  ) {
    return 'none'
  }

  if (
    hasAny(n, [
      'too much water',
      'over water',
      'overwater',
      'excess water',
      'more water',
      'extra water',
      'bahut paani',
      'bahut sinchai',
      'बहुत पानी',
      'बहुत सिंचाई',
      'ज़्यादा पानी',
      'ज्यादा पानी',
      'ज़्यादा सिंचाई',
      'ज्यादा सिंचाई',
      'अधिक सिंचाई',
    ])
  ) {
    return 'over'
  }

  if (
    hasAny(n, [
      'too little water',
      'less water',
      'very dry',
      'dry soil',
      'soil is dry',
      'thirsty',
      'kam paani',
      'paani kam',
      'sookha',
      'सूख',
      'कम पानी',
      'पानी कम',
    ])
  ) {
    return 'dry'
  }

  if (
    hasAny(n, [
      'normal',
      'regular',
      'every day',
      'daily',
      'theek',
      'ठीक',
      'समान्य',
      'नियमित',
      'हर दिन',
    ])
  ) {
    return 'normal'
  }

  return undefined
}

function parseConditions(text: string): DiagnosticConditions | undefined {
  const n = normalizeDiag(text)
  if (hasAny(n, UNSURE_TERMS)) return 'unclear'

  if (hasAny(n, ['rain', 'rainfall', 'storm', 'बारिश', 'वर्षा', 'तूफान', 'बरसात'])) {
    return 'rain'
  }
  if (hasAny(n, ['heat', 'hot', 'scorch', 'गर्मी', 'गर्म', 'ऊषा', 'ताप'])) return 'heat'
  if (hasAny(n, ['cold', 'frost', 'chill', 'snow', 'ठंड', 'पाला', 'शीत', 'ओला'])) {
    return 'cold'
  }
  if (
    hasAny(n, [
      'nothing unusual',
      'nothing happened',
      'nothing special',
      'no change',
      'kuch nahi',
      'कुछ नहीं',
      'सब सामान्य',
      'सब ठीक',
    ])
  ) {
    return 'calm'
  }

  return undefined
}

/* ---------------------------------------------------------------------------
   Session helpers
   --------------------------------------------------------------------------- */

let sessionCounter = 0

export function createDiagnosticSession(): DiagnosticSession {
  sessionCounter += 1
  return {
    id: `diag-${Date.now()}-${sessionCounter}`,
    started: false,
    finished: false,
    answers: [],
    notes: [],
    startedAt: Date.now(),
    updatedAt: Date.now(),
  }
}

function resetSession(session: DiagnosticSession): void {
  session.started = false
  session.finished = false
  session.crop = undefined
  session.age = undefined
  session.symptom = undefined
  session.water = undefined
  session.conditions = undefined
  session.answers = []
  session.notes = []
  session.updatedAt = Date.now()
}

export function isRestartCommand(text: string): boolean {
  const n = normalizeDiag(text)
  return hasAny(n, RESTART_TERMS)
}

/**
 * True when the message looks like a crop problem the farmer wants diagnosed.
 * A crop name (or a generic "my crop") plus a symptom phrase is required, so
 * general knowledge questions keep using the curated knowledge base.
 */
export function isDiagnosticTrigger(text: string): boolean {
  const n = normalizeDiag(text)
  if (!hasAny(n, SYMPTOM_TERMS.flatMap((entry) => entry.terms))) return false
  if (findCrop(text)) return true
  return hasAny(n, GENERIC_CROP_TERMS)
}

export function currentDiagnosticStage(
  session: DiagnosticSession,
): DiagnosticStage | undefined {
  if (!session.started || session.finished) return undefined
  return nextQuestion(session)
}

const CROP_QUICK_REPLIES: CropKey[] = [
  'potato',
  'wheat',
  'tomato',
  'paddy',
  'cotton',
  'maize',
]

export function quickRepliesForStage(stage: DiagnosticStage): QuickReply[] {
  if (stage === 'crop') {
    return CROP_QUICK_REPLIES.map((key) => ({
      textEn: CROP_MAP[key].label,
      textHi: CROP_MAP[key].labelHi,
    }))
  }
  if (stage === 'age') {
    return (Object.keys(AGE_LABELS) as DiagnosticAge[]).map((key) => ({
      textEn: AGE_LABELS[key].en,
      textHi: AGE_LABELS[key].hi,
    }))
  }
  if (stage === 'symptom') {
    return (Object.keys(SYMPTOM_LABELS) as DiagnosticSymptom[]).map((key) => ({
      textEn: SYMPTOM_LABELS[key].en,
      textHi: SYMPTOM_LABELS[key].hi,
    }))
  }
  if (stage === 'water') {
    return (Object.keys(WATER_LABELS) as DiagnosticWater[]).map((key) => ({
      textEn: WATER_LABELS[key].en,
      textHi: WATER_LABELS[key].hi,
    }))
  }
  return (Object.keys(CONDITION_LABELS) as DiagnosticConditions[]).map((key) => ({
    textEn: CONDITION_LABELS[key].en,
    textHi: CONDITION_LABELS[key].hi,
  }))
}

/** The next question that still needs an answer. */
function nextQuestion(session: DiagnosticSession): DiagnosticStage | undefined {
  if (!session.crop) return 'crop'
  if (!session.age) return 'age'
  if (!session.symptom) return 'symptom'
  if (!session.water) return 'water'
  if (!session.conditions) return 'conditions'
  return undefined
}

const REMAINING_HINTS: Record<DiagnosticStage, string> = {
  crop: 'Crop',
  age: 'Plant age',
  symptom: 'Visible symptoms',
  water: 'Watering and drainage',
  conditions: 'Recent conditions',
}

/* ---------------------------------------------------------------------------
   Outcome builders
   --------------------------------------------------------------------------- */

function cropName(session: DiagnosticSession, language: 'en' | 'hi'): string {
  if (!session.crop) return language === 'hi' ? 'फसल' : 'the crop'
  const meta = CROP_MAP[session.crop]
  return language === 'hi' ? meta.labelHi : meta.label
}

function questionOutcome(
  session: DiagnosticSession,
  stage: DiagnosticStage,
): DiagnosticOutcome {
  const question = STAGE_QUESTION[stage]
  const pending: string[] = []
  let cursor: DiagnosticStage | undefined = stage
  while (cursor) {
    pending.push(REMAINING_HINTS[cursor])
    cursor = nextQuestionAfter(session, cursor)
  }

  return {
    kind: 'question',
    textEn: question.en,
    textHi: question.hi,
    sources: [DIAGNOSTIC_SOURCES.kvk, DIAGNOSTIC_SOURCES.scouting],
    needsContext: true,
    contextHints: pending,
    stageLabelEn: STAGE_LABEL[stage].en,
    stageLabelHi: STAGE_LABEL[stage].hi,
  }
}

/** The stage that follows `stage` and is still unanswered. */
function nextQuestionAfter(
  session: DiagnosticSession,
  stage: DiagnosticStage,
): DiagnosticStage | undefined {
  const order: DiagnosticStage[] = ['crop', 'age', 'symptom', 'water', 'conditions']
  const index = order.indexOf(stage)
  for (let i = index + 1; i < order.length; i += 1) {
    const candidate = order[i]
    if (!isAnswered(session, candidate)) return candidate
  }
  return undefined
}

function isAnswered(session: DiagnosticSession, stage: DiagnosticStage): boolean {
  switch (stage) {
    case 'crop':
      return Boolean(session.crop)
    case 'age':
      return Boolean(session.age)
    case 'symptom':
      return Boolean(session.symptom)
    case 'water':
      return Boolean(session.water)
    case 'conditions':
      return Boolean(session.conditions)
    default:
      return true
  }
}

function reaskOutcome(stage: DiagnosticStage): DiagnosticOutcome {
  const question = STAGE_QUESTION[stage]
  const textEn = `I did not catch that yet, so I still need this one: ${question.en} You can also answer "not sure".`
  const textHi = `यह समझ नहीं आया, इसलिए अभी यही चाहिए: ${question.hi} आप "पता नहीं" भी लिख सकते हैं।`
  return {
    kind: 'question',
    textEn,
    textHi,
    sources: [DIAGNOSTIC_SOURCES.kvk],
    needsContext: true,
    contextHints: [REMAINING_HINTS[stage]],
    stageLabelEn: STAGE_LABEL[stage].en,
    stageLabelHi: STAGE_LABEL[stage].hi,
  }
}

function restartedOutcome(): DiagnosticOutcome {
  return {
    kind: 'restarted',
    textEn:
      'The check has been reset. Nothing from the previous check is remembered now - tell me the crop and the problem again and I will start from the beginning.',
    textHi:
      'जाँच रीसेट कर दी गई है। अब पिछली जाँच की कोई बात याद नहीं है - फसल और समस्या दोबारा बताएं, मैं शुरू से शुरू कर दूँगा।',
    sources: [],
    needsContext: false,
    contextHints: [],
    stageLabelEn: 'Reset',
    stageLabelHi: 'रीसेट',
  }
}

/* ---------------------------------------------------------------------------
   Cause ranking and the analysis
   --------------------------------------------------------------------------- */

function scoreCause(session: DiagnosticSession, cause: DiagnosticCause): number {
  if (cause.crops) {
    if (!session.crop || !cause.crops.includes(session.crop)) return Number.NEGATIVE_INFINITY
  }

  let score = 1
  if (cause.symptoms && session.symptom && session.symptom !== 'unclear') {
    score += cause.symptoms.includes(session.symptom) ? 4 : -3
  }
  if (cause.water && session.water && session.water !== 'unclear') {
    if (cause.water.includes(session.water)) score += 3
  }
  if (cause.conditions && session.conditions && session.conditions !== 'unclear') {
    if (cause.conditions.includes(session.conditions)) score += 3
  }
  if (cause.age && session.age && session.age !== 'unclear') {
    if (cause.age.includes(session.age)) score += 1
  }
  return score
}

function rankCauses(session: DiagnosticSession): DiagnosticCause[] {
  const scored = DIAGNOSTIC_CAUSES.map((cause) => ({
    cause,
    score: scoreCause(session, cause),
  }))
    .filter((entry) => Number.isFinite(entry.score) && entry.score > 0)
    .sort((a, b) => b.score - a.score)

  const top = scored.slice(0, 3).map((entry) => entry.cause)

  if (top.length >= 2) return top

  // Always offer at least two possibilities, even with very little information.
  for (const cause of DIAGNOSTIC_CAUSES) {
    if (top.length >= 2) break
    if (cause.crops) continue
    if (top.includes(cause)) continue
    top.push(cause)
  }
  return top
}

function factsSummary(session: DiagnosticSession, language: 'en' | 'hi'): string {
  const parts: string[] = []
  const pick = (en: string, hi: string) => (language === 'hi' ? hi : en)

  if (language === 'hi') {
    if (session.age) parts.push(AGE_LABELS[session.age].hi)
    if (session.symptom) parts.push(SYMPTOM_LABELS[session.symptom].hi)
    if (session.water) parts.push(WATER_LABELS[session.water].hi)
    if (session.conditions) parts.push(CONDITION_LABELS[session.conditions].hi)
  } else {
    if (session.age) parts.push(AGE_LABELS[session.age].en)
    if (session.symptom) parts.push(SYMPTOM_LABELS[session.symptom].en)
    if (session.water) parts.push(WATER_LABELS[session.water].en)
    if (session.conditions) parts.push(CONDITION_LABELS[session.conditions].en)
  }

  if (parts.length === 0) return pick('you have not described the problem yet', 'आपने अभी समस्या नहीं बताई है')
  return parts.join(', ')
}

function fillTokens(
  template: string,
  session: DiagnosticSession,
  language: 'en' | 'hi',
): string {
  const crop = cropName(session, language)
  const symptom = session.symptom
    ? language === 'hi'
      ? SYMPTOM_LABELS[session.symptom].hi
      : SYMPTOM_LABELS[session.symptom].en
    : language === 'hi'
      ? 'लक्षण'
      : 'the symptom'
  const water = session.water
    ? language === 'hi'
      ? WATER_LABELS[session.water].hi
      : WATER_LABELS[session.water].en
    : language === 'hi'
      ? 'पानी की स्थिति'
      : 'the watering'
  const conditions = session.conditions
    ? language === 'hi'
      ? CONDITION_LABELS[session.conditions].hi
      : CONDITION_LABELS[session.conditions].en
    : language === 'hi'
      ? 'हाल की परिस्थितियाँ'
      : 'the recent conditions'
  const age = session.age
    ? language === 'hi'
      ? AGE_LABELS[session.age].hi
      : AGE_LABELS[session.age].en
    : language === 'hi'
      ? 'पौधे की उम्र'
      : 'the plant age'

  return template
    .replaceAll('{crop}', crop)
    .replaceAll('{symptom}', symptom)
    .replaceAll('{water}', water)
    .replaceAll('{conditions}', conditions)
    .replaceAll('{age}', age)
}

function missingItems(session: DiagnosticSession, language: 'en' | 'hi'): string[] {
  const items: string[] = []
  if (language === 'hi') {
    items.push('आपका जिला और खेत का स्थान')
    items.push('मिट्टी का प्रकार')
    items.push('समस्या धब्बेदार है या पूरे खेत में फैली है')
    items.push('प्रभावित पौधे की एक तस्वीर')
    if (session.water === 'unclear') items.push('खेत में पानी की असली स्थिति')
    if (session.conditions === 'unclear') items.push('पिछले हफ़्तों का मौसम')
    if (session.age === 'unclear') items.push('पौधे की उम्र')
  } else {
    items.push('your district and the location of the field')
    items.push('the soil type')
    items.push('whether the problem is patchy or spread across the whole field')
    items.push('a photo of an affected plant')
    if (session.water === 'unclear') items.push('how much water the field is really getting')
    if (session.conditions === 'unclear') items.push('the weather of the last weeks')
    if (session.age === 'unclear') items.push('the age of the plants')
  }
  return items
}

function analysisOutcome(session: DiagnosticSession): DiagnosticOutcome {
  const causes = rankCauses(session)
  const sources: KnowledgeSource[] = []
  for (const cause of causes) {
    for (const source of cause.sources) {
      if (!sources.some((item) => item.title === source.title)) sources.push(source)
    }
  }
  if (!sources.some((item) => item.title === DIAGNOSTIC_SOURCES.kvk.title)) {
    sources.push(DIAGNOSTIC_SOURCES.kvk)
  }

  const cropEn = cropName(session, 'en')
  const cropHi = cropName(session, 'hi')
  const symptomEn = session.symptom ? SYMPTOM_LABELS[session.symptom].en : 'the reported problem'
  const symptomHi = session.symptom ? SYMPTOM_LABELS[session.symptom].hi : 'बताई गई समस्या'

  const causeBlocks = (language: 'en' | 'hi'): string[] =>
    causes.map((cause, index) => {
      const title = language === 'hi' ? cause.titleHi : cause.titleEn
      const why = fillTokens(language === 'hi' ? cause.whyHi : cause.whyEn, session, language)
      const check = language === 'hi' ? cause.checkHi : cause.checkEn
      const step = language === 'hi' ? cause.stepHi : cause.stepEn
      if (language === 'hi') {
        return `${index + 1}. ${title}\n   यह क्यों मेल खा सकता है: ${why}\n   क्या जाँचें: ${check}\n   सुरक्षित अगला कदम: ${step}`
      }
      return `${index + 1}. ${title}\n   Why it may fit: ${why}\n   What to check: ${check}\n   Safe next step: ${step}`
    })

  const notesEn = session.notes.length
    ? `\nYou also added: ${session.notes.join('; ')}.`
    : ''
  const notesHi = session.notes.length
    ? `\nआपने यह भी बताया: ${session.notes.join('; ')}।`
    : ''

  const textEn = [
    `Possible causes for ${cropEn} (${symptomEn}) - this is a possibility list, not a confirmed diagnosis.`,
    '',
    `You told me: ${factsSummary(session, 'en')}.${notesEn}`,
    '',
    'These are the causes that fit your answers best:',
    '',
    causeBlocks('en').join('\n\n'),
    '',
    'Safe next steps that need no prescription:',
    '- Write down the crop, the date and how the problem is spread (patches or the whole field).',
    '- Take photos of an affected plant, of the leaves and of the soil around the root zone.',
    '- Remove clearly affected plant material where practical and do not carry wet soil between plots.',
    '',
    `Still missing for a firmer answer: ${missingItems(session, 'en').join('; ')}.`,
    '',
    'This assistant is a local, rule-based program. It cannot see your field, cannot test your soil and cannot confirm a disease, and it will not guess a pesticide or a fertilizer dose. Please confirm with your nearest Krishi Vigyan Kendra (KVK) or a qualified agricultural extension officer before you treat the crop.',
    '',
    'Say "restart" to start a new check.',
  ].join('\n')

  const textHi = [
    `${cropHi} (${symptomHi}) के संभावित कारण - यह संभावित सूची है, पुष्टि किया गया निदान नहीं।`,
    '',
    `आपने बताया: ${factsSummary(session, 'hi')}.${notesHi}`,
    '',
    'आपके जवाब के अनुसार ये कारण सबसे ज़्यादा मेल खाते हैं:',
    '',
    causeBlocks('hi').join('\n\n'),
    '',
    'बिना किसी दवा-सलाह के किए जा सकने वाले सुरक्षित कदम:',
    '- फसल, तारीख और समस्या कैसे फैली है (धब्बेदार या पूरे खेत में) यह लिखें।',
    '- प्रभावित पौधे, पत्तों और जड़ वाले हिस्से की मिट्टी की तस्वीर लें।',
    '- जहाँ संभव हो प्रभावित पौधे की सामग्री हटाएं और गीली मिट्टी एक खेत से दूसरे में न ले जाएं।',
    '',
    `ठोस जवाब के लिए अभी भी यह जानकारी चाहिए: ${missingItems(session, 'hi').join('; ')}।`,
    '',
    'यह सहायक एक स्थानीय, नियम-आधारित प्रोग्राम है। यह आपका खेत नहीं देख सकता, मिट्टी की जाँच नहीं कर सकता, रोग की पुष्टि नहीं कर सकता, और कीटनाशक या उर्वरक की मात्रा का अनुमान नहीं लगाएगा। फसल पर कोई उपचार करने से पहले अपने नजदीकी कृषि विज्ञान केंद्र (KVK) या योग्य कृषि विस्तार अधिकारी से पुष्टि करें।',
    '',
    'नया चेक शुरू करने के लिए "restart" लिखें।',
  ].join('\n')

  return {
    kind: 'analysis',
    textEn,
    textHi,
    sources,
    needsContext: true,
    contextHints: missingItems(session, 'en'),
    stageLabelEn: 'Possible causes',
    stageLabelHi: 'संभावित कारण',
  }
}

/* ---------------------------------------------------------------------------
   Public entry point used by the answer engine
   --------------------------------------------------------------------------- */

function answerLabel(stage: DiagnosticStage, value: string, language: 'en' | 'hi'): string {
  switch (stage) {
    case 'crop': {
      const meta = CROP_MAP[value as CropKey]
      if (!meta) return value
      return language === 'hi' ? meta.labelHi : meta.label
    }
    case 'age':
      return language === 'hi'
        ? AGE_LABELS[value as DiagnosticAge].hi
        : AGE_LABELS[value as DiagnosticAge].en
    case 'symptom':
      return language === 'hi'
        ? SYMPTOM_LABELS[value as DiagnosticSymptom].hi
        : SYMPTOM_LABELS[value as DiagnosticSymptom].en
    case 'water':
      return language === 'hi'
        ? WATER_LABELS[value as DiagnosticWater].hi
        : WATER_LABELS[value as DiagnosticWater].en
    case 'conditions':
      return language === 'hi'
        ? CONDITION_LABELS[value as DiagnosticConditions].hi
        : CONDITION_LABELS[value as DiagnosticConditions].en
    default:
      return value
  }
}

/**
 * Asks the pending diagnostic question again.
 *
 * Used by the answer engine when a message could not be read as an answer and
 * the curated knowledge base has no answer either.
 */
export function reaskDiagnostic(session: DiagnosticSession): DiagnosticOutcome | null {
  if (!session.started || session.finished) return null
  const stage = nextQuestion(session)
  if (!stage) return null
  return reaskOutcome(stage)
}

export function reopenLastAnswer(session: DiagnosticSession): DiagnosticOutcome | null {
  if (!session.started || session.answers.length === 0) return null
  const last = session.answers[session.answers.length - 1]
  switch (last.stage) {
    case 'crop':
      session.crop = undefined
      break
    case 'age':
      session.age = undefined
      break
    case 'symptom':
      session.symptom = undefined
      break
    case 'water':
      session.water = undefined
      break
    case 'conditions':
      session.conditions = undefined
      break
  }
  session.answers.pop()
  session.finished = false
  session.updatedAt = Date.now()
  return questionOutcome(session, last.stage)
}

/**
 * Advances the diagnostic conversation.
 *
 * Returns `outcome: null` when the message is not part of a diagnostic, so
 * the caller can fall back to the ordinary knowledge-base answer.
 */
export function handleDiagnostic(
  text: string,
  session: DiagnosticSession | undefined,
): { outcome: DiagnosticOutcome | null; session: DiagnosticSession } {
  const current = session ?? createDiagnosticSession()
  const trimmed = text.trim()

  if (isRestartCommand(trimmed)) {
    resetSession(current)
    return { outcome: restartedOutcome(), session: current }
  }

  if (!current.started) {
    if (!isDiagnosticTrigger(trimmed)) return { outcome: null, session: current }
    current.started = true
    current.finished = false
    current.startedAt = Date.now()
    current.crop = findCrop(trimmed)
    const symptom = parseSymptom(trimmed)
    if (symptom) current.symptom = symptom
    current.updatedAt = Date.now()

    const stage = nextQuestion(current)
    if (!stage) {
      current.finished = true
      return { outcome: analysisOutcome(current), session: current }
    }
    return { outcome: questionOutcome(current, stage), session: current }
  }

  if (current.finished) {
    // The farmer keeps talking about the same problem: remember the new detail
    // and refresh the possibility list instead of forgetting everything.
    const symptom = parseSymptom(trimmed)
    if (symptom && symptom !== 'unclear' && symptom !== current.symptom) {
      current.symptom = symptom
      current.notes.push(trimmed)
      current.updatedAt = Date.now()
      return { outcome: analysisOutcome(current), session: current }
    }
    return { outcome: null, session: current }
  }

  const stage = nextQuestion(current)
  if (!stage) {
    current.finished = true
    return { outcome: analysisOutcome(current), session: current }
  }

  let parsed: string | undefined
  if (stage === 'crop') {
    const crop = findCrop(trimmed)
    parsed = crop
  } else if (stage === 'age') {
    parsed = parseAge(trimmed)
  } else if (stage === 'symptom') {
    parsed = parseSymptom(trimmed)
  } else if (stage === 'water') {
    parsed = parseWater(trimmed)
  } else {
    parsed = parseConditions(trimmed)
  }

  if (!parsed) {
    // The message may still be a new problem report: start a fresh check.
    if (isDiagnosticTrigger(trimmed)) {
      resetSession(current)
      current.started = true
      current.finished = false
      current.startedAt = Date.now()
      current.crop = findCrop(trimmed)
      const newSymptom = parseSymptom(trimmed)
      if (newSymptom) current.symptom = newSymptom
      current.updatedAt = Date.now()
      const newStage = nextQuestion(current)
      if (!newStage) {
        current.finished = true
        return { outcome: analysisOutcome(current), session: current }
      }
      return { outcome: questionOutcome(current, newStage), session: current }
    }
    return { outcome: null, session: current }
  }

  const question = STAGE_QUESTION[stage]
  current.answers.push({
    stage,
    questionEn: question.en,
    questionHi: question.hi,
    answerEn: answerLabel(stage, parsed, 'en'),
    answerHi: answerLabel(stage, parsed, 'hi'),
  })

  if (stage === 'crop') current.crop = parsed as CropKey
  if (stage === 'age') current.age = parsed as DiagnosticAge
  if (stage === 'symptom') current.symptom = parsed as DiagnosticSymptom
  if (stage === 'water') current.water = parsed as DiagnosticWater
  if (stage === 'conditions') current.conditions = parsed as DiagnosticConditions
  current.updatedAt = Date.now()

  const next = nextQuestion(current)
  if (!next) {
    current.finished = true
    return { outcome: analysisOutcome(current), session: current }
  }
  return { outcome: questionOutcome(current, next), session: current }
}
