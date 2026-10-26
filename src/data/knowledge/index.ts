import { CORE_ENTRIES } from './core'
import { CROP_PLANNING_ENTRIES } from './cropPlanning'
import { ECONOMICS_ENTRIES } from './economics'
import { GOVERNMENT_ENTRIES } from './government'
import { LIVE_DATA_ENTRIES } from './liveData'
import { LIVESTOCK_ENTRIES } from './livestock'
import { PEST_DISEASE_ENTRIES } from './pestDisease'
import { POST_HARVEST_ENTRIES } from './postHarvest'
import { ROTATION_WEED_ENTRIES } from './rotationWeeds'
import { SOIL_ENTRIES } from './soil'
import type { KnowledgeEntry } from './types'
import { WATER_ENTRIES } from './water'

export * from './types'
export * from './sources'

/**
 * ---------------------------------------------------------------------------
 * The complete local knowledge base
 * ---------------------------------------------------------------------------
 * Every entry is hand-written, lives in the bundle and works offline. The
 * list is grouped by topic so a new topic is a new file, not a new file
 * edit. Core (broad overview) entries come first so that a vague question
 * still finds something sensible; specific entries follow and win on score.
 */
export const AI_KNOWLEDGE_BASE: KnowledgeEntry[] = [
  ...CORE_ENTRIES,
  ...CROP_PLANNING_ENTRIES,
  ...SOIL_ENTRIES,
  ...WATER_ENTRIES,
  ...PEST_DISEASE_ENTRIES,
  ...ROTATION_WEED_ENTRIES,
  ...POST_HARVEST_ENTRIES,
  ...LIVESTOCK_ENTRIES,
  ...GOVERNMENT_ENTRIES,
  ...LIVE_DATA_ENTRIES,
  ...ECONOMICS_ENTRIES,
]

export const KNOWLEDGE_BASE_SIZE = AI_KNOWLEDGE_BASE.length
