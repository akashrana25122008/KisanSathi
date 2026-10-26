import { CROP_MAP, CROPS, DISTRICTS } from '@/data'
import { AI_DISCLAIMER, AI_SAFETY_NOTE, AI_SUGGESTIONS } from '@/data/aiKnowledge'
import { findCrop } from '@/lib/cropDetect'
import {
  createDiagnosticSession,
  handleDiagnostic,
  reaskDiagnostic,
  type DiagnosticSession,
} from '@/lib/diagnostics'
import { JOB_ACTIVITIES } from '@/lib/jobs'
import { findBestEntry } from '@/lib/retrieval'
import { isDevanagariText, normalizeText } from '@/lib/text'
import type { PhotoAnalysis } from '@/lib/api'
import type { CropKey } from '@/store/types'

/**
 * ---------------------------------------------------------------------------
 * KisanSathi AI - local, deterministic answer engine
 * ---------------------------------------------------------------------------
 * Everything runs in the browser against a curated knowledge base. No message
 * ever leaves the device and no external model or API is contacted.
 *
 * The engine never invents facts. It does not produce weather, mandi prices,
 * scheme eligibility, fertilizer dosages or pesticide instructions, and it
 * never guesses a missing value for a job draft - it asks instead.
 */

export { AI_DISCLAIMER, AI_SAFETY_NOTE, AI_SUGGESTIONS }

export type MessageRole = 'user' | 'assistant'

export type AnswerKind = 'answer' | 'job-draft' | 'clarify' | 'unknown'

export type SourceRef = {
  title: string
  /** Only set for verified, working links. General guidance has no URL. */
  url?: string
  kind: 'sourced' | 'general'
}

export type DraftFieldKey =
  | 'title'
  | 'activity'
  | 'crop'
  | 'workersRequired'
  | 'wagePerDay'
  | 'workDate'
  | 'village'
  | 'district'
  | 'durationDays'
  | 'description'

export type DraftFieldType = 'text' | 'number' | 'date' | 'select'

export interface DraftField {
  key: DraftFieldKey
  type: DraftFieldType
  labelEn: string
  labelHi: string
  /** Current value (always a string so it can be edited freely). */
  value: string
  /** True when the engine understood this field from the message. */
  understood: boolean
  options?: Array<{ value: string; label: string }>
  hintEn?: string
  hintHi?: string
}

export interface JobDraft {
  fields: DraftField[]
  /** Fields the engine could not understand. */
  missingKeys: DraftFieldKey[]
  /** Notes about values that need a human to confirm. */
  warnings: Array<{ en: string; hi: string }>
  summaryEn: string
  summaryHi: string
}

export interface AssistantReply {
  id: string
  role: 'assistant'
  kind: AnswerKind
  /**
   * Where the answer came from. `local` is the offline knowledge base, which
   * is the only source this build ships with. `remote` is only possible when
   * somebody explicitly plugs a provider in - see `setRemoteProvider`.
   */
  answerOrigin: 'local' | 'remote'
  /** The text to show, already resolved to the right language. */
  text: string
  /** The same answer in the other language, used by the language toggle. */
  textEn: string
  textHi: string
  sources: SourceRef[]
  needsContext: boolean
  contextHints: string[]
  jobDraft?: JobDraft
  disclaimer: string
  safetyNote: string
  /**
   * Only set on guided diagnostic replies: which step of the check the
   * assistant is on. The UI shows it so the farmer can see the conversation
   * is moving forward.
   */
  diagnosticStep?: { en: string; hi: string }
}

export interface ChatMessage {
  id: string
  role: MessageRole
  text: string
  reply?: AssistantReply
  /** Language the assistant answered in. The farmer can flip it per message. */
  lang?: 'en' | 'hi'
  timestamp: number
  photoAnalysis?: PhotoAnalysis
  photoPreview?: string
  photoDescription?: string
}

/* ---------------------------------------------------------------------------
   Text helpers
   --------------------------------------------------------------------------- */

let messageCounter = 0
function nextId(): string {
  messageCounter += 1
  return `msg-${Date.now()}-${messageCounter}`
}

function normalize(text: string): string {
  return normalizeText(text)
}

/** True when the message contains Devanagari script. */
export function isDevanagari(text: string): boolean {
  return isDevanagariText(text)
}

/**
 * Chooses the reply language: a Devanagari message is always answered in
 * Hindi, otherwise the app's active language is used.
 */
export function resolveReplyLanguage(
  userText: string,
  appLanguage: 'en' | 'hi',
): 'en' | 'hi' {
  if (isDevanagari(userText)) return 'hi'
  return appLanguage
}

/* ---------------------------------------------------------------------------
   Field extraction
   --------------------------------------------------------------------------- */

const ACTIVITY_ALIASES: Array<{ activity: string; names: string[] }> = [
  {
    activity: 'Harvesting',
    names: ['harvest', 'harvesting', 'katai', 'katayi', 'कटाई', 'निकाली'],
  },
  { activity: 'Weeding', names: ['weed', 'weeding', 'nirai', 'निराई', 'खरपतवार'] },
  {
    activity: 'Transplanting',
    names: ['transplant', 'transplanting', 'ropai', 'रोपाई'],
  },
  { activity: 'Sowing', names: ['sow', 'sowing', 'buwai', 'bujai', 'बुवाई'] },
  { activity: 'Irrigation', names: ['irrigat', 'sincai', 'sinchai', 'सिंचाई'] },
  { activity: 'Picking', names: ['pick', 'picking', 'todna', 'तोड़ना', 'चुनना'] },
  { activity: 'Threshing', names: ['thresh', 'threshing', 'daula', 'दौनी', 'गीहाई'] },
  { activity: 'Spraying', names: ['spray', 'spraying', 'छिड़काव'] },
]

const KNOWN_VILLAGES = [
  'barkatpur',
  'chandpura',
  'gopalpur',
  'amrai',
  'sultanpur',
  'piplantri',
  'kadodara',
  'bassi',
  'nandgaon',
  'sonbarsa',
  'jagraon',
  'shirala',
]

function findActivity(text: string): string | undefined {
  const n = normalize(text)
  for (const a of ACTIVITY_ALIASES) {
    if (a.names.some((name) => n.includes(normalize(name)))) return a.activity
  }
  for (const act of JOB_ACTIVITIES) {
    if (n.includes(act.toLowerCase())) return act
  }
  return undefined
}

function findDistrict(text: string): string | undefined {
  const n = normalize(text)
  for (const district of DISTRICTS) {
    if (n.includes(district.name.toLowerCase())) return district.name
    if (text.includes(district.nameHi)) return district.name
  }
  return undefined
}

function findVillage(text: string): string | undefined {
  const patterns = [
    /gaon\s+([a-zA-Z\u0900-\u097F]+)/i,
    /village\s+([a-zA-Z\u0900-\u097F]+)/i,
    /गांव\s+([a-zA-Z\u0900-\u097F]+)/i,
    /गाँव\s+([a-zA-Z\u0900-\u097F]+)/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m?.[1]) {
      const value = m[1].trim()
      if (value) return value.charAt(0).toUpperCase() + value.slice(1)
    }
  }
  const n = normalize(text)
  for (const village of KNOWN_VILLAGES) {
    if (n.includes(village)) {
      return village.charAt(0).toUpperCase() + village.slice(1)
    }
  }
  return undefined
}

function findWorkers(text: string): string | undefined {
  const patterns = [
    /(\d+)\s*(?:mazdoor|majdoor|mzd|workers?|people|मज़दूर|मजदूर|लोग)/i,
    /(?:need|chahiye|चाहिए|चाहिएं)\s*(\d+)/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m?.[1]) {
      const num = parseInt(m[1], 10)
      if (num >= 1 && num <= 100) return String(num)
    }
  }
  return undefined
}

function findWage(text: string): string | undefined {
  const patterns = [
    /(?:₹|\brs\.?\b|\brupees?\b|\brupaye\b)\s*(\d+)/i,
    /(\d+)\s*(?:\brupaye\b|\brupees?\b|\brs\b\.?|\bper day\b|\/day|\bप्रति दिन\b|\bरुपये\b|\bरूपये\b)/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m?.[1]) {
      const num = parseInt(m[1], 10)
      if (num >= 1 && num <= 10000) return String(num)
    }
  }
  return undefined
}

function findDuration(text: string): string | undefined {
  const m = text.match(/(\d+)\s*(?:days?|दिन|दिनों)/i)
  if (m?.[1]) {
    const num = parseInt(m[1], 10)
    if (num >= 1 && num <= 60) return String(num)
  }
  return undefined
}

type DateResolution = {
  value: string
  /** `explicit` = written as a calendar date; `relative` = a day name; `today` = today. */
  kind: 'explicit' | 'relative' | 'today'
}

function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function findDate(text: string): DateResolution | undefined {
  const n = normalize(text)
  const today = startOfToday()

  if (/\b(today|aaj)\b/.test(n) || text.includes('आज')) {
    return { value: toISO(today), kind: 'today' }
  }
  if (/\b(tomorrow|kal)\b/.test(n) || text.includes('कल')) {
    const d = new Date(today)
    d.setDate(d.getDate() + 1)
    return { value: toISO(d), kind: 'relative' }
  }
  if (/\b(day after tomorrow|parson)\b/.test(n) || text.includes('परसों')) {
    const d = new Date(today)
    d.setDate(d.getDate() + 2)
    return { value: toISO(d), kind: 'relative' }
  }

  const dayNames = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]
  const hindiDayNames = [
    'रविवार',
    'सोमवार',
    'मंगलवार',
    'बुधवार',
    'गुरुवार',
    'शुक्रवार',
    'शनिवार',
  ]
  for (let i = 0; i < 7; i++) {
    const mentioned = n.includes(dayNames[i]) || text.includes(hindiDayNames[i])
    if (mentioned) {
      const diff = (i - today.getDay() + 7) % 7
      const d = new Date(today)
      d.setDate(d.getDate() + diff)
      return { value: toISO(d), kind: 'relative' }
    }
  }

  const isoMatch = text.match(/(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (isoMatch) {
    const d = new Date(
      parseInt(isoMatch[1], 10),
      parseInt(isoMatch[2], 10) - 1,
      parseInt(isoMatch[3], 10),
    )
    if (!isNaN(d.getTime()) && d >= today) return { value: toISO(d), kind: 'explicit' }
  }

  const dmyMatch = text.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
  if (dmyMatch) {
    const d = new Date(
      parseInt(dmyMatch[3], 10),
      parseInt(dmyMatch[2], 10) - 1,
      parseInt(dmyMatch[1], 10),
    )
    if (!isNaN(d.getTime()) && d >= today) return { value: toISO(d), kind: 'explicit' }
  }

  return undefined
}

/* ---------------------------------------------------------------------------
   Job draft
   --------------------------------------------------------------------------- */

const ACTIVITY_OPTIONS = JOB_ACTIVITIES.map((activity) => ({
  value: activity,
  label: activity,
}))
const CROP_OPTIONS = CROPS.map((crop) => ({ value: crop.key, label: crop.label }))
const DISTRICT_OPTIONS = DISTRICTS.map((district) => ({
  value: district.name,
  label: `${district.name}, ${district.state}`,
}))

function isJobDraftRequest(text: string): boolean {
  const n = normalize(text)
  const triggers = [
    'need worker',
    'need mazdoor',
    'chahiye mazdoor',
    'chahiye majdoor',
    'chahiye me',
    'post job',
    'post a job',
    'post karna',
    'naukri',
    'नौकरी',
    'hire',
    'draft job',
    'create job',
    'mazdoor chahiye',
    'majdoor chahiye',
  ]
  if (triggers.some((t) => n.includes(normalize(t)))) return true

  // A second signal: a crew size plus something to do and a wage figure.
  const hasWorkers = findWorkers(text) !== undefined
  const hasCropOrActivity =
    findCrop(text) !== undefined || findActivity(text) !== undefined
  const hasWage = findWage(text) !== undefined
  return hasWorkers && hasCropOrActivity && hasWage
}

function buildJobDraft(text: string): JobDraft {
  const crop = findCrop(text)
  const activity = findActivity(text)
  const workersRequired = findWorkers(text)
  const wagePerDay = findWage(text)
  const village = findVillage(text)
  const district = findDistrict(text)
  const durationDays = findDuration(text) || '1'
  const dateResult = findDate(text)

  const warnings: Array<{ en: string; hi: string }> = []
  if (dateResult?.kind === 'relative') {
    warnings.push({
      en: 'A day name was detected and mapped to the next matching date - please confirm the calendar date.',
      hi: 'दिन का नाम पाया गया और अगली मिलती तारीख पर रखा गया है - कृपया कैलेंडर तारीख की पुष्टि करें।',
    })
  }
  if (village && district && village.toLowerCase() === district.toLowerCase()) {
    warnings.push({
      en: 'The place name matched both village and district - please check both fields.',
      hi: 'स्थान का नाम गाँव और जिला दोनों से मेल खाता है - कृपया दोनों फ़ील्ड जाँचें।',
    })
  }

  const cropMeta = crop ? CROP_MAP[crop] : undefined
  const act = activity || ''
  const titleEn = cropMeta
    ? `${cropMeta.label} ${act ? act.toLowerCase() : 'farm work'} - workers needed`
    : `${act || 'Farm'} work - workers needed`
  const titleHi = cropMeta
    ? `${cropMeta.labelHi} का ${act === 'Harvesting' ? 'कटाई' : act === 'Weeding' ? 'निराई' : 'काम'} - मजदूर चाहिए`
    : 'खेत के काम के लिए मजदूर चाहिए'

  const fields: DraftField[] = [
    {
      key: 'title',
      type: 'text',
      labelEn: 'Job title',
      labelHi: 'नौकरी का शीर्षक',
      value: titleEn,
      understood: true,
    },
    {
      key: 'activity',
      type: 'select',
      labelEn: 'Activity',
      labelHi: 'कार्य',
      value: act,
      understood: !!activity,
      options: ACTIVITY_OPTIONS,
    },
    {
      key: 'crop',
      type: 'select',
      labelEn: 'Crop',
      labelHi: 'फसल',
      value: crop ?? '',
      understood: !!crop,
      options: CROP_OPTIONS,
    },
    {
      key: 'workersRequired',
      type: 'number',
      labelEn: 'Workers needed',
      labelHi: 'चाहिए मज़दूर',
      value: workersRequired ?? '',
      understood: !!workersRequired,
    },
    {
      key: 'wagePerDay',
      type: 'number',
      labelEn: 'Daily wage (₹)',
      labelHi: 'दिहाड़ी (₹)',
      value: wagePerDay ?? '',
      understood: !!wagePerDay,
    },
    {
      key: 'workDate',
      type: 'date',
      labelEn: 'Work date',
      labelHi: 'काम की तारीख',
      value: dateResult?.value ?? '',
      understood: !!dateResult,
    },
    {
      key: 'village',
      type: 'text',
      labelEn: 'Village',
      labelHi: 'गाँव',
      value: village ?? '',
      understood: !!village,
    },
    {
      key: 'district',
      type: 'select',
      labelEn: 'District',
      labelHi: 'जिला',
      value: district ?? '',
      understood: !!district,
      options: DISTRICT_OPTIONS,
    },
    {
      key: 'durationDays',
      type: 'number',
      labelEn: 'Duration (days)',
      labelHi: 'अवधि (दिन)',
      value: durationDays,
      understood: true,
    },
    {
      key: 'description',
      type: 'text',
      labelEn: 'Description (optional)',
      labelHi: 'विवरण (वैकल्पिक)',
      value: '',
      understood: false,
    },
  ]

  const missingKeys = REQUIRED_DRAFT_KEYS.filter((key) => {
    const field = fields.find((item) => item.key === key)
    return !field || !field.value.trim()
  })

  const summaryEn = [
    titleEn,
    `${workersRequired ?? '?'} workers`,
    `₹${wagePerDay ?? '?'}/day`,
    village || district || 'location TBD',
    dateResult?.value || 'date TBD',
  ]
    .filter(Boolean)
    .join(' · ')

  const summaryHi = [
    titleHi,
    `${workersRequired ?? '?'} मज़दूर`,
    `₹${wagePerDay ?? '?'}/दिन`,
    village || district || 'स्थान TBD',
    dateResult?.value || 'तारीख TBD',
  ]
    .filter(Boolean)
    .join(' · ')

  return { fields, missingKeys, warnings, summaryEn, summaryHi }
}

/** Fields a farmer must fill in before a draft can be turned into a post. */
export const REQUIRED_DRAFT_KEYS: DraftFieldKey[] = [
  'title',
  'activity',
  'crop',
  'workersRequired',
  'wagePerDay',
  'workDate',
  'village',
  'district',
]

/* ---------------------------------------------------------------------------
   Knowledge matching
   --------------------------------------------------------------------------- */

/**
 * The knowledge base lookup now lives in `src/lib/retrieval.ts`: it
 * normalises the question, works out the intent and scores every entry with
 * an IDF-weighted keyword score. An entry only answers when it clears the
 * minimum score, so a weak match never becomes a confident answer.
 */
function findAnswer(text: string) {
  return findBestEntry(text)
}

/* ---------------------------------------------------------------------------
   Optional remote provider seam (off by default)
   --------------------------------------------------------------------------- */

/**
 * A remote model can be plugged in, but nothing in this build does that.
 *
 * The rules for this seam are deliberate:
 *   - it is off by default and stays off until somebody calls
 *     `setRemoteProvider`,
 *   - no API key is ever stored, read or shipped in the bundle - the
 *     provider is expected to hold its own credentials,
 *   - the local knowledge base always answers first, and a remote failure
 *     falls back to it instead of showing the farmer an error.
 */
export type RemoteAskContext = {
  local: AssistantReply
}

export type RemoteProvider = {
  /** A short id for the provider, e.g. 'groq'. Never a secret. */
  id: string
  /**
   * Asks the provider. Return `null` to keep the local answer, or reject to
   * fall back to it. Rejecting never becomes a farmer-facing error.
   */
  ask: (question: string, context: RemoteAskContext) => Promise<string | null>
}

let remoteProvider: RemoteProvider | null = null

/** Registers (or clears) the optional remote provider. */
export function setRemoteProvider(provider: RemoteProvider | null): void {
  remoteProvider = provider
}

/** The registered remote provider, if any. */
export function getRemoteProvider(): RemoteProvider | null {
  return remoteProvider
}

/* ---------------------------------------------------------------------------
   Public API
   --------------------------------------------------------------------------- */

export function getSuggestions() {
  return AI_SUGGESTIONS
}

const UNKNOWN_EN =
  "I don't have a reliable answer for that in this local knowledge base, and I will not guess. I will not invent fertilizer doses, pesticide products or mixtures, scheme eligibility or amounts, mandi prices, weather forecasts or expected yields - those change and have to come from the right place.\n\nFor advice that depends on your field, ask your nearest Krishi Vigyan Kendra (KVK) or a qualified agricultural expert, and take a sample or a photo of the problem with you.\n\nI can help offline with: crop selection and seasonal planning; sowing windows, seed choice, spacing and field preparation; soil type, testing, nutrients and compost; irrigation, drainage, water saving and weather precautions; pest and disease symptom triage and integrated pest management; crop rotation, intercropping, weeds and crop-stage planning; harvesting, drying, storage and post-harvest handling; livestock and poultry; government schemes, agriculture services and where to find reliable information; farm costs, labour and planning; and drafting a job post."

const UNKNOWN_HI =
  'इस स्थानीय क्यूरेटेड नॉलेज बेस में इसका विश्वसनीय उत्तर नहीं है, और मैं अंदाज़ा नहीं लगाऊँगा। उर्वरक की मात्रा, कीटनाशक का उत्पाद या मिश्रण, योजना की पात्रता या राशि, मंडी भाव, मौसम का पूर्वानुमान और उपज का अनुमान - ये सब बदलते हैं और सही जगह से लेने पड़ते हैं।\n\nजो सलाह आपके खेत पर निर्भर है, वह अपने नज़दीकी कृषि विज्ञान केंद्र (KVK) या योग्य कृषि विशेषज्ञ से लें, और समस्या का नमूना या फोटो साथ ले जाएं।\n\nमैं इन विषयों में मदद कर सकता हूँ: फसल चुनाव और मौसमी योजना; बुवाई का समय, बीज चुनाव, दूरी और खेत की तैयारी; मिट्टी की जांच, पोषक तत्व और कम्पोस्ट; सिंचाई, जल निकास, पानी की बचत और मौसम की सावधानी; कीट-रोग की पहचान और एकीकृत कीट प्रबंधन; फसल चक्र, अंतरफसल, खरपतवार और फसल की अवस्था की योजना; कटाई, सुखाई, भंडारण और कटाई के बाद की देखभाल; पशु और मुर्गी पालन; सरकारी योजनाएं, कृषि सेवाएं और विश्वसनीय जानकारी कहाँ मिलेगी; खेती की लागत, मज़दूरी और योजना; और नौकरी का ड्राफ्ट।'

export function askQuestion(
  userText: string,
  session?: DiagnosticSession,
): AssistantReply {
  const text = userText.trim()

  if (!text) {
    return {
      id: nextId(),
      role: 'assistant',
      kind: 'clarify',
      answerOrigin: 'local',
      text: 'Please type a question, or describe the job you need help drafting.',
      textEn: 'Please type a question, or describe the job you need help drafting.',
      textHi: 'कृपया एक सवाल लिखें, या जिस काम के लिए मज़दूर चाहिए वह बताएं।',
      sources: [],
      needsContext: false,
      contextHints: [],
      disclaimer: AI_DISCLAIMER.en,
      safetyNote: AI_SAFETY_NOTE.en,
    }
  }

  if (isJobDraftRequest(text)) {
    const draft = buildJobDraft(text)
    const missingCount = draft.missingKeys.length
    return {
      id: nextId(),
      role: 'assistant',
      kind: 'job-draft',
      answerOrigin: 'local',
      text: missingCount
        ? `I drafted a job from your message, but ${missingCount} field${
            missingCount > 1 ? 's are' : ' is'
          } still missing. Fill them in the draft below, then confirm to open the post form. Nothing is published until you confirm.`
        : 'I drafted a job from your message. Check every field in the draft below, then confirm to open the post form. Nothing is published until you confirm.',
      textEn: missingCount
        ? `I drafted a job from your message, but ${missingCount} field${
            missingCount > 1 ? 's are' : ' is'
          } still missing. Fill them in the draft below, then confirm to open the post form. Nothing is published until you confirm.`
        : 'I drafted a job from your message. Check every field in the draft below, then confirm to open the post form. Nothing is published until you confirm.',
      textHi: missingCount
        ? `मैंने आपके संदेश से नौकरी का ड्राफ्ट बनाया, लेकिन ${missingCount} फ़ील्ड अभी भरना बाकी है। नीचे ड्राफ्ट में भरें, फिर पोस्ट फॉर्म खोलने के लिए पुष्टि करें। पुष्टि से पहले कुछ भी पोस्ट नहीं होता।`
        : 'मैंने आपके संदेश से नौकरी का ड्राफ्ट बनाया। नीचे हर फ़ील्ड जाँचें, फिर पोस्ट फॉर्म खोलने के लिए पुष्टि करें। पुष्टि से पहले कुछ भी पोस्ट नहीं होता।',
      sources: [
        {
          title: 'KisanSathi Jobs - the existing posting flow is reused',
          url: '/jobs',
          kind: 'general',
        },
      ],
      // The draft card itself lists what is missing, so no raw-key hint chips.
      needsContext: false,
      contextHints: [],
      jobDraft: draft,
      disclaimer: AI_DISCLAIMER.en,
      safetyNote: AI_SAFETY_NOTE.en,
    }
  }

  /* ------------------------------------------------------------------ */
  /* Guided diagnostic (multi-turn)                                     */
  /* ------------------------------------------------------------------ */

  const diagnosticSession = session ?? createDiagnosticSession()
  const diagnostic = handleDiagnostic(text, diagnosticSession)
  if (diagnostic.outcome) {
    const outcome = diagnostic.outcome
    return {
      id: nextId(),
      role: 'assistant',
      kind: outcome.kind === 'question' ? 'clarify' : 'answer',
      answerOrigin: 'local',
      text: outcome.textEn,
      textEn: outcome.textEn,
      textHi: outcome.textHi,
      sources: outcome.sources,
      needsContext: outcome.needsContext,
      contextHints: outcome.contextHints,
      disclaimer: AI_DISCLAIMER.en,
      safetyNote: AI_SAFETY_NOTE.en,
      diagnosticStep: { en: outcome.stageLabelEn, hi: outcome.stageLabelHi },
    }
  }

  const match = findAnswer(text)
  if (match) {
    const entry = match.entry
    return {
      id: nextId(),
      role: 'assistant',
      kind: 'answer',
      answerOrigin: 'local',
      text: entry.answerEn,
      textEn: entry.answerEn,
      textHi: entry.answerHi,
      sources: entry.sources,
      needsContext: !!entry.needsContext,
      contextHints: entry.contextHints ?? [],
      disclaimer: AI_DISCLAIMER.en,
      safetyNote: AI_SAFETY_NOTE.en,
    }
  }

  /* The knowledge base has nothing either: if a diagnostic is waiting for an
     answer, ask that question again instead of giving up. */
  const reask = reaskDiagnostic(diagnosticSession)
  if (reask) {
    return {
      id: nextId(),
      role: 'assistant',
      kind: 'clarify',
      answerOrigin: 'local',
      text: reask.textEn,
      textEn: reask.textEn,
      textHi: reask.textHi,
      sources: reask.sources,
      needsContext: reask.needsContext,
      contextHints: reask.contextHints,
      disclaimer: AI_DISCLAIMER.en,
      safetyNote: AI_SAFETY_NOTE.en,
      diagnosticStep: { en: reask.stageLabelEn, hi: reask.stageLabelHi },
    }
  }

  return {
    id: nextId(),
    role: 'assistant',
    kind: 'unknown',
    answerOrigin: 'local',
    text: UNKNOWN_EN,
    textEn: UNKNOWN_EN,
    textHi: UNKNOWN_HI,
    sources: [
      {
        title: 'ICAR - Indian Council of Agricultural Research',
        url: 'https://icar.org.in/',
        kind: 'sourced',
      },
      {
        title: 'Department of Agriculture & Farmers Welfare',
        url: 'https://agriwelfare.gov.in/',
        kind: 'sourced',
      },
    ],
    needsContext: false,
    contextHints: [],
    disclaimer: AI_DISCLAIMER.en,
    safetyNote: AI_SAFETY_NOTE.en,
  }
}

/**
 * Asks the question and, when a remote provider has been registered, gives
 * it a chance to answer first.
 *
 * The local knowledge base is always computed. If no provider is registered -
 * the default - the local answer is returned immediately and nothing leaves
 * the device. If a provider is registered and fails, times out or returns
 * nothing usable, the local answer is used instead: a remote problem never
 * turns into an error on the farmer's screen.
 */
export async function askQuestionAsync(
  userText: string,
  session?: DiagnosticSession,
): Promise<AssistantReply> {
  const local = askQuestion(userText, session)
  const provider = remoteProvider
  if (!provider) return local

  try {
    const answer = (await provider.ask(userText, { local }))?.trim()
    if (!answer) return local
    return {
      ...local,
      kind: 'answer',
      answerOrigin: 'remote',
      text: answer,
      textEn: answer,
      textHi: answer,
    }
  } catch {
    // A remote failure is not the farmer's problem - fall back quietly.
    return local
  }
}

/* ---------------------------------------------------------------------------
   UI helpers
   --------------------------------------------------------------------------- */

/** Swaps the resolved answer text for the language the farmer asked for. */
export function applyReplyLanguage(
  reply: AssistantReply,
  language: 'en' | 'hi',
): AssistantReply {
  return { ...reply, text: language === 'hi' ? reply.textHi : reply.textEn }
}

/** Keys that still need a value before the draft can be reviewed. */
export function missingDraftKeys(fields: DraftField[]): DraftFieldKey[] {
  return REQUIRED_DRAFT_KEYS.filter((key) => {
    const field = fields.find((item) => item.key === key)
    return !field || !field.value.trim()
  })
}

export interface JobPrefill {
  title?: string
  activity?: string
  crop?: CropKey
  village?: string
  district?: string
  workersRequired?: string
  wagePerDay?: string
  workDate?: string
  durationDays?: string
  notes?: string
}

/**
 * Converts edited draft fields into the `prefill` shape accepted by the
 * existing `JobPostModal`. Only non-empty, valid values are passed on so the
 * form still applies its own sensible defaults for anything left blank.
 */
export function draftToPrefill(fields: DraftField[]): JobPrefill {
  const valueOf = (key: DraftFieldKey): string | undefined => {
    const raw = fields.find((field) => field.key === key)?.value.trim()
    return raw ? raw : undefined
  }

  const crop = valueOf('crop')
  return {
    title: valueOf('title'),
    activity: valueOf('activity'),
    crop: crop && crop in CROP_MAP ? (crop as CropKey) : undefined,
    village: valueOf('village'),
    district: valueOf('district'),
    workersRequired: valueOf('workersRequired'),
    wagePerDay: valueOf('wagePerDay'),
    workDate: valueOf('workDate'),
    durationDays: valueOf('durationDays'),
    notes: valueOf('description'),
  }
}
