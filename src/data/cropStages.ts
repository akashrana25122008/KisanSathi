import type { CropKey } from '@/store/types'

/**
 * ---------------------------------------------------------------------------
 * Crop-to-Work Planner - curated crop-stage templates
 * ---------------------------------------------------------------------------
 * These are planning templates for the prototype, not an official crop
 * calendar. The operation sequence follows common crop husbandry, while the
 * day offsets, durations and labour numbers are deliberately approximate.
 *
 * Rules used when writing this data:
 *  - no official-sounding yield, fertiliser-dose or pesticide instructions;
 *  - no guaranteed dates (weather, variety, soil and water change everything);
 *  - labour numbers are labelled illustrative and scaled from farm area;
 *  - a task only offers "Create job" when a manual crew is realistically useful.
 */

export type PlannerCropKey = Extract<
  CropKey,
  'wheat' | 'paddy' | 'maize' | 'mustard' | 'sugarcane' | 'potato' | 'tomato'
>

export const PLANNER_CROP_KEYS = [
  'wheat',
  'paddy',
  'maize',
  'mustard',
  'sugarcane',
  'potato',
  'tomato',
] as const satisfies readonly PlannerCropKey[]

export function isPlannerCrop(value: unknown): value is PlannerCropKey {
  return (
    typeof value === 'string' &&
    (PLANNER_CROP_KEYS as readonly string[]).includes(value)
  )
}

export type StageCategory =
  | 'land'
  | 'sowing'
  | 'transplanting'
  | 'irrigation'
  | 'weeding'
  | 'scouting'
  | 'harvest'
  | 'postharvest'

/** Activities that already exist in the Jobs marketplace job-post form. */
export type PlannerJobActivity =
  | 'Harvesting'
  | 'Weeding'
  | 'Transplanting'
  | 'Sowing'
  | 'Irrigation'
  | 'Picking'
  | 'Threshing'
  | 'Spraying'

export interface PlannerLabourModel {
  /** Illustrative workers needed per acre for this operation. */
  workersPerAcre: number
  /** Small plots still need a sensible minimum crew. */
  minWorkers: number
  /** Keep one job posting to a realistic single crew. */
  maxWorkers: number
  noteEn: string
  noteHi: string
}

export interface CropStageTemplate {
  /** Unique across every crop, e.g. `wheat-harvest`. */
  id: string
  crop: PlannerCropKey
  nameEn: string
  nameHi: string
  descriptionEn: string
  descriptionHi: string
  /** Days from the plan's day 0 (sowing / planting). */
  offsetDays: number
  /** Inclusive number of days the operation normally spans. */
  durationDays: number
  category: StageCategory
  /** `null` means this step is not suitable for a marketplace job post. */
  jobActivity: PlannerJobActivity | null
  /** `null` means no honest crew estimate is available for this step. */
  labour: PlannerLabourModel | null
}

export interface PlannerCropMeta {
  key: PlannerCropKey
  seasonEn: string
  seasonHi: string
  startLabelEn: string
  startLabelHi: string
  startHintEn: string
  startHintHi: string
  timingNoteEn: string
  timingNoteHi: string
}

export const PLANNER_CROPS: PlannerCropMeta[] = [
  {
    key: 'wheat',
    seasonEn: 'Rabi',
    seasonHi: 'रबी',
    startLabelEn: 'Sowing date',
    startLabelHi: 'बुवाई की तारीख',
    startHintEn: 'Day 0 is the sowing date. Every stage is scheduled from here.',
    startHintHi: 'दिन 0 बुवाई की तारीख है। हर चरण यहीं से तय होता है।',
    timingNoteEn:
      'Typical rabi wheat sequence. Day ranges shift with variety, temperature, irrigation and rainfall.',
    timingNoteHi:
      'रबी गेहूँ का सामान्य क्रम। किस्म, तापमान, सिंचाई और बारिश के अनुसार दिनों की सीमा बदलती है।',
  },
  {
    key: 'paddy',
    seasonEn: 'Kharif',
    seasonHi: 'खरीफ',
    startLabelEn: 'Nursery sowing date',
    startLabelHi: 'नर्सरी बुवाई की तारीख',
    startHintEn: 'Day 0 is nursery sowing. Transplanting is planned a few weeks later.',
    startHintHi: 'दिन 0 नर्सरी बुवाई है। रोपाई कुछ सप्ताह बाद तय की गई है।',
    timingNoteEn:
      'Typical paddy sequence for a transplanted crop. Nursery and transplant windows depend on monsoon onset, variety and water supply.',
    timingNoteHi:
      'रोपाई वाली धान का सामान्य क्रम। नर्सरी और रोपाई का समय मानसून, किस्म और पानी की उपलब्धता पर निर्भर करता है।',
  },
  {
    key: 'maize',
    seasonEn: 'Kharif / Rabi',
    seasonHi: 'खरीफ / रबी',
    startLabelEn: 'Sowing date',
    startLabelHi: 'बुवाई की तारीख',
    startHintEn: 'Day 0 is the sowing date. Season length varies by hybrid.',
    startHintHi: 'दिन 0 बुवाई की तारीख है। फसल की अवधि हाइब्रिड के अनुसार बदलती है।',
    timingNoteEn:
      'Maize season length varies widely by hybrid and region. Treat these day ranges as a rough planning aid.',
    timingNoteHi:
      'मक्का की अवधि हाइब्रिड और क्षेत्र के अनुसार बहुत बदलती है। इन दिनों को मोटे अनुमान के रूप में लें।',
  },
  {
    key: 'mustard',
    seasonEn: 'Rabi',
    seasonHi: 'रबी',
    startLabelEn: 'Sowing date',
    startLabelHi: 'बुवाई की तारीख',
    startHintEn: 'Day 0 is the sowing date. Harvest can move by two weeks or more.',
    startHintHi: 'दिन 0 बुवाई की तारीख है। कटाई दो सप्ताह या अधिक आगे-पीछे हो सकती है।',
    timingNoteEn:
      'Mustard timing depends on the sowing window, temperature and irrigation. Harvest can move by two weeks or more.',
    timingNoteHi:
      'सरसों का समय बुवाई, तापमान और सिंचाई पर निर्भर है। कटाई दो सप्ताह या अधिक आगे-पीछे हो सकती है।',
  },
  {
    key: 'sugarcane',
    seasonEn: 'Annual',
    seasonHi: 'वार्षिक',
    startLabelEn: 'Planting date',
    startLabelHi: 'रोपण की तारीख',
    startHintEn: 'Day 0 is planting. Harvest is often set by the mill crushing schedule.',
    startHintHi: 'दिन 0 रोपण है। कटाई अक्सर मिल के पेराई कार्यक्रम से तय होती है।',
    timingNoteEn:
      'Sugarcane is an annual crop. Harvest month is usually driven by the sugar mill crushing schedule, not only crop age.',
    timingNoteHi:
      'गन्ना वार्षिक फसल है। कटाई का महीना अक्सर चीनी मिल के पेराई कार्यक्रम से तय होता है, सिर्फ फसल की उम्र से नहीं।',
  },
  {
    key: 'potato',
    seasonEn: 'Rabi',
    seasonHi: 'रबी',
    startLabelEn: 'Planting date',
    startLabelHi: 'रोपण की तारीख',
    startHintEn: 'Day 0 is planting. Confirm variety-specific timing locally.',
    startHintHi: 'दिन 0 रोपण है। किस्म के अनुसार समय की स्थानीय पुष्टि करें।',
    timingNoteEn:
      'Potato windows depend on variety, planting date and seed-tuber condition. Confirm locally before scheduling.',
    timingNoteHi:
      'आलू का समय किस्म, रोपण तिथि और बीज कंद की स्थिति पर निर्भर है। कार्यक्रम से पहले स्थानीय पुष्टि करें।',
  },
  {
    key: 'tomato',
    seasonEn: 'Kharif / Rabi',
    seasonHi: 'खरीफ / रबी',
    startLabelEn: 'Nursery sowing date',
    startLabelHi: 'नर्सरी बुवाई की तारीख',
    startHintEn: 'Day 0 is nursery sowing. Transplanting is planned about three weeks later.',
    startHintHi: 'दिन 0 नर्सरी बुवाई है। रोपाई लगभग तीन सप्ताह बाद तय की गई है।',
    timingNoteEn:
      'Tomato is harvested over several pickings. The harvest window below is a simplified planning range, not a fixed date.',
    timingNoteHi:
      'टमाटर की कटाई कई बार होती है। नीचे दी कटाई अवधि सरल योजना सीमा है, कोई निश्चित तारीख नहीं।',
  },
]

export const PLANNER_CROP_MAP: Record<PlannerCropKey, PlannerCropMeta> =
  PLANNER_CROPS.reduce(
    (acc, crop) => {
      acc[crop.key] = crop
      return acc
    },
    {} as Record<PlannerCropKey, PlannerCropMeta>,
  )

function labour(
  workersPerAcre: number,
  minWorkers: number,
  maxWorkers: number,
  noteEn: string,
  noteHi: string,
): PlannerLabourModel {
  return { workersPerAcre, minWorkers, maxWorkers, noteEn, noteHi }
}

export const CROP_STAGES: CropStageTemplate[] = [
  /* ------------------------------------------------------------------ */
  /* Wheat                                                               */
  /* ------------------------------------------------------------------ */
  {
    id: 'wheat-land-prep',
    crop: 'wheat',
    nameEn: 'Land preparation & sowing',
    nameHi: 'खेत की तैयारी और बुवाई',
    descriptionEn:
      'Prepare the field and sow at the seed rate and spacing recommended for your variety. Confirm seed treatment and sowing depth with your local agriculture officer.',
    descriptionHi:
      'खेत तैयार करें और अपनी किस्म के लिए सुझाई गई बीज दर व दूरी पर बुवाई करें। बीजोपचार और बुवाई की गहराई की पुष्टि स्थानीय कृषि अधिकारी से करें।',
    offsetDays: 0,
    durationDays: 3,
    category: 'sowing',
    jobActivity: 'Sowing',
    labour: labour(
      1.5,
      2,
      20,
      'Illustrative manual crew; many farms sow with a seed drill and need far fewer workers.',
      'यह केवल उदाहरण अनुमान है; कई खेतों में सीड ड्रिल से बुवाई होती है और बहुत कम मज़दूर लगते हैं।',
    ),
  },
  {
    id: 'wheat-first-irrigation',
    crop: 'wheat',
    nameEn: 'First irrigation (crown root stage)',
    nameHi: 'पहली सिंचाई (क्राउन रूट अवस्था)',
    descriptionEn:
      'Irrigate at the crown-root stage. Check soil moisture and water availability before scheduling, and avoid waterlogging.',
    descriptionHi:
      'क्राउन रूट अवस्था पर सिंचाई करें। कार्यक्रम तय करने से पहले मिट्टी की नमी और पानी की उपलब्धता देखें, और जलभराव से बचें।',
    offsetDays: 20,
    durationDays: 1,
    category: 'irrigation',
    jobActivity: 'Irrigation',
    labour: labour(
      0.8,
      1,
      6,
      'Helper estimate for opening channels or moving pipes; pump operation is usually skilled work.',
      'नाली खोलने या पाइप हिलाने के लिए अनुमानित सहायक; पंप चलाना आमतौर पर कुशल काम है।',
    ),
  },
  {
    id: 'wheat-weeding',
    crop: 'wheat',
    nameEn: 'Weeding & first top-dressing',
    nameHi: 'निराई और पहली टॉप ड्रेसिंग',
    descriptionEn:
      'Remove weeds between rows. Apply the first top-dressing only as advised by your soil test or local recommendation. No fertiliser dose is prescribed here.',
    descriptionHi:
      'पंक्तियों के बीच खरपतवार निकालें। पहली टॉप ड्रेसिंग केवल मिट्टी जाँच या स्थानीय सलाह के अनुसार दें। यहाँ खाद की कोई मात्रा नहीं बताई गई है।',
    offsetDays: 30,
    durationDays: 3,
    category: 'weeding',
    jobActivity: 'Weeding',
    labour: labour(
      2,
      2,
      25,
      'Manual weeding crew estimate. Fertiliser quantity is deliberately not prescribed.',
      'हाथ से निराई करने वाली टोली का अनुमान। खाद की मात्रा जानबूझकर नहीं बताई गई है।',
    ),
  },
  {
    id: 'wheat-scouting',
    crop: 'wheat',
    nameEn: 'Pest & disease scouting',
    nameHi: 'कीट और रोग निरीक्षण',
    descriptionEn:
      'Walk the field and record pest or disease symptoms. Take photographs and consult your KVK or agriculture officer before any spray decision.',
    descriptionHi:
      'खेत में घूमकर कीट या रोग के लक्षण दर्ज करें। किसी भी छिड़काव का फैसला लेने से पहले फोटो लें और केवीके या कृषि अधिकारी से सलाह लें।',
    offsetDays: 45,
    durationDays: 2,
    category: 'scouting',
    jobActivity: null,
    labour: null,
  },
  {
    id: 'wheat-second-irrigation',
    crop: 'wheat',
    nameEn: 'Second irrigation & weeding pass',
    nameHi: 'दूसरी सिंचाई और निराई',
    descriptionEn:
      'Irrigate if the soil is dry and remove any new weed growth. Adjust the timing to rainfall, soil type and crop condition.',
    descriptionHi:
      'मिट्टी सूखी हो तो सिंचाई करें और नई खरपतवार हटाएँ। समय को बारिश, मिट्टी और फसल की स्थिति के अनुसार बदलें।',
    offsetDays: 60,
    durationDays: 2,
    category: 'irrigation',
    jobActivity: 'Irrigation',
    labour: labour(
      1.2,
      1,
      8,
      'Small helper crew for irrigation and a light weeding pass.',
      'सिंचाई और हल्की निराई के लिए छोटी सहायक टोली का अनुमान।',
    ),
  },
  {
    id: 'wheat-harvest',
    crop: 'wheat',
    nameEn: 'Harvesting & threshing',
    nameHi: 'कटाई और मड़ाई',
    descriptionEn:
      'Harvest when the crop is mature for your variety. Arrange a combine or manual crew, and keep bags, tarpaulin and transport ready.',
    descriptionHi:
      'अपनी किस्म के पकने पर कटाई करें। कंबाइन या मज़दूर टोली की व्यवस्था करें और बोरी, तिरपाल व परिवहन तैयार रखें।',
    offsetDays: 115,
    durationDays: 5,
    category: 'harvest',
    jobActivity: 'Harvesting',
    labour: labour(
      3,
      3,
      40,
      'Illustrative manual harvesting crew for bundling and stacking; a combine changes the requirement sharply.',
      'गट्ठर बनाने और ढेर लगाने के लिए अनुमानित मज़दूर टोली; कंबाइन से जरूरत बहुत बदल जाती है।',
    ),
  },
  {
    id: 'wheat-postharvest',
    crop: 'wheat',
    nameEn: 'Drying, cleaning & storage',
    nameHi: 'सुखाना, सफाई और भंडारण',
    descriptionEn:
      'Dry grain to a safe moisture level before storage. Clean the store, keep bags off the floor and protect the grain from dampness and pests.',
    descriptionHi:
      'भंडारण से पहले अनाज को सुरक्षित नमी तक सुखाएँ। गोदाम साफ करें, बोरी ज़मीन से ऊपर रखें और नमी व कीटों से बचाएँ।',
    offsetDays: 123,
    durationDays: 3,
    category: 'postharvest',
    jobActivity: null,
    labour: labour(
      1,
      1,
      10,
      'Illustrative help for bagging, cleaning and stacking. Often done by the farm family.',
      'बोरी भरने, सफाई और ढेर लगाने के लिए अनुमानित सहायता। अक्सर परिवार ही करता है।',
    ),
  },

  /* ------------------------------------------------------------------ */
  /* Paddy                                                               */
  /* ------------------------------------------------------------------ */
  {
    id: 'paddy-nursery',
    crop: 'paddy',
    nameEn: 'Nursery bed preparation & sowing',
    nameHi: 'नर्सरी तैयारी और बुवाई',
    descriptionEn:
      'Prepare a small nursery bed and sow pre-germinated seed. Keep the bed moist and protect seedlings from heavy rain.',
    descriptionHi:
      'छोटी नर्सरी तैयार करें और अंकुरित बीज बोएँ। क्यारी को नम रखें और भारी बारिश से पौधों को बचाएँ।',
    offsetDays: 0,
    durationDays: 3,
    category: 'sowing',
    jobActivity: 'Sowing',
    labour: labour(
      2,
      2,
      15,
      'Nursery work is concentrated on a small area; this uses main-field acres only as a rough planning proxy.',
      'नर्सरी का काम छोटे क्षेत्र में होता है; यहाँ मुख्य खेत का रकबा केवल मोटे अनुमान के लिए लिया गया है।',
    ),
  },
  {
    id: 'paddy-field-prep',
    crop: 'paddy',
    nameEn: 'Field puddling & bund repair',
    nameHi: 'खेत की पडलिंग और मेंड़ मरम्मत',
    descriptionEn:
      'Repair bunds and puddle the main field before transplanting. Check that water can be held evenly across the plot.',
    descriptionHi:
      'रोपाई से पहले मेंड़ ठीक करें और मुख्य खेत की पडलिंग करें। जाँचें कि पूरे खेत में पानी समान रूप से रुक सके।',
    offsetDays: 18,
    durationDays: 4,
    category: 'land',
    jobActivity: 'Irrigation',
    labour: labour(
      2,
      2,
      25,
      'Illustrative crew for bund repair and puddling; tractor use reduces manual labour.',
      'मेंड़ मरम्मत और पडलिंग के लिए अनुमानित टोली; ट्रैक्टर से मज़दूरी कम हो जाती है।',
    ),
  },
  {
    id: 'paddy-transplant',
    crop: 'paddy',
    nameEn: 'Transplanting',
    nameHi: 'रोपाई',
    descriptionEn:
      'Transplant healthy seedlings at the spacing recommended for your variety. Keep a shallow water layer during establishment.',
    descriptionHi:
      'स्वस्थ पौधों की रोपाई अपनी किस्म के लिए सुझाई गई दूरी पर करें। शुरुआती दिनों में हल्का पानी बनाए रखें।',
    offsetDays: 25,
    durationDays: 5,
    category: 'transplanting',
    jobActivity: 'Transplanting',
    labour: labour(
      4,
      4,
      50,
      'Transplanting is the most labour-intensive paddy step. Actual crew size depends on seedling age, spacing and water depth.',
      'रोपाई धान का सबसे श्रम-प्रधान काम है। टोली का आकार पौध की उम्र, दूरी और पानी पर निर्भर करता है।',
    ),
  },
  {
    id: 'paddy-weeding',
    crop: 'paddy',
    nameEn: 'Weeding & top-dressing',
    nameHi: 'निराई और टॉप ड्रेसिंग',
    descriptionEn:
      'Remove weeds and apply top-dressing only as advised by your soil test or local recommendation. Avoid draining the field immediately after application.',
    descriptionHi:
      'खरपतवार निकालें और टॉप ड्रेसिंग केवल मिट्टी जाँच या स्थानीय सलाह के अनुसार दें। डालने के तुरंत बाद खेत का पानी न निकालें।',
    offsetDays: 40,
    durationDays: 3,
    category: 'weeding',
    jobActivity: 'Weeding',
    labour: labour(
      2,
      2,
      30,
      'Illustrative manual weeding crew. Fertiliser quantity is deliberately not prescribed.',
      'हाथ से निराई करने वाली अनुमानित टोली। खाद की मात्रा जानबूझकर नहीं बताई गई है।',
    ),
  },
  {
    id: 'paddy-scouting',
    crop: 'paddy',
    nameEn: 'Water management & pest scouting',
    nameHi: 'जल प्रबंधन और कीट निरीक्षण',
    descriptionEn:
      'Check water depth and scout for pests or disease. Consult your KVK before choosing any plant-protection product.',
    descriptionHi:
      'पानी की गहराई जाँचें और कीट या रोग देखें। किसी भी फसल सुरक्षा उत्पाद का चुनाव करने से पहले केवीके से सलाह लें।',
    offsetDays: 60,
    durationDays: 2,
    category: 'scouting',
    jobActivity: null,
    labour: null,
  },
  {
    id: 'paddy-harvest',
    crop: 'paddy',
    nameEn: 'Harvesting & threshing',
    nameHi: 'कटाई और मड़ाई',
    descriptionEn:
      'Drain the field before harvest. Harvest the mature crop and thresh promptly to reduce losses.',
    descriptionHi:
      'कटाई से पहले खेत का पानी निकालें। पकी फसल काटें और नुकसान कम करने के लिए जल्दी मड़ाई करें।',
    offsetDays: 110,
    durationDays: 5,
    category: 'harvest',
    jobActivity: 'Harvesting',
    labour: labour(
      3,
      3,
      40,
      'Illustrative manual harvesting and threshing crew; combine use changes the requirement sharply.',
      'कटाई और मड़ाई की अनुमानित मज़दूर टोली; कंबाइन से जरूरत बहुत बदल जाती है।',
    ),
  },
  {
    id: 'paddy-postharvest',
    crop: 'paddy',
    nameEn: 'Drying & storage',
    nameHi: 'सुखाना और भंडारण',
    descriptionEn:
      'Dry paddy to a safe moisture level and store it in a clean, dry place. Keep bags away from walls and the floor.',
    descriptionHi:
      'धान को सुरक्षित नमी तक सुखाएँ और साफ, सूखी जगह पर भंडारित करें। बोरी दीवार और ज़मीन से दूर रखें।',
    offsetDays: 117,
    durationDays: 3,
    category: 'postharvest',
    jobActivity: null,
    labour: labour(
      1,
      1,
      10,
      'Illustrative help for drying, bagging and stacking.',
      'सुखाने, बोरी भरने और ढेर लगाने के लिए अनुमानित सहायता।',
    ),
  },

  /* ------------------------------------------------------------------ */
  /* Maize                                                               */
  /* ------------------------------------------------------------------ */
  {
    id: 'maize-sowing',
    crop: 'maize',
    nameEn: 'Land preparation & sowing',
    nameHi: 'खेत तैयारी और बुवाई',
    descriptionEn:
      'Prepare a well-drained seedbed and sow at the depth and spacing recommended for your hybrid. Confirm seed treatment locally.',
    descriptionHi:
      'अच्छे जल-निकास वाली क्यारी तैयार करें और अपने हाइब्रिड के लिए सुझाई गई गहराई व दूरी पर बुवाई करें। बीजोपचार की स्थानीय पुष्टि करें।',
    offsetDays: 0,
    durationDays: 3,
    category: 'sowing',
    jobActivity: 'Sowing',
    labour: labour(
      1.5,
      2,
      20,
      'Illustrative manual sowing crew; seed-drill sowing needs fewer workers.',
      'हाथ से बुवाई की अनुमानित टोली; सीड ड्रिल से कम मज़दूर लगते हैं।',
    ),
  },
  {
    id: 'maize-thinning',
    crop: 'maize',
    nameEn: 'Thinning, gap filling & weeding',
    nameHi: 'छँटाई, खाली स्थान भरना और निराई',
    descriptionEn:
      'Thin crowded plants, fill major gaps and remove early weeds. Keep the recommended plant population for your hybrid.',
    descriptionHi:
      'घने पौधे छाँटें, बड़े खाली स्थान भरें और शुरुआती खरपतवार निकालें। अपने हाइब्रिड के लिए सुझाई गई पौध संख्या बनाए रखें।',
    offsetDays: 12,
    durationDays: 3,
    category: 'weeding',
    jobActivity: 'Weeding',
    labour: labour(
      2,
      2,
      25,
      'Illustrative manual thinning and weeding crew.',
      'हाथ से छँटाई और निराई की अनुमानित टोली।',
    ),
  },
  {
    id: 'maize-earthing',
    crop: 'maize',
    nameEn: 'Earthing up & irrigation',
    nameHi: 'मिट्टी चढ़ाना और सिंचाई',
    descriptionEn:
      'Earth up around the stems and irrigate according to soil moisture. Avoid standing water in the field.',
    descriptionHi:
      'तनों के आसपास मिट्टी चढ़ाएँ और मिट्टी की नमी के अनुसार सिंचाई करें। खेत में पानी खड़ा न रहने दें।',
    offsetDays: 28,
    durationDays: 3,
    category: 'irrigation',
    jobActivity: 'Irrigation',
    labour: labour(
      1.5,
      2,
      20,
      'Illustrative helper crew for earthing up and moving irrigation pipes.',
      'मिट्टी चढ़ाने और सिंचाई पाइप हिलाने के लिए अनुमानित सहायक टोली।',
    ),
  },
  {
    id: 'maize-scouting',
    crop: 'maize',
    nameEn: 'Pest scouting & moisture check',
    nameHi: 'कीट निरीक्षण और नमी जाँच',
    descriptionEn:
      'Check whorls, leaves and cobs for pest or disease symptoms. Record findings and consult your KVK before any spray decision.',
    descriptionHi:
      'पत्तियों, गोभ और भुट्टों में कीट या रोग के लक्षण देखें। नतीजे लिखें और छिड़काव से पहले केवीके से सलाह लें।',
    offsetDays: 45,
    durationDays: 2,
    category: 'scouting',
    jobActivity: null,
    labour: null,
  },
  {
    id: 'maize-harvest',
    crop: 'maize',
    nameEn: 'Harvesting & shelling',
    nameHi: 'कटाई और दाना निकालना',
    descriptionEn:
      'Harvest cobs when the crop is mature for your hybrid. Shell and clean the grain without mixing wet and dry lots.',
    descriptionHi:
      'अपने हाइब्रिड के पकने पर भुट्टे तोड़ें। दाना निकालकर साफ करें और गीले-सूखे दाने मिलाएँ नहीं।',
    offsetDays: 95,
    durationDays: 4,
    category: 'harvest',
    jobActivity: 'Harvesting',
    labour: labour(
      2.5,
      3,
      35,
      'Illustrative manual harvesting and shelling crew; a sheller reduces the labour needed.',
      'कटाई और दाना निकालने की अनुमानित टोली; शेलर से मज़दूरी कम लगती है।',
    ),
  },
  {
    id: 'maize-postharvest',
    crop: 'maize',
    nameEn: 'Drying, grading & storage',
    nameHi: 'सुखाना, ग्रेडिंग और भंडारण',
    descriptionEn:
      'Dry grain to a safe moisture level, remove broken kernels and store in a clean, dry place.',
    descriptionHi:
      'दाने को सुरक्षित नमी तक सुखाएँ, टूटे दाने अलग करें और साफ, सूखी जगह पर भंडारित करें।',
    offsetDays: 102,
    durationDays: 3,
    category: 'postharvest',
    jobActivity: null,
    labour: labour(
      1,
      1,
      10,
      'Illustrative help for grading and bagging.',
      'ग्रेडिंग और बोरी भरने के लिए अनुमानित सहायता।',
    ),
  },

  /* ------------------------------------------------------------------ */
  /* Mustard                                                             */
  /* ------------------------------------------------------------------ */
  {
    id: 'mustard-sowing',
    crop: 'mustard',
    nameEn: 'Land preparation & sowing',
    nameHi: 'खेत तैयारी और बुवाई',
    descriptionEn:
      'Prepare a fine seedbed and sow at the rate and row spacing advised for your variety. Confirm seed treatment locally.',
    descriptionHi:
      'बारीक क्यारी तैयार करें और अपनी किस्म के लिए सुझाई गई बीज दर व पंक्ति दूरी पर बुवाई करें। बीजोपचार की स्थानीय पुष्टि करें।',
    offsetDays: 0,
    durationDays: 2,
    category: 'sowing',
    jobActivity: 'Sowing',
    labour: labour(
      1,
      1,
      12,
      'Illustrative manual sowing crew; drill sowing needs fewer workers.',
      'हाथ से बुवाई की अनुमानित टोली; ड्रिल से कम मज़दूर लगते हैं।',
    ),
  },
  {
    id: 'mustard-thinning',
    crop: 'mustard',
    nameEn: 'Thinning & first weeding',
    nameHi: 'छँटाई और पहली निराई',
    descriptionEn:
      'Thin overcrowded plants and remove early weeds. Leave enough spacing for the crop to branch.',
    descriptionHi:
      'ज़्यादा घने पौधे छाँटें और शुरुआती खरपतवार निकालें। फसल की शाखाओं के लिए पर्याप्त दूरी छोड़ें।',
    offsetDays: 18,
    durationDays: 2,
    category: 'weeding',
    jobActivity: 'Weeding',
    labour: labour(
      1.5,
      2,
      20,
      'Illustrative manual thinning and weeding crew.',
      'हाथ से छँटाई और निराई की अनुमानित टोली।',
    ),
  },
  {
    id: 'mustard-irrigation',
    crop: 'mustard',
    nameEn: 'Irrigation & top-dressing',
    nameHi: 'सिंचाई और टॉप ड्रेसिंग',
    descriptionEn:
      'Irrigate according to soil moisture and apply top-dressing only as advised by your soil test or local recommendation.',
    descriptionHi:
      'मिट्टी की नमी के अनुसार सिंचाई करें और टॉप ड्रेसिंग केवल मिट्टी जाँच या स्थानीय सलाह के अनुसार दें।',
    offsetDays: 35,
    durationDays: 2,
    category: 'irrigation',
    jobActivity: 'Irrigation',
    labour: labour(
      1,
      1,
      8,
      'Illustrative help for irrigation channels and a light weeding check.',
      'सिंचाई नाली और हल्की निराई जाँच के लिए अनुमानित सहायता।',
    ),
  },
  {
    id: 'mustard-scouting',
    crop: 'mustard',
    nameEn: 'Aphid & disease scouting',
    nameHi: 'माहू और रोग निरीक्षण',
    descriptionEn:
      'Inspect growing tips and pods for aphids or disease. Consult your KVK for identification and any treatment decision.',
    descriptionHi:
      'बढ़ती शाखाओं और फलियों में माहू या रोग देखें। पहचान और इलाज के फैसले के लिए केवीके से सलाह लें।',
    offsetDays: 50,
    durationDays: 2,
    category: 'scouting',
    jobActivity: null,
    labour: null,
  },
  {
    id: 'mustard-harvest',
    crop: 'mustard',
    nameEn: 'Harvesting',
    nameHi: 'कटाई',
    descriptionEn:
      'Harvest when pods turn mature for your variety. Cut in the morning where possible and keep the produce on tarpaulin to reduce shattering losses.',
    descriptionHi:
      'फलियाँ पकने पर कटाई करें। जहाँ संभव हो सुबह कटाई करें और दाना बिखरने से बचाने के लिए उपज तिरपाल पर रखें।',
    offsetDays: 100,
    durationDays: 3,
    category: 'harvest',
    jobActivity: 'Harvesting',
    labour: labour(
      2,
      2,
      30,
      'Illustrative manual harvesting crew for cutting and bundling.',
      'कटाई और गट्ठर बनाने की अनुमानित मज़दूर टोली।',
    ),
  },
  {
    id: 'mustard-postharvest',
    crop: 'mustard',
    nameEn: 'Threshing, cleaning & storage',
    nameHi: 'मड़ाई, सफाई और भंडारण',
    descriptionEn:
      'Thresh and clean the seed, then dry it to a safe moisture level before storage. Keep bags off the floor.',
    descriptionHi:
      'मड़ाई कर बीज साफ करें, फिर भंडारण से पहले सुरक्षित नमी तक सुखाएँ। बोरी ज़मीन से ऊपर रखें।',
    offsetDays: 106,
    durationDays: 3,
    category: 'postharvest',
    jobActivity: 'Threshing',
    labour: labour(
      1.5,
      2,
      20,
      'Illustrative help for threshing, cleaning and bagging.',
      'मड़ाई, सफाई और बोरी भरने के लिए अनुमानित सहायता।',
    ),
  },

  /* ------------------------------------------------------------------ */
  /* Sugarcane                                                           */
  /* ------------------------------------------------------------------ */
  {
    id: 'sugarcane-planting',
    crop: 'sugarcane',
    nameEn: 'Land preparation & sett planting',
    nameHi: 'खेत तैयारी और गन्ना रोपण',
    descriptionEn:
      'Prepare furrows and plant healthy setts at the row spacing advised locally. Treat setts as recommended before planting.',
    descriptionHi:
      'नालियाँ तैयार करें और स्वस्थ गन्ना टुकड़े स्थानीय सलाह के अनुसार पंक्ति दूरी पर रोपें। रोपण से पहले सुझाया गया उपचार करें।',
    offsetDays: 0,
    durationDays: 5,
    category: 'sowing',
    jobActivity: 'Sowing',
    labour: labour(
      3,
      3,
      40,
      'Illustrative manual sett-planting crew; mechanised planting changes the requirement.',
      'हाथ से गन्ना रोपण की अनुमानित टोली; मशीन से रोपण में जरूरत बदल जाती है।',
    ),
  },
  {
    id: 'sugarcane-gapfill',
    crop: 'sugarcane',
    nameEn: 'Gap filling & first weeding',
    nameHi: 'खाली स्थान भरना और पहली निराई',
    descriptionEn:
      'Replant missing setts and remove early weeds between rows. Keep the field free of standing water.',
    descriptionHi:
      'खाली जगह पर दोबारा रोपण करें और पंक्तियों के बीच शुरुआती खरपतवार निकालें। खेत में पानी खड़ा न रहने दें।',
    offsetDays: 30,
    durationDays: 3,
    category: 'weeding',
    jobActivity: 'Weeding',
    labour: labour(
      2,
      2,
      25,
      'Illustrative manual gap-filling and weeding crew.',
      'खाली स्थान भरने और निराई की अनुमानित टोली।',
    ),
  },
  {
    id: 'sugarcane-earthing',
    crop: 'sugarcane',
    nameEn: 'Weeding & earthing up',
    nameHi: 'निराई और मिट्टी चढ़ाना',
    descriptionEn:
      'Remove weeds and earth up around the cane rows. This supports the crop and helps with irrigation management.',
    descriptionHi:
      'खरपतवार निकालें और गन्ने की पंक्तियों के आसपास मिट्टी चढ़ाएँ। इससे फसल संभलती है और सिंचाई प्रबंधन आसान होता है।',
    offsetDays: 60,
    durationDays: 4,
    category: 'weeding',
    jobActivity: 'Weeding',
    labour: labour(
      2.5,
      3,
      30,
      'Illustrative manual weeding and earthing-up crew.',
      'निराई और मिट्टी चढ़ाने की अनुमानित टोली।',
    ),
  },
  {
    id: 'sugarcane-irrigation',
    crop: 'sugarcane',
    nameEn: 'Irrigation & propping',
    nameHi: 'सिंचाई और सहारा देना',
    descriptionEn:
      'Irrigate according to soil moisture and tie up lodged cane where needed. Avoid waterlogging in heavy soils.',
    descriptionHi:
      'मिट्टी की नमी के अनुसार सिंचाई करें और गिरे गन्ने को जहाँ जरूरी हो सहारा दें। भारी मिट्टी में जलभराव से बचें।',
    offsetDays: 120,
    durationDays: 3,
    category: 'irrigation',
    jobActivity: 'Irrigation',
    labour: labour(
      2,
      2,
      20,
      'Illustrative helper crew for irrigation and propping.',
      'सिंचाई और सहारा देने के लिए अनुमानित सहायक टोली।',
    ),
  },
  {
    id: 'sugarcane-scouting',
    crop: 'sugarcane',
    nameEn: 'Pest & disease scouting',
    nameHi: 'कीट और रोग निरीक्षण',
    descriptionEn:
      'Check leaves, stems and growing points for pest or disease symptoms. Consult your KVK before any treatment decision.',
    descriptionHi:
      'पत्तियों, तनों और बढ़ती कलियों में कीट या रोग के लक्षण देखें। किसी भी इलाज से पहले केवीके से सलाह लें।',
    offsetDays: 180,
    durationDays: 3,
    category: 'scouting',
    jobActivity: null,
    labour: null,
  },
  {
    id: 'sugarcane-harvest',
    crop: 'sugarcane',
    nameEn: 'Harvesting, de-trashing & loading',
    nameHi: 'कटाई, पत्ती सफाई और लोडिंग',
    descriptionEn:
      'Harvest close to the mill date, remove trash and load cane promptly. Coordinate transport so cut cane does not dry out.',
    descriptionHi:
      'मिल की तारीख के करीब कटाई करें, पत्तियाँ हटाएँ और गन्ना जल्दी लोड करें। परिवहन पहले से तय करें ताकि कटा गन्ना सूखे नहीं।',
    offsetDays: 330,
    durationDays: 7,
    category: 'harvest',
    jobActivity: 'Harvesting',
    labour: labour(
      4,
      4,
      60,
      'Illustrative manual harvesting and loading crew; mechanical harvesters reduce the crew sharply.',
      'कटाई और लोडिंग की अनुमानित टोली; मशीन से कटाई में टोली बहुत छोटी हो जाती है।',
    ),
  },
  {
    id: 'sugarcane-ratoon',
    crop: 'sugarcane',
    nameEn: 'Ratoon management',
    nameHi: 'रैटून प्रबंधन',
    descriptionEn:
      'After harvest, clear trash, repair furrows and manage the ratoon crop as advised locally. Decide whether to keep the ratoon or replant.',
    descriptionHi:
      'कटाई के बाद कचरा हटाएँ, नालियाँ ठीक करें और स्थानीय सलाह के अनुसार रैटून फसल संभालें। रैटून रखें या दोबारा रोपण करें, यह तय करें।',
    offsetDays: 345,
    durationDays: 4,
    category: 'land',
    jobActivity: null,
    labour: labour(
      2,
      2,
      25,
      'Illustrative help for trash clearing and furrow repair.',
      'कचरा हटाने और नाली मरम्मत के लिए अनुमानित सहायता।',
    ),
  },

  /* ------------------------------------------------------------------ */
  /* Potato                                                              */
  /* ------------------------------------------------------------------ */
  {
    id: 'potato-planting',
    crop: 'potato',
    nameEn: 'Land preparation & planting',
    nameHi: 'खेत तैयारी और रोपण',
    descriptionEn:
      'Prepare loose ridges and plant healthy seed tubers at the spacing advised for your variety. Confirm seed treatment locally.',
    descriptionHi:
      'ढीली मेड़ें तैयार करें और स्वस्थ बीज कंद अपनी किस्म के लिए सुझाई गई दूरी पर रोपें। बीज उपचार की स्थानीय पुष्टि करें।',
    offsetDays: 0,
    durationDays: 4,
    category: 'sowing',
    jobActivity: 'Sowing',
    labour: labour(
      3,
      3,
      35,
      'Illustrative manual planting crew; a potato planter reduces the requirement.',
      'हाथ से रोपण की अनुमानित टोली; पोटैटो प्लांटर से जरूरत कम हो जाती है।',
    ),
  },
  {
    id: 'potato-first-irrigation',
    crop: 'potato',
    nameEn: 'First irrigation & ridge check',
    nameHi: 'पहली सिंचाई और मेड़ जाँच',
    descriptionEn:
      'Irrigate lightly after establishment and check that ridges are intact. Avoid waterlogging around the seed tubers.',
    descriptionHi:
      'पौधे जमने के बाद हल्की सिंचाई करें और मेड़ें ठीक हैं या नहीं देखें। बीज कंद के आसपास जलभराव से बचें।',
    offsetDays: 15,
    durationDays: 2,
    category: 'irrigation',
    jobActivity: 'Irrigation',
    labour: labour(
      1,
      1,
      8,
      'Illustrative helper crew for irrigation and ridge repair.',
      'सिंचाई और मेड़ मरम्मत के लिए अनुमानित सहायक टोली।',
    ),
  },
  {
    id: 'potato-earthing',
    crop: 'potato',
    nameEn: 'Weeding & earthing up',
    nameHi: 'निराई और मिट्टी चढ़ाना',
    descriptionEn:
      'Remove weeds and earth up around the plants so tubers stay covered. Avoid damaging roots and stolons.',
    descriptionHi:
      'खरपतवार निकालें और पौधों के आसपास मिट्टी चढ़ाएँ ताकि कंद ढके रहें। जड़ों और स्टोलन को नुकसान से बचाएँ।',
    offsetDays: 25,
    durationDays: 3,
    category: 'weeding',
    jobActivity: 'Weeding',
    labour: labour(
      2.5,
      3,
      30,
      'Illustrative manual weeding and earthing-up crew.',
      'निराई और मिट्टी चढ़ाने की अनुमानित टोली।',
    ),
  },
  {
    id: 'potato-scouting',
    crop: 'potato',
    nameEn: 'Pest & disease scouting',
    nameHi: 'कीट और रोग निरीक्षण',
    descriptionEn:
      'Inspect leaves and stems for blight or pest symptoms. Consult your KVK before any spray decision, especially in humid weather.',
    descriptionHi:
      'पत्तियों और तनों में झुलसा या कीट के लक्षण देखें। नम मौसम में छिड़काव से पहले केवीके से सलाह लें।',
    offsetDays: 40,
    durationDays: 3,
    category: 'scouting',
    jobActivity: null,
    labour: null,
  },
  {
    id: 'potato-harvest',
    crop: 'potato',
    nameEn: 'Harvesting & grading',
    nameHi: 'खुदाई और ग्रेडिंग',
    descriptionEn:
      'Harvest when the crop is ready for your market or storage plan. Lift carefully to avoid tuber damage and grade on the field.',
    descriptionHi:
      'अपने बाजार या भंडारण योजना के अनुसार फसल तैयार होने पर खुदाई करें। कंद को चोट से बचाकर सावधानी से निकालें और खेत पर ही ग्रेड करें।',
    offsetDays: 85,
    durationDays: 5,
    category: 'harvest',
    jobActivity: 'Harvesting',
    labour: labour(
      4,
      4,
      50,
      'Illustrative manual digging and grading crew; a potato digger reduces manual lifting.',
      'हाथ से खुदाई और ग्रेडिंग की अनुमानित टोली; पोटैटो डिगर से मज़दूरी कम लगती है।',
    ),
  },
  {
    id: 'potato-postharvest',
    crop: 'potato',
    nameEn: 'Sorting, bagging & storage',
    nameHi: 'छँटाई, बोरी भरना और भंडारण',
    descriptionEn:
      'Sort out damaged tubers, bag the graded lots and store in a cool, ventilated place. Keep seed and table stock separate.',
    descriptionHi:
      'खराब कंद अलग करें, ग्रेड अनुसार बोरी भरें और ठंडी, हवादार जगह पर भंडारित करें। बीज और खाने वाले आलू अलग रखें।',
    offsetDays: 92,
    durationDays: 3,
    category: 'postharvest',
    jobActivity: 'Picking',
    labour: labour(
      2,
      2,
      25,
      'Illustrative help for sorting and bagging.',
      'छँटाई और बोरी भरने के लिए अनुमानित सहायता।',
    ),
  },

  /* ------------------------------------------------------------------ */
  /* Tomato                                                              */
  /* ------------------------------------------------------------------ */
  {
    id: 'tomato-transplant',
    crop: 'tomato',
    nameEn: 'Nursery raising & transplanting',
    nameHi: 'नर्सरी तैयारी और रोपाई',
    descriptionEn:
      'Raise healthy seedlings and transplant at the spacing advised for your variety. Harden seedlings before transplanting and water lightly after.',
    descriptionHi:
      'स्वस्थ पौध तैयार करें और अपनी किस्म के लिए सुझाई गई दूरी पर रोपाई करें। रोपाई से पहले पौध सख्त करें और बाद में हल्की सिंचाई करें।',
    offsetDays: 0,
    durationDays: 5,
    category: 'transplanting',
    jobActivity: 'Transplanting',
    labour: labour(
      3,
      3,
      30,
      'Transplanting is labour intensive. Nursery area is small; main-field acres are used as a planning proxy.',
      'रोपाई में अधिक मज़दूर लगते हैं। नर्सरी छोटी होती है; यहाँ मुख्य खेत का रकबा मोटे अनुमान के लिए लिया गया है।',
    ),
  },
  {
    id: 'tomato-staking',
    crop: 'tomato',
    nameEn: 'Staking, weeding & mulching',
    nameHi: 'सहारा देना, निराई और मल्चिंग',
    descriptionEn:
      'Stake plants as they grow, remove weeds and add mulch where locally appropriate. Keep rows walkable for picking.',
    descriptionHi:
      'पौधे बढ़ने पर सहारा दें, खरपतवार निकालें और जहाँ उपयुक्त हो मल्च डालें। पंक्तियों में तुड़ाई के लिए चलने की जगह रखें।',
    offsetDays: 20,
    durationDays: 4,
    category: 'weeding',
    jobActivity: 'Weeding',
    labour: labour(
      2.5,
      3,
      30,
      'Illustrative manual staking, weeding and mulching crew.',
      'सहारा देने, निराई और मल्चिंग की अनुमानित टोली।',
    ),
  },
  {
    id: 'tomato-scouting',
    crop: 'tomato',
    nameEn: 'Irrigation & pest scouting',
    nameHi: 'सिंचाई और कीट निरीक्षण',
    descriptionEn:
      'Irrigate according to soil moisture and scout leaves and fruit for pests or disease. Consult your KVK before any spray decision.',
    descriptionHi:
      'मिट्टी की नमी के अनुसार सिंचाई करें और पत्तियों व फलों में कीट या रोग देखें। छिड़काव से पहले केवीके से सलाह लें।',
    offsetDays: 35,
    durationDays: 3,
    category: 'scouting',
    jobActivity: null,
    labour: null,
  },
  {
    id: 'tomato-harvest',
    crop: 'tomato',
    nameEn: 'Harvesting (multiple pickings)',
    nameHi: 'तुड़ाई (कई बार)',
    descriptionEn:
      'Pick at the ripeness stage your market needs. Tomato ripens over several weeks, so plan repeated pickings and keep crates shaded.',
    descriptionHi:
      'अपने बाजार के अनुसार पकने की अवस्था पर तुड़ाई करें। टमाटर कई सप्ताह में पकता है, इसलिए बार-बार तुड़ाई की योजना बनाएँ और क्रेट छाया में रखें।',
    offsetDays: 75,
    durationDays: 5,
    category: 'harvest',
    jobActivity: 'Harvesting',
    labour: labour(
      3,
      3,
      40,
      'Illustrative crew for one picking round. Repeat picking on the same plants will need further rounds.',
      'एक तुड़ाई के लिए अनुमानित टोली। उसी फसल से दोबारा तुड़ाई में अलग टोली लगेगी।',
    ),
  },
  {
    id: 'tomato-packing',
    crop: 'tomato',
    nameEn: 'Grading, packing & crate handling',
    nameHi: 'ग्रेडिंग, पैकिंग और क्रेट संभालना',
    descriptionEn:
      'Grade fruit by size and condition, pack into clean crates and keep lots shaded. Handle gently to reduce bruising.',
    descriptionHi:
      'फल को आकार और स्थिति के अनुसार ग्रेड करें, साफ क्रेट में पैक करें और छाया में रखें। चोट कम करने के लिए सावधानी से संभालें।',
    offsetDays: 82,
    durationDays: 4,
    category: 'postharvest',
    jobActivity: 'Picking',
    labour: labour(
      2.5,
      3,
      30,
      'Illustrative grading and packing crew; crate availability and market timing change the need.',
      'ग्रेडिंग और पैकिंग की अनुमानित टोली; क्रेट और बाजार के समय से जरूरत बदलती है।',
    ),
  },
  {
    id: 'tomato-cleanup',
    crop: 'tomato',
    nameEn: 'Field cleanup & residue management',
    nameHi: 'खेत की सफाई और अवशेष प्रबंधन',
    descriptionEn:
      'Remove crop residues and damaged fruit, then plan the next crop. Dispose of diseased material away from healthy plots.',
    descriptionHi:
      'फसल अवशेष और खराब फल हटाएँ, फिर अगली फसल की योजना बनाएँ। रोगग्रस्त सामग्री स्वस्थ खेतों से दूर हटाएँ।',
    offsetDays: 95,
    durationDays: 3,
    category: 'land',
    jobActivity: 'Weeding',
    labour: labour(
      1.5,
      2,
      20,
      'Illustrative help for clearing vines and field residue.',
      'बेल और खेत अवशेष साफ करने के लिए अनुमानित सहायता।',
    ),
  },
]

/** Stages for one crop, in scheduled order. */
export function stagesForCrop(crop: PlannerCropKey): CropStageTemplate[] {
  return CROP_STAGES.filter((stage) => stage.crop === crop).sort(
    (a, b) => a.offsetDays - b.offsetDays,
  )
}

/* ---------------------------------------------------------------------------
   Safety copy, limits and general references
   --------------------------------------------------------------------------- */

export const PLANNER_LIMITS = {
  areaMin: 0.1,
  areaMax: 100,
  maxCustomTasks: 50,
} as const

export const PLANNER_SAFETY = {
  titleEn: 'Approximate planning aid - not an official recommendation',
  titleHi: 'अनुमानित योजना सहायता - आधिकारिक सिफ़ारिश नहीं',
  bodyEn:
    'The stage sequence follows common crop practice, but exact dates depend on variety, weather, soil, water supply and local conditions. Verify the schedule with a qualified local agricultural expert or your KVK before acting on it.',
  bodyHi:
    'चरणों का क्रम सामान्य फसल पद्धति पर आधारित है, लेकिन सही तारीखें किस्म, मौसम, मिट्टी, पानी और स्थानीय परिस्थितियों पर निर्भर हैं। किसी भी कार्रवाई से पहले योग्य स्थानीय कृषि विशेषज्ञ या अपने केवीके से कार्यक्रम की पुष्टि करें।',
  dataNoteEn:
    'Labour numbers are illustrative demo assumptions, not official labour norms. They scale from the farm area you enter and are rounded up to a whole worker.',
  dataNoteHi:
    'मज़दूरों की संख्या केवल उदाहरण अनुमान है, आधिकारिक श्रम मानक नहीं। यह आपके खेत के रकबे से बढ़ती-घटती है और पूरे मज़दूर में बदली जाती है।',
  noDoseEn:
    'No fertiliser dose, pesticide instruction, guaranteed date or yield prediction is generated.',
  noDoseHi:
    'कोई खाद मात्रा, कीटनाशक निर्देश, निश्चित तारीख या उपज का अनुमान नहीं बनाया जाता।',
  disclosureEn: 'Prototype planner with curated templates and local calculations.',
  disclosureHi: 'क्यूरेटेड टेम्पलेट और स्थानीय गणना वाला प्रोटोटाइप प्लानर।',
} as const

export interface PlannerReference {
  id: string
  labelEn: string
  labelHi: string
  /** Only verified, working public portals are linked. */
  url: string
}

export const PLANNER_REFERENCES: PlannerReference[] = [
  {
    id: 'icar',
    labelEn: 'ICAR - Indian Council of Agricultural Research',
    labelHi: 'भाकृअनुप - भारतीय कृषि अनुसंधान परिषद',
    url: 'https://icar.org.in/',
  },
  {
    id: 'agriwelfare',
    labelEn: 'Department of Agriculture & Farmers Welfare',
    labelHi: 'कृषि एवं किसान कल्याण विभाग',
    url: 'https://agriwelfare.gov.in/',
  },
]

export const PLANNER_REFERENCE_NOTE = {
  en: 'General agriculture portals only. They are not a crop-specific recommendation for your field - confirm the local package of practices with your KVK or agriculture officer.',
  hi: 'ये केवल सामान्य कृषि पोर्टल हैं। आपके खेत के लिए फसल-विशेष सिफ़ारिश नहीं हैं - स्थानीय पैकेज ऑफ प्रैक्टिस की पुष्टि अपने केवीके या कृषि अधिकारी से करें।',
} as const
