import type { KnowledgeSource } from '@/data/aiKnowledge'
import type { CropKey } from '@/store/types'

/**
 * ---------------------------------------------------------------------------
 * CURATED DIAGNOSTIC CONTENT (KisanSathi AI - Local Prototype)
 * ---------------------------------------------------------------------------
 * Everything below is general agronomic guidance written for this prototype.
 * It is deliberately framed as *possible causes to check*, never as a confirmed
 * diagnosis.
 *
 * Rules baked into this file:
 *  - no pesticide names, no fertilizer doses, no guaranteed diagnosis,
 *  - no yield promises and no live weather / price / scheme data,
 *  - every cause points the farmer at a Krishi Vigyan Kendra or a qualified
 *    agricultural expert for the confirmation that this prototype cannot give,
 *  - only two external links are used and both were verified to resolve:
 *    https://icar.org.in/ and https://agriwelfare.gov.in/
 */

/** Symptoms the farmer can describe in their own words. */
export type DiagnosticSymptom =
  | 'yellowing'
  | 'wilting'
  | 'stunted'
  | 'spots'
  | 'pests'
  | 'rotting'
  | 'unclear'

/** How the field is watered. */
export type DiagnosticWater = 'dry' | 'normal' | 'over' | 'waterlogged' | 'none' | 'unclear'

/** What happened in the last week or two. */
export type DiagnosticConditions = 'rain' | 'heat' | 'cold' | 'calm' | 'unclear'

/** How old the plants are. */
export type DiagnosticAge = 'just-sown' | 'young' | 'growing' | 'mature' | 'unclear'

export interface DiagnosticCause {
  id: string
  /** Restricts the cause to specific crops. Omitted = fits any crop. */
  crops?: CropKey[]
  /** Symptoms this cause can produce. Omitted = not symptom specific. */
  symptoms?: DiagnosticSymptom[]
  /** Watering situations that raise the fit. */
  water?: DiagnosticWater[]
  /** Recent conditions that raise the fit. */
  conditions?: DiagnosticConditions[]
  /** Plant ages that raise the fit. */
  age?: DiagnosticAge[]
  titleEn: string
  titleHi: string
  /**
   * Why this cause may fit. Supports the tokens {crop}, {symptom}, {water},
   * {conditions} and {age}.
   */
  whyEn: string
  whyHi: string
  /** What the farmer can check in the field, without any product or dose. */
  checkEn: string
  checkHi: string
  /** A safe next step that does not need a prescription. */
  stepEn: string
  stepHi: string
  sources: KnowledgeSource[]
}

export const DIAGNOSTIC_SOURCES = {
  icar: {
    title: 'ICAR - Indian Council of Agricultural Research',
    url: 'https://icar.org.in/',
    kind: 'sourced',
  },
  agri: {
    title: 'Department of Agriculture & Farmers Welfare',
    url: 'https://agriwelfare.gov.in/',
    kind: 'sourced',
  },
  kvk: {
    title: 'Your nearest Krishi Vigyan Kendra (KVK) or agriculture extension officer',
    kind: 'general',
  },
  scouting: {
    title: 'Field scouting record (crop, symptom, spread) - take it to your KVK',
    kind: 'general',
  },
} satisfies Record<string, KnowledgeSource>

const CAUSE_SOURCES: KnowledgeSource[] = [DIAGNOSTIC_SOURCES.icar, DIAGNOSTIC_SOURCES.kvk]

export const DIAGNOSTIC_CAUSES: DiagnosticCause[] = [
  /* ----------------------------------------------------------------- */
  /* Causes that can apply to any crop                                   */
  /* ----------------------------------------------------------------- */
  {
    id: 'water-stress',
    symptoms: ['wilting', 'yellowing', 'stunted'],
    water: ['dry', 'none'],
    titleEn: 'Water stress - the root zone is running dry',
    titleHi: 'पानी की कमी - जड़ वाला हिस्सा सूख रहा है',
    whyEn:
      'You described {water}. When the root zone dries out the plant stops taking up nutrients, leaves droop during the day and older leaves turn pale, so growth slows down.',
    whyHi:
      'आपने बताया कि {water}। जड़ वाला हिस्सा सूखने पर पौधा पोषण लेना बंद कर देता है, दिन में पत्ते झुकते हैं और पुराने पत्ते हल्के पीले पड़ते हैं, जिससे बढ़वार रुक जाती है।',
    checkEn:
      'Push a stick 10-15 cm into the root zone and feel the soil. Dry, crumbly or hard-cracked soil means the crop is short of water.',
    checkHi:
      'जड़ वाले हिस्से में 10-15 सेमी डाल डालकर मिट्टी छूकर देखें। सूखी, भुरभुरी या पपड़ी बनी मिट्टी का मतलब पानी की कमी है।',
    stepEn:
      'Give the crop a normal watering for your soil type and look at it again after a few days. Do not flood the field.',
    stepHi:
      'अपनी मिट्टी के हिसाब से सामान्य सिंचाई दें और कुछ दिन बाद फिर देखें। खेत में बाढ़ न भरें।',
    sources: CAUSE_SOURCES,
  },
  {
    id: 'waterlogging',
    symptoms: ['yellowing', 'wilting', 'stunted'],
    water: ['over', 'waterlogged'],
    conditions: ['rain'],
    titleEn: 'Waterlogging or poor drainage',
    titleHi: 'जलभराव या खराब जल निकास',
    whyEn:
      'You described {water}. Saturated soil leaves very little air for the roots, so the plant cannot take up nutrients even when the soil has them. That produces the slow growth, yellowing and wilting you described.',
    whyHi:
      'आपने बताया कि {water}। जलभरित मिट्टी में जड़ों को बहुत कम ऑक्सीजन मिलती है, इसलिए मिट्टी में पोषण होने पर भी पौधा उसे नहीं ले पाता। इसी से धीमी बढ़वार, पीलापन और मुरझाना होता है।',
    checkEn:
      'Look for standing water, water-loving weeds, or soil that is still wet days after a rain. Check whether the field drains at all.',
    checkHi:
      'खेत में खड़ा पानी, पानी पसंद करने वाली खरपतवार, या बारिश के कई दिन बाद भी गीली मिट्टी देखें। पानी निकलता है या नहीं, यह भी जाँचें।',
    stepEn:
      'Clear or open the drainage channels and raise the ridges so excess water leaves the plot, then look at the crop again after 5-7 days.',
    stepHi:
      'नालियाँ साफ़ या खुली करें और मेड़ें ऊँची करें ताकि ज़्यादा पानी खेत से निकल जाए, फिर 5-7 दिन बाद फसल देखें।',
    sources: CAUSE_SOURCES,
  },
  {
    id: 'nutrient-supply',
    symptoms: ['yellowing', 'stunted'],
    titleEn: 'Nutrient supply - confirm with a soil test',
    titleHi: 'पोषण की कमी - मिट्टी जाँच से पुष्टि करें',
    whyEn:
      'Pale, even growth across a plot often points at nutrient supply rather than a single pest. You described {symptom} on a crop that is {age}, and a young crop shows a nutrient shortfall quickly.',
    whyHi:
      'पूरे खेत में एक-सा हल्का पीलापन अक्सर किसी एक कीट के बजाय पोषण की कमी दिखाता है। आपने {age} फसल में {symptom} बताया है, और छोटी फसल में पोषण की कमी जल्दी दिखती है।',
    checkEn:
      'Compare an affected patch with a healthy patch: is the yellowing even or patchy, and are the older leaves affected more than the new growth?',
    checkHi:
      'प्रभावित हिस्से और स्वस्थ हिस्से की तुलना करें: पीलापन एक-सा है या धब्बेदार, और पुराने पत्ते नए बढ़वार से ज़्यादा प्रभावित हैं?',
    stepEn:
      'Ask your KVK or agriculture office for a soil test and a nutrient recommendation for this crop and this soil. Do not apply fertilizer on the strength of a chat reply.',
    stepHi:
      'अपने KVK या कृषि कार्यालय से इस फसल और इस मिट्टी के लिए मिट्टी जाँच और पोषण सलाह लें। चैट के जवाब के आधार पर उर्वरक न डालें।',
    sources: CAUSE_SOURCES,
  },
  {
    id: 'pest-damage',
    symptoms: ['pests', 'spots', 'stunted', 'wilting'],
    titleEn: 'Insect damage - confirm by scouting the field',
    titleHi: 'कीट का नुकसान - खेत की निगरानी से पुष्टि करें',
    whyEn:
      'You reported {symptom}. Insect damage is common in this situation, and damage that is patchy or heavier on one side of the field usually points away from a soil or water problem.',
    whyHi:
      'आपने {symptom} बताया है। ऐसी स्थिति में कीट का नुकसान आम है, और धब्बेदार या खेत के एक तरफ ज़्यादा नुकसान आमतौर पर मिट्टी या पानी की समस्या से अलग होता है।',
    checkEn:
      'Walk the field in a W pattern, look under the leaves and at the stem base, and count damaged plants in ten different spots. Note which part of the plant is damaged.',
    checkHi:
      'खेत को W-आकार में घूमकर देखें, पत्तों के नीचे और तने के आधार पर देखें, दस जगह प्रभावित पौधे गिनें और लिखें कि पौधे का कौन सा हिस्सा खराब है।',
    stepEn:
      'Write down what you find and show a photo or a sample to your KVK. Chemical names and doses must come from a local officer, not from this chat.',
    stepHi:
      'जो मिला उसे लिखें और फ़ोटो या नमूना अपने KVK को दिखाएं। कीटनाशक का नाम और मात्रा स्थानीय अधिकारी से लें, इस चैट से नहीं।',
    sources: CAUSE_SOURCES,
  },
  {
    id: 'disease-complex',
    symptoms: ['spots', 'rotting', 'yellowing', 'wilting'],
    conditions: ['rain', 'cold'],
    titleEn: 'A disease complex - the cause has to be identified in the field',
    titleHi: 'रोग-समूह - कारण की पहचान खेत में ही करनी होगी',
    whyEn:
      'Spots, rotting or sudden wilting that spreads from plant to plant can be a disease complex. The symptoms alone cannot separate a fungal, bacterial or viral problem, and no treatment should be chosen before that is known.',
    whyHi:
      'धब्बे, सड़न या अचानक मुरझाना जो एक पौधे से दूसरे तक फैले, रोग-समूह हो सकता है। केवल लक्षणों से फफूंद, जीवाणु या वायरस में अंतर नहीं किया जा सकता, और पहचान से पहले कोई उपचार नहीं चुनना चाहिए।',
    checkEn:
      'Check whether the affected plants cluster in the wet part of the field, and look at the stem base, the underside of the leaves and any tuber or fruit for lesions.',
    checkHi:
      'देखें कि प्रभावित पौधे खेत के गीले हिस्से में एक-साथ हैं या नहीं, और तने के आधार, पत्ते की निचली सतह तथा आलू/फल पर घाव देखें।',
    stepEn:
      'Remove clearly affected plant material where practical, do not carry wet soil between plots, and get a diagnosis from your KVK before any treatment step.',
    stepHi:
      'जहाँ संभव हो प्रभावित पौधे की सामग्री हटाएं, गीली मिट्टी एक खेत से दूसरे में न ले जाएं, और कोई भी उपचार करने से पहले KVK से पहचान कराएं।',
    sources: CAUSE_SOURCES,
  },
  {
    id: 'temperature-stress',
    symptoms: ['yellowing', 'wilting', 'stunted'],
    conditions: ['heat', 'cold'],
    titleEn: 'Temperature stress',
    titleHi: 'तापमान का दबाव',
    whyEn:
      'You mentioned {conditions}. Both heat and cold can stop growth or damage leaves with no pest present, and the damage usually shows first on the exposed side of the row.',
    whyHi:
      'आपने {conditions} बताया है। गर्मी और ठंड दोनों बिना किसी कीट के बढ़वार रोक सकते हैं या पत्तों को नुकसान पहुँचा सकते हैं, और नुकसान आमतौर पर कतार के खुले हिस्से में पहले दिखता है।',
    checkEn:
      'Compare the same row on two different days and note whether the damage is on the exposed side or spread across the whole plot.',
    checkHi:
      'एक ही कतार को दो अलग दिनों में देखें और लिखें कि नुकसान खुले हिस्से में है या पूरे खेत में फैला है।',
    stepEn:
      'Irrigate early in the morning or late in the evening, keep the soil surface covered, and ask your KVK for the local recommendation for this crop and season.',
    stepHi:
      'सुबह जल्दी या शाम को सिंचाई करें, मिट्टी की सतह ढकी रखें, और KVK से इस फसल व इस मौसम की स्थानीय सलाह लें।',
    sources: CAUSE_SOURCES,
  },
  {
    id: 'planting-material',
    symptoms: ['stunted', 'yellowing'],
    titleEn: 'Planting material or seed lot',
    titleHi: 'बीज या बुवाई सामग्री की समस्या',
    whyEn:
      'When only some plants in the same row are affected, the cause is often the planting material or the seed lot rather than the whole field.',
    whyHi:
      'जब एक ही कतार में से कुछ ही पौधे प्रभावित हों, तो कारण अक्सर बुवाई सामग्री या बीज लॉट होता है, पूरा खेत नहीं।',
    checkEn:
      'Compare the weakest and the strongest plant in the same row and check whether they came from the same batch.',
    checkHi:
      'एक ही कतार में सबसे कमज़ोर और सबसे मज़बूत पौधे की तुलना करें और देखें कि वे एक ही बैच के हैं या नहीं।',
    stepEn:
      'Keep the seed packet or lot details and the affected planting material, and ask your KVK whether the lot needs to be reported.',
    stepHi:
      'बीज की पर्ची/लॉट की जानकारी और प्रभावित सामग्री रखें, और KVK से पूछें कि इस लॉट की सूचना देनी है या नहीं।',
    sources: CAUSE_SOURCES,
  },
  {
    id: 'root-damage',
    symptoms: ['wilting', 'stunted'],
    titleEn: 'Root damage or transplant shock',
    titleHi: 'जड़ की क्षति या रोपाई का झटका',
    whyEn:
      'Wilting that starts right after transplanting, or on plants standing where the soil was worked deeply, points at the roots rather than at the leaves.',
    whyHi:
      'रोपाई के तुरंत बाद शुरू हुआ मुरझाना, या जहाँ मिट्टी गहरी खोदी गई हो वहाँ के पौधों का मुरझाना, पत्तों के बजाय जड़ की क्षति का संकेत है।',
    checkEn:
      'Dig up one wilting plant and look at the roots: are they firm and pale, or brown, soft or broken?',
    checkHi:
      'एक मुरझाया पौधा निकालकर जड़ देखें: जड़ें मज़बूत और हल्की हैं, या भूरी, नरम या टूटी हुई हैं?',
    stepEn:
      'Keep the soil around the root zone evenly moist and loose, and avoid deep hoeing close to the stem. Ask your KVK before any corrective treatment.',
    stepHi:
      'जड़ के आसपास की मिट्टी को समान रूप से नम और ढीली रखें, तने के पास गहरी खुदाई न करें। कोई सुधार-उपचार लेने से पहले KVK से पूछें।',
    sources: CAUSE_SOURCES,
  },

  /* ----------------------------------------------------------------- */
  /* Potato                                                             */
  /* ----------------------------------------------------------------- */
  {
    id: 'potato-seed-tuber',
    crops: ['potato'],
    symptoms: ['stunted', 'yellowing'],
    titleEn: 'Weak or uneven sprouting of the seed tuber',
    titleHi: 'बीज आलू का कमज़ोर या असमान अंकुरण',
    whyEn:
      'In potato, weak or uneven emergence usually starts with the seed tuber - poor sprouting, sprouts damaged while handling, or seed tubers cut too large. You described {symptom} on a crop that is {age}.',
    whyHi:
      'आलू में कमज़ोर या असमान उगान का कारण आमतौर पर बीज आलू से होता है - कमज़ोर अंकुरण, उठाने-रखने में टूटा अंकुर, या बहुत बड़े काटे गए आलू। आपने {age} फसल में {symptom} बताया है।',
    checkEn:
      'Dig up a few weak spots and look at the seed tuber and its sprouts. Compare their size with the seed you actually planted.',
    checkHi:
      'कुछ कमज़ोर जगहें खोदकर बीज आलू और उसके अंकुर देखें। उनके आकार की तुलना बोई गई बीज आलू से करें।',
    stepEn:
      'Use certified, sprouted seed tubers of a suitable size next season and ask your KVK for the local recommendation on seed size and spacing.',
    stepHi:
      'अगली बार प्रमाणित और अंकुरित बीज आलू का उपयोग करें और KVK से बीज के आकार व दूरी की स्थानीय सलाह लें।',
    sources: CAUSE_SOURCES,
  },
  {
    id: 'potato-borer',
    crops: ['potato'],
    symptoms: ['stunted', 'wilting'],
    titleEn: 'Borer damage inside the stem',
    titleHi: 'तने में बेलर का नुकसान',
    whyEn:
      'In potato, a single stem wilting while the rest of the row still stands is a classic sign of borer damage inside the stem. Weak, patchy growth across the row can be the same pest at an earlier stage.',
    whyHi:
      'आलू में एक तना मुरझाना जबकि बाकी कतार खड़ी रहे, यह तने के अंदर बेलर के नुकसान का आम संकेत है। कतार में धब्बेदार कमज़ोरी भी वही कीट पहले चरण में हो सकती है।',
    checkEn:
      'Look for a small hole in the stem with frass around it, and split one wilting stem lengthwise to look for a tunnel.',
    checkHi:
      'तने में छोटा छेद और उसके आसपास मलबू (frass) देखें, और एक मुरझाया तना लंबवत चीरकर अंदर सुरंग देखें।',
    stepEn:
      'Remove and destroy the affected plants, and report the problem to your KVK for a locally recommended management plan. Do not apply any pesticide on the strength of this chat.',
    stepHi:
      'प्रभावित पौधे हटाकर नष्ट करें और KVK को बताएं ताकि स्थानीय सलाह के अनुसार प्रबंधन हो सके। इस चैट के आधार पर कोई कीटनाशक न डालें।',
    sources: CAUSE_SOURCES,
  },
  {
    id: 'potato-virus',
    crops: ['potato'],
    symptoms: ['stunted', 'yellowing'],
    titleEn: 'Virus carried by seed tubers or by aphids',
    titleHi: 'बीज आलू या माहू से फैलने वाला वायरस',
    whyEn:
      'In potato, mottled or mosaic-pattern leaves together with stunted, uneven plants point to a virus carried by infected seed tubers or by aphids. A virus in the field cannot be cured after it arrives.',
    whyHi:
      'आलू में मोज़ेक जैसे धब्बेदार पत्ते और बढ़वार में असमानता वायरस का संकेत है, जो संक्रमित बीज आलू या माहू से फैलता है। संक्रमण के बाद खेत में उपचार संभव नहीं है।',
    checkEn:
      'Look for mottled or mosaic-pattern leaves and for plants that stay small next to normal ones. Check for soft-bodied insects such as aphids.',
    checkHi:
      'मोज़ेक/धब्बेदार पत्ते देखें और सामान्य पौधों के बगल में छोटे रह जाने वाले पौधे देखें। माहू जैसे नरम कीटों की जाँच करें।',
    stepEn:
      'Rogue out and destroy affected plants, use certified seed tubers next season, and confirm with your KVK, which can also advise on the local vector.',
    stepHi:
      'प्रभावित पौधे उखाड़कर नष्ट करें, अगली बार प्रमाणित बीज आलू लें, और KVK से पुष्टि करें - वे स्थानीय वाहक के बारे में भी बता सकते हैं।',
    sources: CAUSE_SOURCES,
  },

  /* ----------------------------------------------------------------- */
  /* Wheat                                                              */
  /* ----------------------------------------------------------------- */
  {
    id: 'wheat-rust',
    crops: ['wheat'],
    symptoms: ['spots', 'yellowing'],
    conditions: ['rain', 'cold'],
    titleEn: 'Rust or a leaf blight on wheat',
    titleHi: 'गेहूँ में रस्ट या पत्ती का झुलसा रोग',
    whyEn:
      'In wheat, small orange-brown or yellow pustules on the leaves are the sign of rust, and it spreads quickly in cool, damp spells. Leaf spots that look similar can also be a leaf blight, so the leaves need to be checked closely.',
    whyHi:
      'गेहूँ में पत्तों पर छोटे नारंगी-भूरे या पीले फफोले रस्ट के संकेत हैं, और ठंडे-नम मौसम में यह तेज़ी से फैलता है। मिलते-जुलते दागे पत्ती का झुलसा भी हो सकते हैं, इसलिए पत्ते ध्यान से देखने चाहिए।',
    checkEn:
      'Rub the underside of a suspect leaf with your finger: rust leaves a dusty orange-brown smear. Note how many plants and how much of the crop is affected.',
    checkHi:
      'शंकास्पद पत्ते की निचली सतह को उँगली से रगड़ें: रस्ट में नारंगी-भूरा धूल जैसा दाग लगता है। लिखें कि कितने पौधे और कितना हिस्सा प्रभावित है।',
    stepEn:
      'Report it to your KVK or the local agriculture office early, because rust decisions are time-sensitive, and ask for the locally recommended management. No fungicide is named here on purpose.',
    stepHi:
      'इसे जल्दी KVK या स्थानीय कृषि कार्यालय को बताएं, क्योंकि रस्ट के निर्णय समय-संवेदी होते हैं, और स्थानीय सलाह के अनुसार प्रबंधन करें। यहाँ जानबूझकर कोई फफूंदनाशक नहीं बताया गया है।',
    sources: CAUSE_SOURCES,
  },
  {
    id: 'wheat-soft-pest',
    crops: ['wheat'],
    symptoms: ['pests', 'spots', 'stunted'],
    titleEn: 'Soft-bodied pests in wheat',
    titleHi: 'गेहूँ में नरम कीट',
    whyEn:
      'In wheat, soft-bodied pests such as aphids cluster on the stem and the lower leaves and can make a crop look pale and weak from a distance. The same look can also come from nutrient or water problems, so the plants have to be checked in the field.',
    whyHi:
      'गेहूँ में माहू जैसे नरम कीट तने और निचले पत्तों पर जमा होते हैं और दूर से फसल को पीली-कमज़ोर दिखा सकते हैं। यही दिखावट पोषण या पानी की समस्या से भी हो सकती है, इसलिए खेत में जाँच ज़रूरी है।',
    checkEn:
      'Look at the stem base and the lower leaves, shake a plant over a white cloth and count the small insects that come out.',
    checkHi:
      'तने के आधार और निचले पत्ते देखें, एक पौधे को सफ़ेद कपड़े पर हिलाकर गिनें कि कितने छोटे कीट निकलते हैं।',
    stepEn:
      'Record the pest, the damaged part of the crop and the extent, then take that record to your KVK for a locally recommended response.',
    stepHi:
      'कीट, नुकसान वाला हिस्सा और नुकसान की मात्रा लिखें, फिर वह रिकॉर्ड KVK से स्थानीय सलाह के लिए ले जाएं।',
    sources: CAUSE_SOURCES,
  },

  /* ----------------------------------------------------------------- */
  /* Tomato                                                             */
  /* ----------------------------------------------------------------- */
  {
    id: 'tomato-vascular-wilt',
    crops: ['tomato'],
    symptoms: ['wilting', 'yellowing'],
    titleEn: 'A vascular wilt disease in tomato',
    titleHi: 'टमाटर में वाहिका-शोष रोग',
    whyEn:
      'In tomato, wilting that lasts through the morning and spreads plant by plant, often with yellowing on one side of the stem, is a vascular wilt disease pattern. It lives in the soil, so a change in watering does not remove it.',
    whyHi:
      'टमाटर में सुबह तक रहने वाला मुरझाना जो पौधे-दर-पौधा बढ़ता है, और अक्सर तने के एक तरफ पीलापन, यह वाहिका-शोष रोग का चित्र है। यह मिट्टी में रहता है, इसलिए पानी बदलने से यह नहीं जाता।',
    checkEn:
      'Cut the stem of one wilting plant lengthwise and look for brown discoloration inside. Note whether the wilting starts in the hottest part of the day.',
    checkHi:
      'एक मुरझाये पौधे का तना चीरकर अंदर भूरा रंग देखें। देखें कि मुरझाना दिन के सबसे गर्म समय में शुरू होती है या नहीं।',
    stepEn:
      'Remove the affected plant with its roots, do not compost it and do not move that soil to another plot. Ask your KVK about the locally recommended rotation and varieties.',
    stepHi:
      'प्रभावित पौधे को जड़ सहित हटाएं, कम्पोस्ट में न डालें और वह मिट्टी दूसरे खेत में न ले जाएं। KVK से स्थानीय फसल-चक्र व किस्मों की सलाह लें।',
    sources: CAUSE_SOURCES,
  },
  {
    id: 'tomato-fruit-borer',
    crops: ['tomato'],
    symptoms: ['pests', 'spots', 'rotting'],
    titleEn: 'Fruit borer in tomato',
    titleHi: 'टमाटर में फल छेदने वाला कीट',
    whyEn:
      'In tomato, a round bore hole in the fruit, or a fruit that rots starting from that hole, is the sign of a fruit borer. Damage on the shaded, inner side of the plant is typical for this pest.',
    whyHi:
      'टमाटर में फल पर गोल छेद, या उसी छेद से सड़ता फल, फल छेदने वाले कीट का संकेत है। पौधे के छायादार अंदर वाले हिस्से में नुकसान इसी कीट के लिए आम है।',
    checkEn:
      'Inspect the fruits, including the ones touching the soil, and look for a bore hole with feeding damage inside the fruit.',
    checkHi:
      'फलों को देखें, ज़मीन को छूने वाले फल भी, और फल के अंदर खाए गए छेद के साथ बाहरी छेद ढूँढें।',
    stepEn:
      'Collect and destroy the affected fruit and ask your KVK for the locally recommended management, including any trap or spray schedule. Do not apply a pesticide on the strength of this chat.',
    stepHi:
      'प्रभावित फल इकट्ठा करके नष्ट करें और KVK से स्थानीय प्रबंधन (ट्रैप/स्प्रे समय-सारणी सहित) पूछें। इस चैट के आधार पर कीटनाशक न डालें।',
    sources: CAUSE_SOURCES,
  },
  {
    id: 'tomato-leaf-curl-virus',
    crops: ['tomato'],
    symptoms: ['stunted', 'yellowing'],
    titleEn: 'Leaf curl virus in tomato',
    titleHi: 'टमाटर में लीफ-कर्ल वायरस',
    whyEn:
      'In tomato, upward curling of the new leaves together with stunting is often a leaf curl virus, spread by whitefly and by infected seedlings. Nothing sprayed in the field cures a virus.',
    whyHi:
      'टमाटर में नए पत्तों का ऊपर की ओर मुड़ना और बढ़वार का रुकना अक्सर लीफ-कर्ल वायरस है, जो सफ़ेद मक्खी और संक्रमित पौध से फैलता है। खेत में किसी भी छिड़काव से वायरस ठीक नहीं होता।',
    checkEn:
      'Look at the newest leaves for upward curling and check under the leaves for whitefly, which are small white insects that fly up when disturbed.',
    checkHi:
      'सबसे नए पत्ते ऊपर की ओर मुड़े हैं या नहीं देखें और पत्तों के नीचे सफ़ेद मक्खी जाँचें - छेटे सफ़ेद कीट जो छूने पर उड़ जाते हैं।',
    stepEn:
      'Rogue out the affected plants early, raise the seedlings yourself or use clean nursery material, and confirm with your KVK about the local vector and varieties.',
    stepHi:
      'प्रभावित पौधे जल्दी उखाड़ें, पौध स्वयं तैयार करें या साफ़ नर्सरी सामग्री लें, और KVK से स्थानीय वाहक व किस्मों की पुष्टि करें।',
    sources: CAUSE_SOURCES,
  },
]

/** Human readable labels for the recorded answers. */
export const SYMPTOM_LABELS: Record<DiagnosticSymptom, { en: string; hi: string }> = {
  yellowing: { en: 'yellowing leaves', hi: 'पीले पत्ते' },
  wilting: { en: 'wilting', hi: 'मुरझाना' },
  stunted: { en: 'no or slow growth', hi: 'बढ़वार न होना या धीमी बढ़वार' },
  spots: { en: 'spots on the leaves', hi: 'पत्तों पर धब्बे' },
  pests: { en: 'insects or worms', hi: 'कीट या सुंडी' },
  rotting: { en: 'rotting', hi: 'सड़न' },
  unclear: { en: 'an unclear symptom', hi: 'अस्पष्ट लक्षण' },
}

export const WATER_LABELS: Record<DiagnosticWater, { en: string; hi: string }> = {
  dry: { en: 'the soil is running dry', hi: 'मिट्टी सूख रही है' },
  normal: { en: 'watering is on a normal schedule', hi: 'सिंचाई सामान्य है' },
  over: { en: 'it is getting more water than usual', hi: 'सामान्य से ज़्यादा पानी मिल रहा है' },
  waterlogged: { en: 'water is standing in the field', hi: 'खेत में पानी खड़ा है' },
  none: { en: 'there is no irrigation, only rain', hi: 'सिंचाई नहीं है, सिर्फ़ बारिश' },
  unclear: { en: 'the watering is not clear', hi: 'पानी की स्थिति स्पष्ट नहीं है' },
}

export const CONDITION_LABELS: Record<DiagnosticConditions, { en: string; hi: string }> = {
  rain: { en: 'it rained heavily recently', hi: 'हाल में तेज़ बारिश हुई' },
  heat: { en: 'there was a hot spell', hi: 'तेज़ गर्मी रही' },
  cold: { en: 'there were cold nights or frost', hi: 'ठंडी रातें या पाला पड़ा' },
  calm: { en: 'nothing unusual happened', hi: 'कोई ख़ास बात नहीं हुई' },
  unclear: { en: 'recent conditions are not clear', hi: 'हाल की परिस्थितियाँ स्पष्ट नहीं हैं' },
}

export const AGE_LABELS: Record<DiagnosticAge, { en: string; hi: string }> = {
  'just-sown': { en: 'the plants were just sown', hi: 'पौधे अभी बुवाई गए हैं' },
  young: { en: 'the plants are a few weeks old', hi: 'पौधे कुछ सप्ताह के हैं' },
  growing: { en: 'the plants are a few months old', hi: 'पौधे कुछ महीने के हैं' },
  mature: { en: 'the plants are older and are flowering or fruiting', hi: 'पौधे पुराने हैं और फूल/फल आ रहे हैं' },
  unclear: { en: 'the plant age is not clear', hi: 'पौधे की उम्र स्पष्ट नहीं है' },
}
