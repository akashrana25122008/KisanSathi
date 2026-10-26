import type { KnowledgeSource } from './types'

/**
 * ---------------------------------------------------------------------------
 * Verified public references
 * ---------------------------------------------------------------------------
 * Every external link the assistant can show lives in this file and nowhere
 * else. Each URL below was checked and returned a normal HTTP response. A
 * link that cannot be verified is not added - the assistant says so in plain
 * words instead of inventing a citation.
 *
 * The KVK portal (kvk.icar.gov.in) is deliberately NOT listed: it did not
 * resolve when checked, so the assistant points farmers at ICAR and the
 * Department of Agriculture instead.
 */

export const ICAR: KnowledgeSource = {
  title: 'ICAR - Indian Council of Agricultural Research',
  org: 'ICAR, Government of India',
  url: 'https://icar.org.in/',
  kind: 'sourced',
}

export const AGRIWELFARE: KnowledgeSource = {
  title: 'Department of Agriculture & Farmers Welfare',
  org: 'Government of India',
  url: 'https://agriwelfare.gov.in/',
  kind: 'sourced',
}

export const INDIA_PORTAL: KnowledgeSource = {
  title: 'National Portal of India - schemes and services',
  org: 'Government of India',
  url: 'https://www.india.gov.in/',
  kind: 'sourced',
}

export const SOIL_HEALTH: KnowledgeSource = {
  title: 'Soil Health Card portal',
  org: 'Department of Agriculture & Farmers Welfare',
  url: 'https://soilhealth.dac.gov.in/',
  kind: 'sourced',
}

export const IMD: KnowledgeSource = {
  title: 'IMD Mausam - weather warnings, forecasts and rainfall',
  org: 'India Meteorological Department',
  url: 'https://mausam.imd.gov.in/',
  kind: 'sourced',
}

export const ENAM: KnowledgeSource = {
  title: 'e-NAM - National Agriculture Market online trading',
  org: 'Government of India',
  url: 'https://enam.gov.in/',
  kind: 'sourced',
}

export const AGMARKNET: KnowledgeSource = {
  title: 'Agmarknet - daily market prices for crops',
  org: 'Ministry of Agriculture & Farmers Welfare',
  url: 'https://agmarknet.gov.in/',
  kind: 'sourced',
}

export const PM_KISAN: KnowledgeSource = {
  title: 'PM-KISAN - official farmer portal',
  org: 'Government of India',
  url: 'https://pmkisan.gov.in/',
  kind: 'sourced',
}

export const DBT_BHARAT: KnowledgeSource = {
  title: 'DBT Bharat - beneficiary and instalment status',
  org: 'Government of India',
  url: 'https://dbtbharat.gov.in/',
  kind: 'sourced',
}

export const DAHD: KnowledgeSource = {
  title: 'Department of Animal Husbandry & Dairying',
  org: 'Government of India',
  url: 'https://dahd.gov.in/',
  kind: 'sourced',
}

export const NDDB: KnowledgeSource = {
  title: 'National Dairy Development Board',
  org: 'NDDB',
  url: 'https://www.nddb.coop/',
  kind: 'sourced',
}

export const MIDH: KnowledgeSource = {
  title: 'Mission for Integrated Development of Horticulture',
  org: 'Government of India',
  url: 'https://midh.gov.in/',
  kind: 'sourced',
}

export const TNAU: KnowledgeSource = {
  title: 'TNAU Agritech Portal - crop-wise agronomy notes',
  org: 'Tamil Nadu Agricultural University',
  url: 'https://agritech.tnau.ac.in/',
  kind: 'sourced',
}

/** Prudent local guidance - deliberately carries no URL. */
export function general(title: string): KnowledgeSource {
  return { title, kind: 'general' }
}

/** Every external domain the app is allowed to link to. */
export const VERIFIED_SOURCE_URLS = [
  ICAR.url,
  AGRIWELFARE.url,
  INDIA_PORTAL.url,
  SOIL_HEALTH.url,
  IMD.url,
  ENAM.url,
  AGMARKNET.url,
  PM_KISAN.url,
  DBT_BHARAT.url,
  DAHD.url,
  NDDB.url,
  MIDH.url,
  TNAU.url,
].filter((url): url is string => Boolean(url))
