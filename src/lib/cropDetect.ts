import { normalizeText } from '@/lib/text'
import type { CropKey } from '@/store/types'

/**
 * ---------------------------------------------------------------------------
 * Crop name detection (English / Hindi / Hinglish)
 * ---------------------------------------------------------------------------
 * Shared by the job-draft parser and the diagnostic engine so both always
 * agree on which crop the farmer is talking about.
 */

export const CROP_ALIASES: Array<{ key: CropKey; names: string[] }> = [
  { key: 'wheat', names: ['wheat', 'gehun', 'gehu', 'गेहूँ', 'गेहू'] },
  { key: 'paddy', names: ['paddy', 'rice', 'dhan', 'धान'] },
  { key: 'cotton', names: ['cotton', 'kapas', 'कपास'] },
  { key: 'sugarcane', names: ['sugarcane', 'ganna', 'गन्ना'] },
  { key: 'maize', names: ['maize', 'corn', 'makka', 'मक्का'] },
  { key: 'soybean', names: ['soybean', 'soya', 'soyabean', 'सोयाबीन'] },
  { key: 'mustard', names: ['mustard', 'sarson', 'सरसों'] },
  { key: 'tomato', names: ['tomato', 'tamatar', 'टमाटर'] },
  { key: 'onion', names: ['onion', 'pyaz', 'pyaaz', 'प्याज'] },
  { key: 'chilli', names: ['chilli', 'chili', 'mirch', 'मिर्च'] },
  { key: 'potato', names: ['potato', 'potatos', 'patato', 'aloo', 'aaloo', 'आलू'] },
  { key: 'groundnut', names: ['groundnut', 'mungfali', 'peanut', 'मूंगफली'] },
]

/** Finds the crop the farmer is talking about, if any. */
export function findCrop(text: string): CropKey | undefined {
  const n = normalizeText(text)
  for (const crop of CROP_ALIASES) {
    if (crop.names.some((name) => n.includes(normalizeText(name)))) return crop.key
  }
  return undefined
}
