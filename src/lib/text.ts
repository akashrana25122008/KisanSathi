/**
 * ---------------------------------------------------------------------------
 * Shared text helpers for the local assistant
 * ---------------------------------------------------------------------------
 * These are intentionally tiny and dependency-free so the answer engine, the
 * diagnostic engine and the knowledge base all normalise text the same way.
 */

/** Lower-cases, drops punctuation and collapses whitespace. Keeps Devanagari. */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** True when the text contains Devanagari script. */
export function isDevanagariText(text: string): boolean {
  return /[\u0900-\u097F]/.test(text)
}

const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']

/** Converts Devanagari numerals to ASCII so "३ सप्ताह" can be read as "3 weeks". */
export function toAsciiDigits(text: string): string {
  let out = ''
  for (const char of text) {
    const index = DEVANAGARI_DIGITS.indexOf(char)
    out += index === -1 ? char : String(index)
  }
  return out
}

/** True when the normalised text contains at least one of the given terms. */
export function containsAny(normalized: string, terms: string[]): boolean {
  return terms.some((term) => normalized.includes(term))
}

/** Converts Devanagari numerals in a normalised string to ASCII. */
export function withAsciiDigits(normalized: string): string {
  return toAsciiDigits(normalized)
}

/* ---------------------------------------------------------------------------
   Matching helpers (typo tolerance)
   ---------------------------------------------------------------------------
   Farmers type on a phone, in a hurry, often in Roman script. These helpers
   let the assistant understand "irrigaion", "compost" or "khadda" without
   turning the app into a spelling checker. They are deliberately small and
   dependency-free.
   --------------------------------------------------------------------------- */

/**
 * Removes the Devanagari nukta (the dot under a consonant) so that "बढ़"
 * and "बढ" are treated as the same word.
 */
export function stripNukta(text: string): string {
  return text.replace(/\u093C/g, '')
}

/** Splits normalised text into words. */
export function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(' ')
    .filter((word) => word.length > 0)
}

/**
 * A very small English stemmer. It only folds the endings that actually
 * cause trouble in farming questions ("planting" -> "plant", "spotted" ->
 * "spot", "composts" -> "compost"). It is intentionally conservative: a wrong
 * stem is worse than no stem.
 */
export function stemWord(word: string): string {
  if (word.length <= 3) return word
  let w = word

  if (w.endsWith('ies') && w.length > 4) return `${w.slice(0, -3)}y`
  if (w.endsWith('sses')) return w.slice(0, -2)
  if (w.endsWith('ses') && w.length > 4) return w.slice(0, -2)
  if (w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us') && !w.endsWith('is')) {
    w = w.slice(0, -1)
  }

  if (w.endsWith('ation') && w.length > 6) return `${w.slice(0, -4)}at`
  if (w.endsWith('ate') && w.length > 4) return `${w.slice(0, -2)}at`

  if (w.endsWith('ing') && w.length > 5) {
    w = w.slice(0, -3)
    if (w.length > 2 && w[w.length - 1] === w[w.length - 2]) w = w.slice(0, -1)
  } else if (w.endsWith('ed') && w.length > 4) {
    w = w.slice(0, -2)
    if (w.length > 2 && w[w.length - 1] === w[w.length - 2]) w = w.slice(0, -1)
  }

  return w
}

/** Stems every word in a string. */
export function stemText(text: string): string {
  return tokenize(text).map(stemWord).join(' ')
}

/**
 * Levenshtein edit distance, capped so that very different words are cheap
 * to reject. Returns `maxDistance + 1` when the strings are further apart
 * than `maxDistance`.
 */
export function levenshtein(a: string, b: string, maxDistance = 3): number {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1

  let previous = new Array<number>(b.length + 1)
  let current = new Array<number>(b.length + 1)

  for (let j = 0; j <= b.length; j += 1) previous[j] = j

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i
    let rowBest = current[0]

    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost)
      if (current[j] < rowBest) rowBest = current[j]
    }

    if (rowBest > maxDistance) return maxDistance + 1

    const swap = previous
    previous = current
    current = swap
  }

  return previous[b.length]
}

/**
 * True when two words are close enough to be the same word written with a
 * typing mistake. Short words are only allowed an exact match, because
 * "soil" and "sail" are not the same thing to a farmer.
 */
export function isFuzzyMatch(word: string, target: string): boolean {
  if (word === target) return true
  if (word.length < 5 || target.length < 5) return false
  const maxDistance = Math.min(word.length, target.length) >= 8 ? 2 : 1
  return levenshtein(word, target, maxDistance) <= maxDistance
}
