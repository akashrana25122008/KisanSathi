import { AGRIWELFARE, ICAR, TNAU, general } from './sources'
import { defineEntry, type KnowledgeEntry } from './types'

/**
 * ---------------------------------------------------------------------------
 * Core entries
 * ---------------------------------------------------------------------------
 * These are the six broad, always-useful topics. They are the safety net: if
 * a farmer asks something broad ("how do I plan my farming?") they get a
 * sensible overview instead of the unknown fallback. More specific entries
 * live in the topic files next to this one.
 */

export const CORE_ENTRIES: KnowledgeEntry[] = [
  defineEntry({
    id: 'crop-basics-planning',
    category: 'crop-planning',
    keywords: [
      'crop planning',
      'crop rotation',
      'which crop',
      'what crop',
      'कौन सी फसल',
      'फसल चक्र',
      'fasal chakr',
      'farming plan',
      'खेती की योजना',
    ],
    tags: ['crop-planning', 'seasonal'],
    question: 'Crop planning basics and rotation',
    questionHi: 'फसल योजना और फसल चक्र की बुनियादी बातें',
    content: {
      direct: {
        en: 'Crop planning starts with season (Rabi/Kharif/Zaid), local climate, soil type, water availability, and market demand. Crop rotation (for example, legumes after cereals) helps break pest cycles and improves soil fertility. Keep it simple: grow what suits your water source and has reliable local demand.',
        hi: 'फसल योजना मौसम (रबी/खरीफ/ज़ायद), स्थानीय जलवायु, मिट्टी, पानी की उपलब्धता और बाज़ार से शुरू होती है। फसल चक्र (जैसे अनाज के बाद दलहन) कीट-चक्र तोड़ता है और मिट्टी को बेहतर बनाता है। सरल रखें: जो फसल आपके पानी और स्थानीय मांग के अनुकूल हो, वही उगाएं।',
      },
      steps: {
        en: [
          'Fix the season first: Rabi (roughly Oct-Mar), Kharif (roughly Jun-Oct) or Zaid (roughly Mar-Jun). The local monsoon decides most of it.',
          'Match the crop to your water source. A rainfed field and a canal or borewell field support very different crops.',
          'Read your Soil Health Card before you choose, so you plan around what your soil already has.',
          'Check that there are buyers and workers near you for that crop before you commit.',
          'Start with a small area, write down what you spent and what you got, and adjust next season.',
        ],
        hi: [
          'पहले मौसम तय करें: रबी (लगभग अक्टूबर-मार्च), खरीफ (लगभग जून-अक्टूबर) या ज़ायद (लगभग मार्च-जून)। ज़्यादातर हिस्सा स्थानीय मानसून तय करता है।',
          'फसल को अपने पानी के स्रोत के अनुसार चुनें। वर्षा आधारित खेत और नहर/बोरवेल वाला खेत अलग-अलग फसलें उगाते हैं।',
          'चुनने से पहले अपनी मृदा स्वास्थ्य कार्ड पढ़ें, ताकि योजना मिट्टी की मौजूदा स्थिति के अनुसार बने।',
          'फसल तय करने से पहले देख लें कि पास में खरीदार और मजदूर मिलते हैं या नहीं।',
          'छोटे क्षेत्र से शुरू करें, खर्च और आमदनी लिखकर रखें, और अगले सीजन में सुधार करें।',
        ],
      },
      precautions: {
        en: [
          'Do not plan on remembered prices or remembered rainfall - both change every year.',
          'Do not copy a neighbour\'s package of practices without checking your own soil and water.',
        ],
        hi: [
          'याद किए हुए भाव या याद किए हुए बारिश के हिसाब से योजना न बनाएं - दोनों हर साल बदलते हैं।',
          'अपनी मिट्टी और पानी की जांच किए बिना पड़ोसी की तकनीक न अपनाएं।',
        ],
      },
      consult: {
        en: 'Ask your nearest Krishi Vigyan Kendra (KVK) or state agriculture university for the varieties and sowing window recommended in your district, and use ICAR for general crop guidance.',
        hi: 'अपने जिले में अनुशंसित किस्मों और बुवाई के समय के लिए नजदीकी कृषि विज्ञान केंद्र (KVK) या राज्य कृषि विश्वविद्यालय से पूछें, और सामान्य जानकारी के लिए ICAR देखें।',
      },
    },
    sources: [ICAR, AGRIWELFARE, general('Local crop calendar - confirm with your district KVK')],
    needsContext: true,
    contextHints: ['Location/district', 'Season', 'Irrigation (rainfed/canal/well)', 'Soil type if known'],
  }),

  defineEntry({
    id: 'irrigation-basics',
    category: 'water',
    keywords: [
      'irrigation',
      'irrigate',
      'irrigating',
      'water',
      'सिंचाई',
      'पानी',
      'drip',
      'flood',
    ],
    tags: ['irrigation', 'water-management'],
    question: 'Irrigation basics',
    questionHi: 'सिंचाई की बुनियादी जानकारी',
    content: {
      direct: {
        en: 'Match irrigation to crop stage: more water is often needed at critical stages (tillering/flowering/fruit set) and less at maturity. Methods: flood (common), furrow, sprinkler, drip (water efficient). Avoid over-irrigation, which causes waterlogging and disease. Check field moisture by feel before watering.',
        hi: 'सिंचाई फसल की अवस्था के हिसाब से करें - आमतौर पर बढ़वार, फूल/फल लगने पर ज़रूरत ज़्यादा होती है और पकने पर कम। तरीके: बाढ़ (आम), कूँव (furrow), स्प्रिंकलर, ड्रिप (पानी की बचत)। ज़्यादा पानी से जलभराव और रोग होते हैं। पानी देने से पहले मिट्टी की नमी हाथ से जांचें।',
      },
      steps: {
        en: [
          'Walk the field and press a finger 5-10 cm into the soil near the root zone. If it crumbles and feels dry, the crop needs water; if it sticks and is cool, wait.',
          'Irrigate the field evenly rather than one corner, so roots spread instead of chasing water.',
          'Repair small leaks in channels and bunds - a broken bund can waste a whole irrigation.',
          'Plan each irrigation around the crop stage, not around a fixed weekly habit.',
          'Keep a simple note of date, duration and depth used for each irrigation.',
        ],
        hi: [
          'खेत में चलकर जड़ के पास मिट्टी में 5-10 सेमी ऊंगली डालें। वह सूखी और भुरभुरी लगे तो पानी दें; चिपचिपी और ठंडी हो तो रुकें।',
          'खेत में पानी एक साथ बांटकर दें, एक कोने में नहीं, ताकि जड़ें पानी के पीछे भागें नहीं।',
          'नहर और मेड़ की छोटी दरारें ठीक करें - टूटी मेड़ से पूरी सिंचाई बर्बाद हो सकती है।',
          'हर सिंचाई तय समय के बजाय फसल की अवस्था के हिसाब से तय करें।',
          'हर सिंचाई की तारीख, देर और पानी की गहराई की सादी नोटबुक रखें।',
        ],
      },
      precautions: {
        en: [
          'Waterlogging kills roots faster than drought - if water stands for more than a day, open a drain.',
          'Do not irrigate in the middle of a very hot afternoon; irrigate early morning or late evening.',
        ],
        hi: [
          'पानी जमने से जड़ें सूखे से ज़्यादा तेज़ी से खराब होती हैं - अगर पानी एक दिन से ज़्यादा खेत में रहे तो निकासी खोलें।',
          'बहुत गर्म दोपहर में सिंचाई न करें; सुबह जल्दी या शाम को करें।',
        ],
      },
      consult: {
        en: 'Ask your KVK or agriculture officer for the irrigation schedule and critical stages of your crop - they change with soil type, variety and rainfall.',
        hi: 'अपने KVK या कृषि अधिकारी से अपनी फसल का सिंचाई कैलेंडर और मुख्य अवस्थाएँ पूछें - ये मिट्टी, किस्म और बारिश के अनुसार बदलती हैं।',
      },
    },
    sources: [ICAR, AGRIWELFARE, general('Pragmatic field guidance (local checks)')],
    needsContext: true,
    contextHints: ['Crop and growth stage', 'Water source', 'Soil type'],
  }),

  defineEntry({
    id: 'pest-disease-general',
    category: 'pest-disease',
    keywords: ['pest', 'pesticide', 'disease', 'कीट', 'रोग', 'insect', 'fungus', 'blight'],
    tags: ['pest-disease', 'crop-care'],
    question: 'General approach to pests and diseases',
    questionHi: 'कीट और रोगों से सामान्य बचाव',
    content: {
      direct: {
        en: 'Use IPM basics: scout regularly (walk the field), identify the pest or disease, remove affected parts where it is safe and practical, encourage beneficial insects, use resistant varieties when available, and follow local advisories. Never guess pesticide names or doses here - consult your KVK or extension officer for safe, location-specific advice.',
        hi: 'IPM के मूल सिद्धांत अपनाएं: नियमित निगरानी करें (खेत में चक्कर लगाएं), कीट या रोग पहचानें, सुरक्षित हो तो प्रभावित हिस्से हटाएं, लाभदायक कीटों को बचाएं, उपलब्ध हो तो रोग-रोधी किस्में उगाएं, और स्थानीय सलाह मानें। कीटनाशक का नाम या मात्रा यहाँ नहीं बताई जाती - इसके लिए अपने KVK/विस्तार अधिकारी से सलाह लें।',
      },
      steps: {
        en: [
          'Walk the field in a fixed pattern (for example, one diagonal and four sides) so you cover the same ground every week.',
          'Look under leaves and at the base of the plant, not only at the top - many problems start low.',
          'Record what you see: which crop, how many plants are affected, where on the plant, and how fast it is spreading.',
          'Remove and destroy badly affected material so the problem does not carry to the next crop.',
          'Before doing anything else, check whether beneficial insects, birds or a natural outbreak is already handling it.',
        ],
        hi: [
          'हर हफ्ते खेत को एक तय तरीके से देखें (जैसे एक डायगनल और चार किनारे) ताकि पूरा खेत एक जैसा कवर हो।',
          'सिर्फ ऊपर नहीं, पत्तों के नीचे और तने के आधार पर भी देखें - कई समस्याएं वहीं से शुरू होती हैं।',
          'जो दिखा उसकी नोटबुक बनाएं: कौन सी फसल, कितने पौधे प्रभावित, पौधे के किस हिस्से पर, और कितनी तेज़ी से बढ़ रहा है।',
          'बहुत प्रभावित पौधों की चीज़ें हटाकर नष्ट करें ताकि समस्या अगली फसल तक न जाए।',
          'कुछ करने से पहले देख लें कि लाभदायक कीट, पक्षी या प्राकृतिक प्रकोप पहले ही समझाने में लगे हैं या नहीं।',
        ],
      },
      precautions: {
        en: [
          'Never spray on the basis of a guess. An unnecessary spray kills pollinators and natural enemies and costs money.',
          'Follow the label on any product exactly - dose, waiting period and protective gear - and never mix products unless the label says so.',
        ],
        hi: [
          'अंदाज़े से कभी छिड़काव न करें। बिना ज़रूरत के छिड़काव से परागण करने वाले और लाभदायक कीट मर जाते हैं और पैसा बर्बाद होता है।',
          'किसी भी उत्पाद का लेबल हमेशा हमेशा के अनुसार मानें - मात्रा, प्रतीक्षा अवधि और सुरक्षा उपकरण - और लेबल में न लिखा हो तो दो उत्पाद मिलाएं नहीं।',
        ],
      },
      consult: {
        en: 'Take a sample of the affected plant (leaves, stem and root, with the soil around it) to your KVK or agriculture office. They can identify the problem and tell you which locally approved option fits, including the correct dose for your crop.',
        hi: 'प्रभावित पौधे का नमूना (पत्ते, तना और जड़, साथ में आसपास की मिट्टी) अपने KVK या कृषि कार्यालय ले जाएं। वे समस्या पहचानकर बताएंगे कि आपकी फसल के लिए कौन सा स्थानीय रूप से अनुमोदित विकल्प और कितनी मात्रा सही है।',
      },
    },
    sources: [ICAR, TNAU, general('Pesticide safety - confirm with your KVK')],
    needsContext: true,
    contextHints: ['Crop', 'Symptoms (color/shape/location)', 'Stage of damage', 'Recent weather'],
  }),

  defineEntry({
    id: 'seasonal-activities',
    category: 'crop-planning',
    keywords: ['season calendar', 'rabi season', 'kharif season', 'zaid season', 'फसल चक्र कैलेंडर'],
    tags: ['seasonal', 'activities'],
    question: 'Seasonal farm activities overview',
    questionHi: 'मौसम के अनुसार खेत के काम',
    content: {
      direct: {
        en: 'Rabi (about Oct-Mar): sowing wheat, mustard, gram and onion, plus irrigation management and weed control. Kharif (about Jun-Oct): land preparation, sowing paddy, cotton and soybean, weeding, pest monitoring and drainage. Zaid (about Mar-Jun): short-duration crops where irrigation is available. Timing varies by region - follow the local KVK calendar for your district.',
        hi: 'रबी (लगभग अक्टूबर-मार्च): गेहूँ, सरसों, चना, प्याज की बुवाई, सिंचाई की व्यवस्था और निराई। खरीफ (लगभग जून-अक्टूबर): जुताई-बुवाई, धान, कपास, सोयाबीन, निराई, कीट निगरानी और जल निकासी। ज़ायद (लगभग मार्च-जून): जहाँ सिंचाई हो वहाँ अल्पकालीन फसलें। समय क्षेत्र के अनुसार अलग होता है - अपने जिले का KVK कैलेंडर देखें।',
      },
      steps: {
        en: [
          'Note the normal first and last sowing dates for each crop you grow, then write them on a wall calendar.',
          'Work backwards from harvest: work out when each operation (sowing, spraying, weeding) really needs to happen.',
          'Keep the busy weeks (transplanting, weeding, harvest) marked, because that is when you need workers.',
        ],
        hi: [
          'अपनी हर फसल की सामान्य पहली और आखिरी बुवाई तारीख लिखकर दीवार कैलेंडर पर डालें।',
          'कटाई से पीछे की ओर सोचें: हर काम (बुवाई, छिड़काव, निराई) असल में कब करना है, यह निकालें।',
          'व्यस्त हफ्ते (रोपाई, निराई, कटाई) निशानित रखें, क्योंकि उसी समय मजदूर चाहिए होते हैं।',
        ],
      },
      precautions: {
        en: [
          'These months are a rough national pattern. Your district can be two to four weeks earlier or later.',
          'Do not delay sowing only because a neighbour has already sown - check your own field moisture and the local advisory.',
        ],
        hi: [
          'ये महीने राष्ट्रीय स्तर का ढांचा है। आपका जिला दो-चार हफ्ते पहले या बाद में हो सकता है।',
          'सिर्फ इसलिए बुवाई न टालें कि पड़ोसी ने बो दी - अपने खेत की नमी और स्थानीय सलाह देखें।',
        ],
      },
      consult: {
        en: 'Get the crop calendar for your own district from your KVK or state agriculture department - they publish sowing and harvesting windows that fit local rainfall.',
        hi: 'अपने जिले का फसल कैलेंडर अपने KVK या राज्य कृषि विभाग से लें - वे स्थानीय बारिश के अनुसार बुवाई और कटाई का समय बताते हैं।',
      },
    },
    sources: [ICAR, TNAU, general('Local crop calendar - check with your district KVK')],
    needsContext: true,
    contextHints: ['District/location', 'Irrigation availability'],
  }),

  defineEntry({
    id: 'labour-planning',
    category: 'economics',
    keywords: ['labour', 'workers', 'mazdoor', 'मजदूर', 'crew', 'hiring', 'batai', 'कटाई मजदूर'],
    tags: ['labour', 'hiring'],
    question: 'Farm labour planning basics',
    questionHi: 'खेती में मजदूर योजना की बुनियादी बातें',
    content: {
      direct: {
        en: 'Plan labour by operations and peak days (transplanting, weeding, harvest). List the tasks, the workers needed, the duration, the location and the wage range for your area - rates vary a lot between villages and seasons. Post clear job details (activity, crop, date, village, wage). For hiring, be explicit about work hours and amenities and confirm before starting. Use KisanSathi Jobs to post and manage opportunities.',
        hi: 'मजदूरों की योजना काम और चरम दिनों (रोपाई, निराई, कटाई) के हिसाब से बनाएं। कार्य, संख्या, अवधि, स्थान और मजदूरी की सीमा लिखें - मजदूरी गाँव और मौसम के अनुसार बहुत बदलती है। नौकरी पोस्ट करते समय सारी जानकारी साफ़ लिखें (काम, फसल, तारीख, गाँव, मजदूरी)। काम शुरू करने से पहले घंटे और सुविधाओं पर सहमति कर लें। नौकरी पोस्ट और प्रबंधन के लिए किसानसाथी जॉब्स का उपयोग करें।',
      },
      steps: {
        en: [
          'List every operation as a separate task, with the dates it needs workers.',
          'Count how many people you really need per task - start from the work, not from the number you had last year.',
          'Ask two or three local people what the going daily wage is this season before you post anything.',
          'Write the wage on the post itself; a clear wage attracts the right people and avoids arguments on day one.',
        ],
        hi: [
          'हर काम को अलग-अलग काम के रूप में लिखें, उस तारीखों के साथ जब मजदूर चाहिए।',
          'हर काम के लिए असल में कितने लोग चाहिए गिनें - गिनती पिछले साल वाली संख्या से नहीं, काम से करें।',
          'पोस्ट देने से पहले दो-तीन स्थानीय लोगों से इस मौसम की चलती दिहाड़ी पूछ लें।',
          'मजदूरी पोस्ट पर ही लिखें; साफ़ मजदूरी से सही लोग आते हैं और पहले दिन बहस नहीं होती।',
        ],
      },
      precautions: {
        en: [
          'Do not promise work you cannot guarantee - people travel long distances for a job that falls through.',
          'Agree the wage, hours and payment day in writing or in front of a witness before starting.',
        ],
        hi: [
          'ऐसा काम वादा न करें जो पूरा न हो पाए - लंबी दूरी से आए मजदूरों का समय और भरोसा दोनों जाते हैं।',
          'शुरू करने से पहले मजदूरी, घंटे और भुगतान का दिन लिखित या गवाह के सामने तय कर लें।',
        ],
      },
      consult: {
        en: 'Your local agriculture office or village panchayat can tell you the local wage range and whether there is a minimum wage notification for agricultural work in your state.',
        hi: 'आपका स्थानीय कृषि कार्यालय या ग्राम पंचायत आपको स्थानीय मजदूरी की सीमा और आपके राज्य में कृषि कार्य के लिए न्यूनतम मजदूरी आदेश है या नहीं, बता सकते हैं।',
      },
    },
    sources: [
      { title: 'KisanSathi Jobs (in-app)', url: '/jobs', kind: 'general' },
      general('Local wage range - check nearby listings'),
    ],
    needsContext: true,
    contextHints: ['Activity', 'Location', 'Date', 'Workers needed', 'Local wage range'],
  }),

  defineEntry({
    id: 'where-to-find-info',
    category: 'schemes-services',
    keywords: ['information', 'advisory', 'kvk', 'कृषि विज्ञान केंद्र', 'extension', 'help'],
    tags: ['information', 'advisory'],
    question: 'Where to find reliable agricultural information',
    questionHi: 'विश्वसनीय कृषि जानकारी कहां से पाएं',
    content: {
      direct: {
        en: 'Start with your nearest Krishi Vigyan Kendra (KVK) or agricultural extension office - they give location-specific advice for your district and crop. ICAR institutes and state agricultural universities are reliable for general and crop-specific guidance. For in-app practice, use KisanSathi Jobs for labour and this local assistant for general guidance. Always verify critical decisions locally.',
        hi: 'अपने नजदीकी कृषि विज्ञान केंद्र (KVK) या कृषि विस्तार कार्यालय से शुरू करें - वे आपके जिले और फसल के लिए स्थानीय सलाह देते हैं। ICAR संस्थान और राज्य कृषि विश्वविद्यालय सामान्य और फसल-विशेष जानकारी के लिए भरोसेमंद हैं। इस ऐप में मजदूरों के लिए किसानसाथी जॉब्स और सामान्य जानकारी के लिए यह सहायक उपयोग करें। महत्वपूर्ण फैसले हमेशा स्थानीय स्तर पर जांचें।',
      },
      steps: {
        en: [
          'Find the KVK that covers your district and note its phone number and visiting day.',
          'Keep a small notebook of what you asked and what you were told - the answer changes with season, so a dated record is useful.',
          'For a scheme or a price, use the official portal rather than a forwarded message.',
        ],
        hi: [
          'अपने जिले का KVK ढूंढकर उसका फ़ोन नंबर और दौरे का दिन नोट कर लें।',
          'जो पूछा और जो जवाब मिला उसकी छोटी नोटबुक रखें - मौसम के साथ जवाब बदलता है, इसलिए तारीख के साथ नोट उपयोगी है।',
          'योजना या भाव के लिए आगे भेजा गया संदेश नहीं, आधिकारिक पोर्टल देखें।',
        ],
      },
      precautions: {
        en: [
          'A forwarded screenshot is not an official record - verify names, dates and amounts on the government portal.',
          'No website can replace advice that depends on your soil, your water and your village.',
        ],
        hi: [
          'आगे भेजा गया स्क्रीनशॉट आधिकारिक रिकॉर्ड नहीं है - नाम, तारीख और राशि सरकारी पोर्टल पर जांचें।',
          'आपकी मिट्टी, पानी और गाँव पर निर्भर सलाह की जगह कोई वेबसाइट नहीं ले सकती।',
        ],
      },
      consult: {
        en: 'ICAR and the Department of Agriculture & Farmers Welfare publish general guidance and scheme information at the links below; your KVK turns that into advice for your field.',
        hi: 'नीचे दिए लिंक पर ICAR और कृषि एवं किसान कल्याण विभाग सामान्य जानकारी और योजना की जानकारी देते हैं; आपका KVK उसे आपके खेत की सलाह में बदलता है।',
      },
    },
    sources: [ICAR, AGRIWELFARE, general('Your district KVK / agriculture office - local advice')],
    needsContext: false,
  }),
]
