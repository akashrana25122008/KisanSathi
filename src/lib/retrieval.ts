import { AI_KNOWLEDGE_BASE } from '@/data/knowledge'
import type { KnowledgeCategory, KnowledgeEntry } from '@/data/knowledge'
import { findCrop } from '@/lib/cropDetect'
import { isFuzzyMatch, normalizeText, stemWord, stripNukta } from '@/lib/text'

/**
 * ---------------------------------------------------------------------------
 * Local retrieval for the KisanSathi assistant
 * ---------------------------------------------------------------------------
 * The assistant answers from a curated, offline knowledge base. This module
 * decides *which* entry answers a question.
 *
 * The method is deliberately boring and inspectable:
 *
 *   1. normalise the question (case, punctuation, nukta, and the common
 *      question scaffolding farmers use - "should I" becomes "to"),
 *   2. work out what the farmer is really asking about (the "intent"),
 *   3. score every entry with an IDF-weighted keyword score,
 *   4. add small, explainable bonuses (intent match, named crop, tag),
 *   5. return the best entry only when it clears a minimum score.
 *
 * There is no network call, no model and no randomness: the same question
 * always produces the same answer. That is what makes the assistant safe to
 * trust when the phone has no connection.
 */

/** Minimum score an entry needs before it is allowed to answer. */
export const MIN_ANSWER_SCORE = 4.2

/** Extra points when the entry's category matches the detected intent. */
const INTENT_BONUS = 6

/** Extra points when the entry is specifically about the crop that was named. */
const CROP_BONUS = 3

/** Extra points for a live-data entry when the farmer asks for a live value. */
const LIVE_BONUS = 2

/** Extra points per matching legacy tag (capped). */
const TAG_BONUS = 1
const TAG_BONUS_CAP = 2

/** Extra points for every additional keyword that also matched (capped). */
const EXTRA_MATCH_BONUS = 0.8
const EXTRA_MATCH_CAP = 5

/** Only Latin words are fuzzy-matched - Devanagari words are matched exactly. */
const LATIN_ONLY = /^[\x20-\x7E]+$/

/* ---------------------------------------------------------------------------
   Keyword preparation
   --------------------------------------------------------------------------- */

type PreparedKeyword = {
  raw: string
  normalized: string
  words: string[]
  stemmed: string[]
  /** Inverse document frequency - rare keywords carry more weight. */
  idf: number
}

type PreparedEntry = {
  entry: KnowledgeEntry
  keywords: PreparedKeyword[]
  tags: string[]
}

/** Normalises a keyword or a question the same way, so they can be compared. */
function normalizeForMatching(text: string): string {
  return stripNukta(normalizeText(text)).replace(/\s+/g, ' ').trim()
}

function buildPreparedEntries(): PreparedEntry[] {
  // How many entries use each keyword? Rare keywords are the most specific,
  // so they get the highest weight.
  const documentFrequency = new Map<string, number>()
  for (const entry of AI_KNOWLEDGE_BASE) {
    const seen = new Set<string>()
    for (const keyword of entry.keywords) {
      const key = normalizeForMatching(keyword)
      if (!key || seen.has(key)) continue
      seen.add(key)
      documentFrequency.set(key, (documentFrequency.get(key) ?? 0) + 1)
    }
  }

  const total = AI_KNOWLEDGE_BASE.length

  return AI_KNOWLEDGE_BASE.map((entry) => ({
    entry,
    keywords: entry.keywords.map((raw) => {
      const normalized = normalizeForMatching(raw)
      const words = normalized.split(' ').filter(Boolean)
      const frequency = documentFrequency.get(normalized) ?? 1
      return {
        raw,
        normalized,
        words,
        stemmed: words.map(stemWord),
        idf: Math.log((total + 1) / (frequency + 0.5)),
      }
    }),
    tags: (entry.tags ?? [])
      .map((tag) => normalizeForMatching(tag.replace('-', ' ')))
      .filter(Boolean),
  }))
}

const PREPARED_ENTRIES = buildPreparedEntries()

/* ---------------------------------------------------------------------------
   Question rewriting
   --------------------------------------------------------------------------- */

/**
 * Farmers ask questions, not keywords. These rewrites turn the usual
 * sentence shapes into the plain phrasing the knowledge base uses, without
 * changing the meaning. They are applied to the normalised question only.
 */
const QUESTION_REWRITES: Array<[RegExp, string]> = [
  [/\bhow\s+(?:do|does|did|can|could|should|would)\s+(?:i|we|you)\b/g, 'how to'],
  [/\b(?:should|shall|can|could|would|will)\s+(?:i|we|you)\b/g, 'to'],
  [/\b(?:do|does|did)\s+(?:i|we)\b/g, 'to'],
  [/\b(?:what|which|how)\s+s\b/g, 'is'],
  [/\b(?:what|which)\s+(?:is|are|was|were)\s+(?:the|a|an)?\b/g, ' '],
  [/\b(?:please|kindly)\b/g, ' '],
  [/\b(?:i|we)\s+(?:want|need|wish)\s+to\s+(?:know|learn|understand)\b/g, 'to know'],
  [/\b(?:in|of|for)\s+my\s+(?:farm|field|land)\b/g, ' '],
]

/* ---------------------------------------------------------------------------
   Intent detection
   --------------------------------------------------------------------------- */

/**
 * The order matters: the first rule is the most specific one. When two rules
 * match the same number of times, the earlier one wins - so "today's mandi
 * price" is treated as live data and not as a general question about money.
 *
 * Note: JavaScript's `\b` only understands ASCII word characters, so Hindi
 * patterns are plain substring checks.
 */
const INTENT_RULES: Array<{ category: KnowledgeCategory; patterns: RegExp[] }> = [
  {
    category: 'live-data',
    patterns: [
      /\b(?:mandi|market)\s+(?:price|rate)\b/,
      /\b(?:price|rate|bhav)\s+today\b/,
      /\b(?:today'?s?|current|currently|latest)\b/,
      /\bexact\s+(?:amount|price|rate|figure|number|quantity)\b/,
      /\b(?:amount|install?ment|instal?ment|payment\s+status|scheme\s+status|credited)\b/,
      /\b(?:weather|forecast|rainfall|temperature|humidity|storm|cyclone|warning)\b/,
      /\b(?:will\s+it\s+rain|rain\s+today|rain\s+tomorrow|rain\s+forecast|rain\s+this\s+week)\b/,
      /मौसम|बारिश|तापमान|भाव|किस्त|ज़मा\s+राशि/,
    ],
  },
  {
    category: 'rotation-weeds',
    patterns: [
      /\b(?:rotation|rotating|rotate\b|intercrop\w*|intercropping|weeds?|weeding|weedicide)\b/,
      /\b(?:crop|growth)\s+stage\b/,
      /फसल\s+चक्र|अंतरफसल|खरपतवार|निराई|फसल\s+बदलना/,
      /fasal\s+chakr|niraai|weeding\s+kab/,
    ],
  },
  {
    category: 'pest-disease',
    patterns: [
      /\b(?:pests?|insects?|pesticide|disease|diseases|blight|rust|smut|mildew|wilt|aphids?|bollworm|borer|thrips|whitefly|locust|fungus|ipm)\b/,
      /कीट|रोग|झुलसा|रतुआ|उकठा|माहू|थ्रिप्स|सफेद\s+मक्खी|सुंडी|इल्ली|कीटनाशक|पत्ते/,
      /\b(?:kida|kide|keeda|keede|kida\s+mar|kida\s+marna)\b/,
    ],
  },
  {
    category: 'soil',
    patterns: [
      /\b(?:soil|soils|compost|manure|vermicompost|fertili[sz]ers?|nutrients?|organic\s+carbon)\b/,
      /मिट्टी|खाद|कम्पोस्ट|गोबर|पोषक|उर्वरक|मृदा/,
      /\b(?:mitti|khadd|khad|compost\s+kaise)\b/,
    ],
  },
  {
    category: 'water',
    patterns: [
      /\b(?:irrigat\w*|watering|water|drainage|drains?|drip|sprinkler|flooding|flooded|mulch\w*)\b/,
      /सिंचाई|पानी|जल\s+निकास|निकासी|मल्च|सिंचित|टपक/,
      /\b(?:paani|pani|sinchai|jal)\b/,
    ],
  },
  {
    category: 'post-harvest',
    patterns: [
      /\b(?:harvest\w*|storage|storing|stores?|drying|dries|moisture|grading|packing|packaging)\b/,
      /कटाई|भंडारण|गोदाम|सुखाना|सुखाई|नमी|ग्रेडिंग|पैकिंग/,
      /\b(?:katein|katna|kadai|gehun\s+kab)\b/,
    ],
  },
  {
    category: 'livestock',
    patterns: [
      /\b(?:cow|cows|buffalo|cattle|dairy|livestock|poultry|chicken|hen|goat|sheep|calf|lamb)\b/,
      /गाय|भैंस|पशु|मुर्गी|मुर्गीपालन|कुक्कुट|अंडा|बकरी|भेड़/,
      /\b(?:gaay|gaayen|gayi|murgi|murgi\s+pal|palted|dairy\s+animals)\b/,
    ],
  },
  {
    category: 'cultivation',
    patterns: [
      /\b(?:sow\w*|sowing|seeds?|nursery|transplant\w*|spacing|thinning|tillage|land\s+preparation)\b/,
      /बुवाई|बुआई|बोने|बीज|नर्सरी|रोपाई|दूरी|जुताई|खेत\s+की\s+तैयारी/,
      /\b(?:beej|buvai|bhuva|nursery\s+kaise)\b/,
    ],
  },
  {
    category: 'schemes-services',
    patterns: [
      /\b(?:schemes?|subsidy|pm[-\s]?kisan|insurance|kisan\s+credit\s+card|kcc|eligibility|extension\s+officer)\b/,
      /योजना|सब्सिडी|पीएम\s+किसान|फसल\s+बीमा|किसान\s+क्रेडिट\s+कार्ड|पात्रता/,
    ],
  },
  {
    category: 'economics',
    patterns: [
      /\b(?:costs?|labour|labor|majdoor|mazdoor|wage|wages|profit|loss|investment|budget|expenses?|income|notebook)\b/,
      /लागत|खर्च|मजदूर|मजदूरी|दिहाड़ी|मुनाफा|नुकसान|नोटबुक|हिसाब/,
      /\b(?:kharcha|lagat|mazdoori|majdoori|kharche)\b/,
    ],
  },
  {
    category: 'crop-planning',
    patterns: [
      /\b(?:which\s+crop|what\s+crop|crop\s+planning|farming\s+plan|crop\s+selection|best\s+crop)\b/,
      /कौन\s+सी\s+फसल|फसल\s+चुन|फसल\s+योजना|खेती\s+की\s+योजना/,
      /konsi\s+fasal|fasal\s+chun|kya\s+fasal|what\s+to\s+grow/,
    ],
  },
]

/* ---------------------------------------------------------------------------
   Query preparation
   --------------------------------------------------------------------------- */

export type PreparedQuery = {
  /** The question exactly as the farmer typed it. */
  original: string
  /** Normalised and rewritten question. */
  normalized: string
  /** The normalised question with a space on both sides, for phrase checks. */
  padded: string
  /** Stemmed tokens, used for single-word matching. */
  stemSet: Set<string>
  /** What the farmer is really asking about. */
  intent?: KnowledgeCategory
  /** The crop the farmer named, if any. */
  crop?: string
}

/** Rewrites a question into the plain form the knowledge base uses. */
export function rewriteQuestion(text: string): string {
  let working = stripNukta(normalizeText(text))
  for (const [pattern, replacement] of QUESTION_REWRITES) {
    working = working.replace(pattern, replacement)
  }
  return working.replace(/\s+/g, ' ').trim()
}

/** Works out which topic a question belongs to. */
export function detectIntent(normalized: string, original = normalized): KnowledgeCategory | undefined {
  let best: KnowledgeCategory | undefined
  let bestCount = 0

  for (const rule of INTENT_RULES) {
    let count = 0
    for (const pattern of rule.patterns) {
      if (pattern.test(normalized) || pattern.test(original)) count += 1
    }
    if (count > bestCount) {
      bestCount = count
      best = rule.category
    }
  }

  return best
}

/** Normalises a question and works out its intent and crop. */
export function prepareQuery(text: string): PreparedQuery {
  const original = text.trim()
  const normalized = rewriteQuestion(original)
  const tokens = normalized.split(' ').filter(Boolean)

  return {
    original,
    normalized,
    padded: ` ${normalized} `,
    stemSet: new Set(tokens.map(stemWord)),
    intent: detectIntent(normalized, original),
    crop: findCrop(original) ?? findCrop(normalized),
  }
}

/* ---------------------------------------------------------------------------
   Scoring
   --------------------------------------------------------------------------- */

type KeywordMatch = { keyword: string; score: number }

/**
 * Checks one word of a keyword against the question.
 * `exact` uses the stemmed form, `fuzzy` allows a single typing mistake.
 */
function matchWord(query: PreparedQuery, word: string, stemmedWord: string): 'exact' | 'fuzzy' | null {
  if (query.stemSet.has(stemmedWord)) return 'exact'
  if (!LATIN_ONLY.test(word) || !LATIN_ONLY.test(stemmedWord)) return null
  for (const token of query.stemSet) {
    if (isFuzzyMatch(token, stemmedWord)) return 'fuzzy'
  }
  return null
}

/** Scores one entry against one question. */
export function scoreEntry(
  prepared: PreparedEntry,
  query: PreparedQuery,
): { score: number; matched: string[] } {
  const matches: KeywordMatch[] = []

  for (const keyword of prepared.keywords) {
    if (keyword.words.length === 0) continue

    let score = 0
    if (keyword.words.length === 1) {
      const kind = matchWord(query, keyword.words[0], keyword.stemmed[0])
      if (kind === 'exact') score = 2 + keyword.idf
      else if (kind === 'fuzzy') score = 1 + keyword.idf
    } else if (query.padded.includes(` ${keyword.normalized} `)) {
      // The whole phrase is in the question - the strongest signal there is.
      score = 4 + 2 * keyword.idf + 1.5 * (keyword.words.length - 1)
    } else if (keyword.stemmed.every((word) => query.stemSet.has(word))) {
      // All the words are there, but not next to each other.
      score = 2.5 + keyword.idf + 0.5 * (keyword.words.length - 1)
    }

    if (score > 0) matches.push({ keyword: keyword.raw, score })
  }

  // An entry with no keyword match is never an answer, whatever the bonuses.
  if (matches.length === 0) return { score: 0, matched: [] }

  matches.sort((a, b) => b.score - a.score)

  let score = matches[0].score
  score += EXTRA_MATCH_BONUS * Math.min(matches.length - 1, EXTRA_MATCH_CAP)

  const entry = prepared.entry
  if (query.intent && entry.category === query.intent) score += INTENT_BONUS
  if (entry.liveData && CURRENT_VALUE_PATTERN.test(query.normalized)) score += LIVE_BONUS
  if (query.crop && entry.crops?.includes(query.crop as never)) score += CROP_BONUS

  let tagPoints = 0
  for (const tag of prepared.tags) {
    if (tagPoints >= TAG_BONUS_CAP) break
    if (query.padded.includes(` ${tag} `)) tagPoints += TAG_BONUS
  }
  score += tagPoints

  return { score, matched: matches.map((match) => match.keyword) }
}

/** Markers that show the farmer is asking for a value that changes daily. */
const CURRENT_VALUE_PATTERN =
  /\b(?:today|today'?s|current|currently|latest|price|rate|amount|weather|forecast|mandi|install?ment|status|bhav)\b/

/* ---------------------------------------------------------------------------
   Public API
   --------------------------------------------------------------------------- */

export type RetrievalMatch = {
  entry: KnowledgeEntry
  score: number
  intent?: KnowledgeCategory
  matchedKeywords: string[]
}

/** The best entries for a question, strongest first. */
export function retrieve(question: string, limit = 3): RetrievalMatch[] {
  const query = prepareQuery(question)
  const results: RetrievalMatch[] = []

  for (const prepared of PREPARED_ENTRIES) {
    const { score, matched } = scoreEntry(prepared, query)
    if (score <= 0) continue
    results.push({
      entry: prepared.entry,
      score,
      intent: query.intent,
      matchedKeywords: matched,
    })
  }

  results.sort((a, b) => b.score - a.score)
  return results.slice(0, Math.max(limit, 0))
}

/**
 * The entry that should answer the question, or `undefined` when nothing in
 * the knowledge base is close enough. The assistant says so honestly instead
 * of stretching a weak match.
 */
export function findBestEntry(question: string): RetrievalMatch | undefined {
  const best = retrieve(question, 1)[0]
  if (!best || best.score < MIN_ANSWER_SCORE) return undefined
  return best
}
