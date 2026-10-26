import { CROP_MAP } from '@/data'
import type { CropKey } from '@/store/types'

/**
 * ---------------------------------------------------------------------------
 * KisanSathi AI - crop profiles for the guided diagnostic
 * ---------------------------------------------------------------------------
 * A profile is the ordered list of questions that the diagnostic engine asks
 * for one crop. The engine is generic; the profile decides which questions
 * exist, in which order they are asked and which answers are offered as
 * clickable choices.
 *
 * Only a few crops have a profile that is tuned to their own problems
 * (potato first). Every other crop uses the shared, generic profile. The
 * engine never claims that a crop has more guidance than it really has.
 */

export type DiagnosticStageId =
  | 'crop'
  | 'symptom'
  | 'age'
  | 'water'
  | 'conditions'
  | 'seed'
  | 'depth'

export type DiagnosticChoiceKind = 'answer' | 'other'

export interface DiagnosticChoice {
  /** Stable id, used by the UI to send the answer back. */
  id: string
  labelEn: string
  labelHi: string
  /**
   * The value that is stored for the stage when this choice is picked.
   * Missing for an "other" choice - the farmer then describes it in words.
   */
  value?: string
  kind: DiagnosticChoiceKind
}

/** What the engine knows when it decides whether a question is still useful. */
export interface DiagnosticProfileContext {
  crop?: CropKey
  /** The symptom the farmer confirmed with a choice or with their own words. */
  symptom?: string
}

export interface DiagnosticProfileStage {
  id: DiagnosticStageId
  labelEn: string
  labelHi: string
  questionEn: string
  questionHi: string
  choices: DiagnosticChoice[]
  /** When this is missing, the stage is always asked. */
  relevant?: (context: DiagnosticProfileContext) => boolean
}

export interface DiagnosticCropProfile {
  crop?: CropKey
  stages: DiagnosticProfileStage[]
}

/* ---------------------------------------------------------------------------
   Small helpers
   --------------------------------------------------------------------------- */

function answer(
  stage: DiagnosticStageId,
  value: string,
  labelEn: string,
  labelHi: string,
): DiagnosticChoice {
  return { id: `${stage}:${value}`, labelEn, labelHi, value, kind: 'answer' }
}

function notSure(stage: DiagnosticStageId): DiagnosticChoice {
  return answer(stage, 'unclear', 'Not sure', 'पता नहीं')
}

function other(stage: DiagnosticStageId): DiagnosticChoice {
  return {
    id: `${stage}:other`,
    labelEn: 'Something else (I will describe it)',
    labelHi: 'कुछ और (मैं ख़ुद बताऊँगा)',
    kind: 'other',
  }
}

/* ---------------------------------------------------------------------------
   Shared stages
   --------------------------------------------------------------------------- */

const cropStage: DiagnosticProfileStage = {
  id: 'crop',
  labelEn: 'Crop',
  labelHi: 'फसल',
  questionEn:
    'Which crop is affected? Pick one below, or type the name of the crop in your own words.',
  questionHi:
    'कौन सी फसल प्रभावित है? नीचे से एक चुनें, या फसल का नाम अपने शब्दों में लिखें।',
  choices: Object.keys(CROP_MAP).map((key) => {
    const meta = CROP_MAP[key as CropKey]
    return answer('crop', key, meta.label, meta.labelHi)
  }),
}

const ageStage: DiagnosticProfileStage = {
  id: 'age',
  labelEn: 'Plant age',
  labelHi: 'पौधों की उम्र',
  questionEn:
    'How old are the plants? (just sown - 1-6 weeks - 1-3 months - older and flowering)',
  questionHi:
    'पौधे कितने दिन के हैं? (अभी बुवाई गए - 1-6 सप्ताह - 1-3 महीने - पुराने और फूल आ रहे हैं)',
  choices: [
    answer('age', 'just-sown', 'Just sown', 'अभी बुवाई की है'),
    answer('age', 'young', '1-6 weeks old', '1-6 सप्ताह के'),
    answer('age', 'growing', '1-3 months old', '1-3 महीने के'),
    answer('age', 'mature', 'Older - flowering or fruiting', 'पुराने - फूल या फल आ रहे हैं'),
    notSure('age'),
    other('age'),
  ],
}

const waterStage: DiagnosticProfileStage = {
  id: 'water',
  labelEn: 'Watering and drainage',
  labelHi: 'सिंचाई और जल निकास',
  questionEn:
    'How is the field watered? (too little water - a normal schedule - too much water or water standing in the field - no irrigation, rain only)',
  questionHi:
    'खेत में पानी कैसे दिया जाता है? (बहुत कम पानी - सामान्य सिंचाई - ज़्यादा पानी या खेत में पानी खड़ा - सिर्फ़ बारिश, सिंचाई नहीं)',
  choices: [
    answer('water', 'dry', 'Too little water - the soil is dry', 'बहुत कम पानी - मिट्टी सूखी है'),
    answer('water', 'normal', 'A normal watering schedule', 'सिंचाई सामान्य रहती है'),
    answer('water', 'over', 'More water than usual', 'सामान्य से ज़्यादा पानी'),
    answer('water', 'waterlogged', 'Water is standing in the field', 'खेत में पानी खड़ा है'),
    answer('water', 'none', 'No irrigation, only rain', 'सिंचाई नहीं, सिर्फ़ बारिश'),
    notSure('water'),
    other('water'),
  ],
}

const conditionsStage: DiagnosticProfileStage = {
  id: 'conditions',
  labelEn: 'Recent conditions',
  labelHi: 'हाल की परिस्थितियाँ',
  questionEn:
    'What has happened in the last week or two? (heavy rain - a hot spell - cold nights or frost - nothing unusual)',
  questionHi:
    'पिछले एक-दो हफ़्ते में क्या हुआ? (तेज़ बारिश - तेज़ गर्मी - ठंडी रातें या पाला - कुछ ख़ास नहीं)',
  choices: [
    answer('conditions', 'rain', 'Heavy rain', 'तेज़ बारिश'),
    answer('conditions', 'heat', 'A hot spell', 'तेज़ गर्मी'),
    answer('conditions', 'cold', 'Cold nights or frost', 'ठंडी रातें या पाला'),
    answer('conditions', 'calm', 'Nothing unusual', 'कुछ ख़ास नहीं'),
    notSure('conditions'),
    other('conditions'),
  ],
}

/* ---------------------------------------------------------------------------
   The symptom question
   --------------------------------------------------------------------------- */

const SYMPTOM_TAIL_EN =
  'After this I will ask how old the plants are, because the plant age rules out several causes.'
const SYMPTOM_TAIL_HI =
  'इसके बाद मैं पूछूँगा कि पौधे कितने दिन के हैं, क्योंकि उम्र के हिसाब से कई कारण आगे नहीं बढ़ते।'

function symptomStage(
  cropNameEn: string,
  cropNameHi: string,
  choices: DiagnosticChoice[],
): DiagnosticProfileStage {
  return {
    id: 'symptom',
    labelEn: 'Symptoms and plant age',
    labelHi: 'लक्षण और पौधों की उम्र',
    questionEn: `Let's check a few things to understand what might be happening with the ${cropNameEn}.\n\nWhat is happening in the field? Pick the closest option below, or describe it in your own words.\n\n${SYMPTOM_TAIL_EN}`,
    questionHi: `${cropNameHi} में क्या हो रहा है, यह समझने के लिए कुछ बातें जाँचते हैं।\n\nखेत में क्या हो रहा है? नीचे दिए विकल्प में सबसे करीब का चुनें, या अपने शब्दों में लिखें।\n\n${SYMPTOM_TAIL_HI}`,
    choices,
  }
}

const genericSymptomStage = symptomStage(
  'crop',
  'फसल',
  [
    answer('symptom', 'yellowing', 'The leaves are yellowing', 'पत्ते पीले हो रहे हैं'),
    answer('symptom', 'wilting', 'The plants are wilting', 'पौधे मुरझा रहे हैं'),
    answer('symptom', 'stunted', 'No growth, or very slow growth', 'बढ़वार नहीं हो रही, या बहुत धीमी'),
    answer('symptom', 'spots', 'There are spots on the leaves', 'पत्तों पर धब्बे हैं'),
    answer('symptom', 'pests', 'I can see insects or worms', 'कीट या सुंडी दिख रही है'),
    answer('symptom', 'rotting', 'The base or the roots are rotting', 'तने या जड़ें सड़ रही हैं'),
    notSure('symptom'),
    other('symptom'),
  ],
)

const potatoSymptomStage = symptomStage('potato', 'आलू', [
  answer(
    'symptom',
    'not-sprouted',
    'The seed potatoes have not sprouted at all',
    'बीज आलू ने बिल्कुल अंकुर नहीं लिए',
  ),
  answer('symptom', 'stunted', 'The plants are growing very slowly', 'पौधे बहुत धीरे बढ़ रहे हैं'),
  answer(
    'symptom',
    'yellowing',
    'The leaves are yellowing or wilting',
    'पत्ते पीले हो रहे हैं या मुरझा रहे हैं',
  ),
  answer(
    'symptom',
    'no-tubers',
    'The plants look healthy but no tubers are forming',
    'पौधे स्वस्थ दिखते हैं पर आलू नहीं बन रहे',
  ),
  notSure('symptom'),
  other('symptom'),
])

/* ---------------------------------------------------------------------------
   Potato only stages
   --------------------------------------------------------------------------- */

const seedStage: DiagnosticProfileStage = {
  id: 'seed',
  labelEn: 'Seed tubers',
  labelHi: 'बीज आलू',
  questionEn: 'What were the seed tubers like before planting?',
  questionHi: 'बुवाई से पहले बीज आलू कैसे थे?',
  choices: [
    answer('seed', 'sprouting', 'Firm and already sprouting', 'सख़्त और पहले से अंकुरित'),
    answer('seed', 'firm', 'Firm, but no sprouts yet', 'सख़्त, पर अभी अंकुर नहीं'),
    answer('seed', 'soft', 'Soft, or starting to rot', 'नरम, या सड़ने लगे'),
    answer('seed', 'damaged', 'Damaged, or cut too large', 'टूटे हुए, या बहुत बड़े कटे हुए'),
    notSure('seed'),
    other('seed'),
  ],
  relevant: (context) => context.symptom === 'not-sprouted' || context.symptom === 'stunted',
}

const depthStage: DiagnosticProfileStage = {
  id: 'depth',
  labelEn: 'Planting depth',
  labelHi: 'बुवाई की गहराई',
  questionEn: 'How deep were the tubers planted, if you know?',
  questionHi: 'आलू कितनी गहराई पर बोए गए थे, अगर आपको पता है?',
  choices: [
    answer('depth', 'shallow', 'Shallow - about 5 cm', 'छोटी गहराई - लगभग 5 सेमी'),
    answer('depth', 'normal', 'About 10-15 cm', 'लगभग 10-15 सेमी'),
    answer('depth', 'deep', 'Deeper than 15 cm', '15 सेमी से ज़्यादा गहरा'),
    notSure('depth'),
    other('depth'),
  ],
  relevant: (context) => context.symptom === 'not-sprouted',
}

/* ---------------------------------------------------------------------------
   The profiles
   --------------------------------------------------------------------------- */

/** The shared profile: used for every crop without a crop specific profile. */
export const GENERIC_PROFILE: DiagnosticCropProfile = {
  stages: [cropStage, genericSymptomStage, ageStage, waterStage, conditionsStage],
}

/** Potato: the crop with its own questions about the seed tubers and depth. */
export const POTATO_PROFILE: DiagnosticCropProfile = {
  crop: 'potato',
  stages: [
    cropStage,
    potatoSymptomStage,
    ageStage,
    waterStage,
    conditionsStage,
    seedStage,
    depthStage,
  ],
}

/**
 * The crops that get a crop specific profile. Everything else uses the
 * generic profile, and the assistant never pretends otherwise.
 */
export const CROP_PROFILES: Partial<Record<CropKey, DiagnosticCropProfile>> = {
  potato: POTATO_PROFILE,
}

/** The profile used for a crop (or for no crop at all). */
export function getCropProfile(crop?: CropKey): DiagnosticCropProfile {
  if (crop) {
    const profile = CROP_PROFILES[crop]
    if (profile) return profile
  }
  return GENERIC_PROFILE
}

/** Finds a stage in a profile. */
export function findProfileStage(
  profile: DiagnosticCropProfile,
  id: DiagnosticStageId,
): DiagnosticProfileStage | undefined {
  return profile.stages.find((stage) => stage.id === id)
}

/** Finds a choice by its id inside a profile. */
export function findProfileChoice(
  profile: DiagnosticCropProfile,
  choiceId: string,
): { stage: DiagnosticProfileStage; choice: DiagnosticChoice } | undefined {
  for (const stage of profile.stages) {
    const choice = stage.choices.find((item) => item.id === choiceId)
    if (choice) return { stage, choice }
  }
  return undefined
}
