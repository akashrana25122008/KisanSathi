import { AGRIWELFARE, ICAR, IMD, MIDH, TNAU, general } from './sources'
import { defineEntry, type KnowledgeEntry } from './types'

/**
 * ---------------------------------------------------------------------------
 * Irrigation, drainage, water conservation and weather-related precautions
 * ---------------------------------------------------------------------------
 * Weather *precautions* are general and safe. Actual forecasts are not - those
 * live in the live-data entry, which points at IMD instead of inventing one.
 */

export const WATER_ENTRIES: KnowledgeEntry[] = [
  defineEntry({
    id: 'k-irrigation-timing',
    category: 'water',
    keywords: [
      'when to water',
      'when to irrigate',
      'irrigation schedule',
      'how often to irrigate',
      'how often to water',
      'water requirement',
      'how much water',
      'irrigation interval',
      'कब पानी दें',
      'कब सिंचाई करें',
      'सिंचाई का समय',
      'पानी कितना',
      'कितनी बार पानी',
      'सिंचाई कैलेंडर',
      'paani kab dena',
    ],
    question: 'When and how much to irrigate',
    questionHi: 'कब और कितना पानी दें',
    content: {
      direct: {
        en: 'Irrigate when the crop needs it, not on a fixed day: check soil moisture at root depth, then water at the critical stages of the crop - these are usually establishment, tillering/branching, flowering and fruit or grain filling. The interval and the depth per irrigation depend on soil type, variety and rainfall, so use your local KVK schedule as the base and adjust it with what you find in the field.',
        hi: 'सिंचाई तब करें जब फसल को ज़रूरत हो, तय दिन के हिसाब से नहीं: जड़ की गहराई पर मिट्टी की नमी देखें, फिर फसल की मुख्य अवस्थाओं - स्थापना, कल्ले/शाखाएँ, फूल आना और दाना/फल भरना - में पानी दें। सिंचाई का अंतराल और हर बार की गहराई मिट्टी, किस्म और बारिश पर निर्भर है, इसलिए अपने KVK का कैलेंडर आधार बनाएं और खेत में देखकर उसमें बदलाव करें।',
      },
      steps: {
        en: [
          'Dig a small hole 10-15 cm deep near the root zone and feel the soil; check a second spot before you decide.',
          'Compare with your local KVK schedule for the crop stage, then adjust for actual rainfall.',
          'Water the whole field evenly in one go rather than in parts, so the root zone develops evenly.',
          'Prefer early morning irrigation - less evaporation, and the crop is not stressed at midday.',
          'Note the date and depth of each irrigation; after two seasons this becomes your own working schedule.',
        ],
        hi: [
          'जड़ के पास 10-15 सेमी गहरा छोटा गड्ढा खोदकर मिट्टी छुएं; तय करने से पहले दूसरी जगह भी देखें।',
          'अपने KVK के कैलेंडर से फसल की अवस्था के अनुसार तुलना करें, फिर असली बारिश के हिसाब से समायोजित करें।',
          'खेत के हिस्सों में अलग-अलग नहीं, पूरा खेत एक साथ समान पानी पाए - इससे जड़ें एक जैसी फैलती हैं।',
          'सुबह जल्दी सिंचाई करना बेहतर है - भाप कम लगती है और दोपहर में फसल तनाव में नहीं होती।',
          'हर सिंचाई की तारीख और गहराई लिखें; दो सीजन बाद यही आपका अपना काम करने वाला कैलेंडर बन जाता है।',
        ],
      },
      precautions: {
        en: [
          'Do not irrigate a field that has already received rain in the last 2-3 days without checking.',
          'Do not let water stand around the stem base; it invites disease and weakens the roots.',
        ],
        hi: [
          'पिछले 2-3 दिन में बारिश हुई हो तो जांचे बिना सिंचाई न करें।',
          'तने के आधार में पानी खड़ा न होने दें; इससे रोग होते हैं और जड़ें कमज़ोर होती हैं।',
        ],
      },
      consult: {
        en: 'Your KVK or state agriculture university publishes the irrigation schedule and critical stages for each crop in your district - use it as the reference and adjust with your own field notes.',
        hi: 'आपका KVK या राज्य कृषि विश्वविद्यालय हर फसल के लिए सिंचाई कैलेंडर और मुख्य अवस्थाएँ जिले के अनुसार प्रकाशित करता है - इसे आधार बनाएं और अपने खेत के नोट्स से समायोजित करें।',
      },
    },
    sources: [ICAR, AGRIWELFARE, general('Field moisture check - confirm with your KVK')],
    needsContext: true,
    contextHints: ['Crop and growth stage', 'Soil type', 'Water source', 'Last rainfall'],
  }),

  defineEntry({
    id: 'k-drainage',
    category: 'water',
    keywords: [
      'drainage',
      'drain excess water',
      'drain the field',
      'waterlogging',
      'water logged',
      'standing water',
      'field drainage',
      'water stagnation',
      'जल निकासी',
      'पानी जमा',
      'जलभराव',
      'पानी रुक गया',
      'निकासी',
      'drainage kaise',
    ],
    question: 'Drainage and waterlogging',
    questionHi: 'जल निकासी और पानी जमने की समस्या',
    content: {
      direct: {
        en: 'Drainage is how excess water leaves a field. Where it fails, roots suffocate, soil turns sour, nutrients are lost and seedlings rot - and it usually shows up as yellowing and stunted plants after a heavy spell of rain. Fix it at three levels: open and repair field drains and outlets, raise the seedbed/ridges so plants sit above the water table, and add organic matter and gypsum only where a test shows it is needed.',
        hi: 'निकासी यानी खेत से ज़्यादा पानी कैसे निकलता है। जहाँ यह काम नहीं करती, जड़ें साँस नहीं ले पातीं, मिट्टी खट्टी हो जाती है, पोषक तत्व बह जाते हैं और अंकुर सड़ जाते हैं - और तेज़ बारिश के बाद यह पीले पौधे और बीचबीच रुकावट के रूप में दिखता है। तीन स्तर पर ठीक करें: खेत की नालियाँ और निकास मुंह खोलें-ठीक करें, क्यारी/मेड़ ऊँची बनाएं ताकि पौधे पानी की सतह से ऊपर रहें, और जैविक पदाहार तथा जिप्सम वहीं डालें जहाँ जांच ज़रूरत बताए।',
      },
      steps: {
        en: [
          'After rain, walk the field and note where water stands and for how long.',
          'Clear the outlet first - a blocked outlet makes every other drain useless.',
          'Keep field drains shallow and clear of weeds and silt; do not let crop residue fill them.',
          'Open small holes in the bund at the low end of each row so excess water can escape slowly.',
          'On heavy soil, raise the seedbed or plant on ridges so the root zone stays above standing water.',
          'Add compost or farmyard manure each season and consider a cover crop between seasons to keep the soil open.',
        ],
        hi: [
          'बारिश के बाद खेत में चलकर देखें कि पानी कहाँ खड़ा रहता है और कितन देर।',
          'पहले निकास मुंह साफ़ करें - बंद मुंह से बाकी नालियां बेकार हो जाती हैं।',
          'खेत की नालियां उथली रखें और खरपतवार-गाद से साफ़ करें; फसल अवशेष से नाली न भरें।',
          'हर कतार के निचले सिरे पर मेड़ में छोटे छेद रखें ताकि ज़्यादा पानी धीरे-धीरे निकल सके।',
          'भारी मिट्टी में क्यारी ऊँची बनाएं या मेड़ पर बुवाई करें ताकि जड़ की जगह पानी के ऊपर रहे।',
          'हर सीजन कम्पोस्ट या गोबर की खाद डालें और सीजन के बीच में एक आवरण फसल लें ताकि मिट्टी खुली रहे।',
        ],
      },
      precautions: {
        en: [
          'Do not dig deep drains that let the groundwater table rise into the root zone.',
          'Do not open a bund to drain one field onto a neighbour\'s field without checking where the water goes.',
        ],
        hi: [
          'बहुत गहरी नालियां न खोदें, वरना भूजल सतर जड़ की जगह तक ऊपर आ जाता है।',
          'पड़ोसी के खेत में पानी भेजने वाला मेड़ का छेद बिना देखे न खोलें कि पानी जाएगा कहाँ।',
        ],
      },
      consult: {
        en: 'Your KVK or the state agriculture engineering department can advise on drainage layout for your soil and field size, and on whether your area needs a surface, subsurface or vertical drainage system.',
        hi: 'आपका KVK या राज्य कृषि अभियंत्रण विभाग आपकी मिट्टी और खेत के आकार के अनुसार जल निकासी की योजना बता सकेगा, और यह भी कि आपके क्षेत्र में सतही, अवस्तरीय या ऊर्ध्वाधर निकासी चाहिए या नहीं।',
      },
    },
    sources: [ICAR, TNAU, general('Drainage practice - confirm with your KVK')],
    needsContext: true,
    contextHints: ['Soil type', 'Field size and slope', 'How long does water stay?'],
  }),

  defineEntry({
    id: 'k-water-conservation',
    category: 'water',
    keywords: [
      'water conservation',
      'save water',
      'drip irrigation',
      'sprinkler',
      'mulching',
      'mulch',
      'mulch kaise',
      'drip irrigation',
      'water saving',
      'paani kaise bachayein',
      'paani bachana',
      'paani bacha',
      'pani kaise bachaye',
      'जल संरक्षण',
      'पानी बचाना',
      'ड्रिप',
      'स्प्रिंकलर',
      'मल्च',
      'पानी की बचत',
    ],
    question: 'Saving water in the field',
    questionHi: 'खेत में पानी की बचत कैसे करें',
    content: {
      direct: {
        en: 'Water is saved in three places: stop it leaking out of the channel, stop it evaporating from the soil, and deliver it to the root instead of the whole field. Bunds and channel repair stop losses; organic mulch or a residue cover cools the soil and cuts evaporation; drip or sprinkler delivers water at the root and uses less water than flood irrigation. A simple soil-moisture check between irrigations also saves water, because you stop irrigating before the crop needs it.',
        hi: 'पानी तीन जगह बचता है: नहर से रिसाव रोककर, मिट्टी से वाष्पीकरण रोककर, और पूरे खेत में देने के बजाय जड़ तक पहुँचाकर। मेड़ और नहर की मरम्मत रिसाव रोकती है; जैविक मल्च या पराली की परत मिट्टी ठंडी रखकर वाष्पीकरण घटाती है; ड्रिप या स्प्रिंकलर जड़ तक पानी पहुँचाते हैं और बाढ़ सिंचाई से कम पानी लगते हैं। सिंचाई के बीच मिट्टी की नमी देखना भी पानी बचाता है, क्योंकि ज़रूरत से पहले सिंचाई रोक दी जाती है।',
      },
      steps: {
        en: [
          'Repair bunds and channels before the season, and keep the channel bottom slightly sloped so water flows to the far end.',
          'Use a mulch of crop residue, straw or compost between rows after the crop has established; keep it away from the stem.',
          'Where you can afford it, drip or sprinkler delivers water at the root zone - check the system for leaks and clogging each season.',
          'Do a simple soil moisture check 2-3 days after irrigation instead of watering on a fixed day.',
          'Store rainwater in farm ponds or channels during the monsoon for later dry-season use.',
        ],
        hi: [
          'सीजन से पहले मेड़ और नहर ठीक करें, और नहर के तले को हल्का ढालू रखें ताकि पानी दूसरे सिरे तक बहे।',
          'फसल जमने के बाद कतारों के बीच फसल अवशेष, पुआल या कम्पोस्ट की मल्च लगाएं; तने से दूर रखें।',
          'जहाँ संभव हो, ड्रिप या स्प्रिंकलर जड़ की जगह पानी पहुँचाते हैं - हर सीजन लीक और जमाव जांचें।',
          'तय दिन के बजाय सिंचाई के 2-3 दिन बाद मिट्टी की नमी जांचें।',
          'मानसून में वर्षा जल को खेत तालाब या नहर में जमाकर सूखे मौसम में उपयोग करें।',
        ],
      },
      precautions: {
        en: [
          'Do not mulch before the crop has established, especially in cold or wet soil - it keeps the soil cold and can encourage disease.',
          'Do not put mulch right against the stem; leave a small gap so the stem does not rot.',
        ],
        hi: [
          'फसल जमने से पहले मल्च न लगाएं, खासकर ठंडी या गीली मिट्टी में - इससे मिट्टी ठंडी रहती है और रोग बढ़ सकते हैं।',
          'मल्च को तने से चिपका कर न रखें; थोड़ी जगह छोड़ें ताकि तना न सड़े।',
        ],
      },
      consult: {
        en: 'Your KVK, the state horticulture mission or the local agriculture engineering office can tell you whether drip or sprinkler suits your crop, soil and water source, and about any support available under MIDH or state horticulture schemes.',
        hi: 'आपका KVK, राज्य बागवानी मिशन या स्थानीय कृषि अभियंत्रण कार्यालय बता सकेगा कि आपकी फसल, मिट्टी और पानी के स्रोत के लिए ड्रिप उपयुक्त है या स्प्रिंकलर, और MIDH या राज्य बागवानी योजनाओं में क्या सहायता मिल सकती है।',
      },
    },
    sources: [ICAR, MIDH, TNAU, general('Field water saving - confirm with your KVK')],
    needsContext: true,
    contextHints: ['Crop', 'Water source and availability', 'Field size', 'Can you afford a drip system?'],
  }),

  defineEntry({
    id: 'k-weather-precautions',
    category: 'water',
    keywords: [
      'heavy rain precaution',
      'rain damage',
      'heat wave precaution',
      'frost',
      'cold wave',
      'hailstorm',
      'drought precaution',
      'before the rain',
      'बारिश से पहले',
      'तेज़ बारिश',
      'गर्मी से बचाव',
      'पाला',
      'ओलावृष्टि',
      'सूखा',
      'weather precaution',
      'barish se pehle',
    ],
    question: 'Precautions around unusual weather',
    questionHi: 'बदलते मौसम से बचाव की तैयारी',
    content: {
      direct: {
        en: 'General precautions that hold for most crops: before heavy rain, open the field drains and check the bunds, and do not apply fertiliser or spray right before rain. After heavy rain, wait a day or two before entering wet soil, and look for lodged plants, waterlogging and disease. In heat, irrigate early morning or late evening and shade nurseries. For frost, irrigate in the evening ahead of a frosty night and cover small plants. Check the IMD forecast for your district before you act.',
        hi: 'ज़्यादातर फसलों के लिए सामान्य सावधानियां: तेज़ बारिश से पहले खेत की नालियां खोलें और मेड़ जांचें, और बारिश से ठीक पहले खाद या छिड़काव न करें। तेज़ बारिश के बाद गीली मिट्टी में एक-दो दिन बाद ही खेत में जाएं, और गिरे हुए पौधे, जलभराव और रोग देखें। गर्मी में सुबह जल्दी या शाम को सिंचाई करें और नर्सरी को छाया दें। पाले के लिए ठंडी रात से पहले शाम को सिंचाई करें और छोटे पौधों को ढकें। कार्रवाई से पहले IMD का अपने जिले का पूर्वानुमान देखें।',
      },
      steps: {
        en: [
          'Keep the field drains open and the outlet clear before the monsoon starts.',
          'Stop spraying and applying inputs when rain is expected within a few hours - both are wasted and can run off.',
          'After a heavy spell, walk the field and mark lodged, waterlogged and affected areas separately.',
          'In heat, irrigate early morning or late evening and give nurseries temporary shade.',
          'Before a frosty night, irrigate lightly in the evening (moist soil holds heat) and cover young plants.',
          'After hail or storm, remove broken and dead leaves quickly so the crop can recover.',
        ],
        hi: [
          'मानसून शुरू होने से पहले खेत की नालियां खुली रखें और निकास मुंह साफ़ रखें।',
          'कुछ घंटों में बारिश की संभावना हो तो छिड़काव और खाद रोक दें - दोनों बर्बाद होते हैं और बह सकते हैं।',
          'तेज़ बारिश के बाद खेत में चलकर गिरे हुए, जलभराव वाले और प्रभावित हिस्सों को अलग-अलग चिह्नित करें।',
          'गर्मी में सुबह जल्दी या शाम को सिंचाई करें और नर्सरी को अस्थायी छाया दें।',
          'ठंडी रात से पहले शाम को हल्की सिंचाई करें (नम मिट्टी गर्मी रोकती है) और छोटे पौधों को ढकें।',
          'ओलावृष्टि या तूफान के बाद टूटे और सूखे पत्ते जल्दी हटाएं ताकि फसल सुधर सके।',
        ],
      },
      precautions: {
        en: [
          'Do not spray in wind or just before rain - the spray drifts or washes off and pollutes water bodies.',
          'Do not enter a wet field after heavy rain; the soil is easily damaged and you can get stuck.',
        ],
        hi: [
          'हवा चल रही हो या बारिश से ठीक पहले छिड़काव न करें - छिड़काव बह जाता है या धुल जाता है और जल स्रोत दूषित होता है।',
          'तेज़ बारिश के बाद गीले खेत में न जाएं; मिट्टी आसानी से खराब होती है और आप फंस सकते हैं।',
        ],
      },
      consult: {
        en: 'For the actual forecast and warnings for your district, use the IMD Mausam portal. For crop-specific actions during a specific weather event, your KVK publishes district advisories that account for the crop and its stage.',
        hi: 'अपने जिले का वास्तविक पूर्वानुमान और चेतावनी के लिए IMD Mausam पोर्टल देखें। किसी खास मौसम के दौरान फसल-विशेष कार्रवाई के लिए आपका KVK जिला-सलाह जारी करता है जो फसल और उसकी अवस्था को ध्यान में रखता है।',
      },
    },
    sources: [IMD, ICAR, TNAU, general('Weather preparedness - check the local advisory')],
    needsContext: true,
    contextHints: ['Crop and stage', 'Location/district', 'What weather is expected?'],
  }),
]
