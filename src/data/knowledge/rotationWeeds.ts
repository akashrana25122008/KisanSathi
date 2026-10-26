import { AGRIWELFARE, ICAR, TNAU, general } from './sources'
import { defineEntry, type KnowledgeEntry } from './types'

/**
 * ---------------------------------------------------------------------------
 * Crop rotation, intercropping, weeds and crop-stage planning
 * ---------------------------------------------------------------------------
 */

export const ROTATION_WEED_ENTRIES: KnowledgeEntry[] = [
  defineEntry({
    id: 'k-crop-rotation',
    category: 'rotation-weeds',
    keywords: [
      'crop rotation',
      'rotate crop',
      'rotation benefit',
      'what to grow after',
      'next crop after',
      'फसल चक्र',
      'फसल चक्र क्या',
      'फसल बदलना',
      'अगली फसल',
      'rotate karke',
      'fasal chakr',
    ],
    question: 'Planning a crop rotation',
    questionHi: 'फसल चक्र की योजना कैसे बनाएं',
    content: {
      direct: {
        en: 'A crop rotation is a planned sequence of different crop families on the same field over seasons. It breaks the life cycle of soil-borne pests and weeds, spreads the nutrient demand (a cereal takes nitrogen, a legume adds it), and spreads the risk of one bad weather event or one failing market. A simple, workable rotation is cereal -> legume -> cereal, or vegetable -> cereal, keeping the sequence different every year rather than repeating the same crop on the same plot.',
        hi: 'फसल चक्र का मतलब है एक ही खेत में मौसमों के हिसाब से अलग-अलग फसलों की योजना से बदलते क्रम। इससे मिट्टी में पलने वाले कीट और खरपतवार का चक्र टूटता है, पोषक तत्वों की ज़रूरत बँटती है (अनाज नाइट्रोजन लेता है, दलहन उसे मिट्टी में देता है), और एक ही मौसम या एक ही बाज़ार के बिगड़ने का जोखिम बँट जाता है। एक साधारण, व्यावहारिक चक्र है - अनाज -> दलहन -> अनाज, या सब्ज़ी -> अनाज; हर साल एक ही फसल दोहराने के बजाय क्रम बदलते रहें।',
      },
      steps: {
        en: [
          'List the fields you have and what was grown on each in the last two or three seasons.',
          'Group your crops by family: cereals (rice, wheat, maize, millets), pulses (gram, lentil, pea, beans), oilseeds (mustard, groundnut, soybean), vegetables and fodder.',
          'Keep a rule of thumb: do not grow the same family on the same plot two seasons running, and always put a legume or fodder crop after a heavy feeder.',
          'Plan the sequence for the whole year, not one season at a time, so the rotation actually rotates.',
          'Keep a simple three-year map of the farm so you know what each plot needs next.',
        ],
        hi: [
          'अपने खेत लिखें और बताएं कि पिछले दो-तीन मौसमों में किस-किस में क्या उगाया गया।',
          'फसलों को परिवार के अनुसार बांटें: अनाज (धान, गेहूँ, मक्का, बाजरा), दलहन (चना, मसूर, मटर, राजमा), तिलहन (सरसों, मूंगफली, सोयाबीन), सब्ज़ी और चारा।',
          'एक सामान्य नियम रखें: एक ही खेत में एक ही परिवार दो मौसम लगातार न उगाएं, और भारी पोषक तत्व लेने वाली फसल के बाद हमेशा दलहन या चारा रखें।',
          'पूरे साल की योजना बनाएं, एक सीजन की नहीं, ताकि चक्र सचमुच घूमता रहे।',
          'खेत का सादा तीन-साल का नक्शा रखें ताकि पता रहे कि अगली बार किस खेत में क्या चाहिए।',
        ],
      },
      precautions: {
        en: [
          'Do not rotate only between two crops and call it a rotation - a three to four crop sequence is much more effective.',
          'Do not ignore the water requirement: a dryland sequence and an irrigated sequence must be planned differently.',
        ],
        hi: [
          'सिर्फ दो फसलों के बीच बदलकर उसे फसल चक्र न कहें - तीन-चार फसलों का क्रम कहीं ज़्यादा असरदार है।',
          'पानी की ज़रूरत को नज़रअंदाज़ न करें - वर्षा आधारित और सिंचित दोनों का क्रम अलग बनता है।',
        ],
      },
      consult: {
        en: 'Ask your KVK or the state agriculture university for the recommended crop rotation for your soil type, irrigation source and market conditions - they publish district-level rotation plans that fit local rainfall and pest pressure.',
        hi: 'अपने KVK या राज्य कृषि विश्वविद्यालय से अपनी मिट्टी, सिंचाई और बाज़ार के अनुसार अनुशंसित फसल चक्र पूछें - वे जिला-स्तर की योजनाएँ बनाते हैं जो स्थानीय बारिश और कीट दबाव के अनुकूल होती हैं।',
      },
    },
    sources: [ICAR, AGRIWELFARE, general('Local rotation plan - confirm with your district KVK')],
    needsContext: true,
    contextHints: ['Location/district', 'Season', 'Soil type', 'Current crop and previous crop'],
  }),

  defineEntry({
    id: 'k-intercropping',
    category: 'rotation-weeds',
    keywords: [
      'intercropping',
      'intercrop',
      'mixed cropping',
      'companion crop',
      'multiple crop',
      'grow together',
      'अंतरफसल',
      'मिश्रित फसल',
      'साथ में उगाना',
      'एक साथ फसल',
      'intercropping kya hai',
    ],
    question: 'Growing more than one crop together',
    questionHi: 'एक साथ कई फसल उगाना (अंतरफसल)',
    content: {
      direct: {
        en: 'Intercropping grows two or more crops together on the same land at the same time. The aim is to use the space, light and water better than a single crop does, spread risk, and often get a better total return from the same field. Choose companions that do not compete for the same root zone or the same light, use different heights and growth durations, and keep the sowing and harvesting workable. Always check locally which combinations are recommended before trying them on a large area.',
        hi: 'अंतरफसल में एक ही ज़मीन पर एक ही समय में दो या ज़्यादा फसलें उगाई जाती हैं। मकसद है एक ही फसल की तुलना में जगह, रोशनी और पानी का बेहतर उपयोग, जोखिम बँटाना, और अक्सर एक ही खेत से बेहतर कुल आमदनी। साथी फसल ऐसी चुनें जो एक ही जड़ क्षेत्र या एक ही रोशनी के लिए प्रतिस्पर्धा न करें, अलग ऊंचाई और अलग बढ़वार अवधि रखें, और बुवाई-कटाई व्यावहारिक बनाए रखें। बड़े क्षेत्र में आज़माने से पहले हमेशा स्थानीय रूप से अनुशंसित संयोजन जांचें।',
      },
      steps: {
        en: [
          'Decide your main crop first - it decides the spacing, the sowing date and the irrigation schedule.',
          'Pick a companion with a different height and duration so it uses light and space the main crop leaves free.',
          'Keep the rows and spacing of the main crop clear so weeding, spraying and harvesting stay practical.',
          'Start on a small strip and record the yield of each crop separately before you scale up.',
          'Check that both crops have a known market before you commit the field.',
        ],
        hi: [
          'पहले मुख्य फसल तय करें - यही दूरी, बुवाई तारीख और सिंचाई का कैलेंडर तय करती है।',
          'ऐसा साथी फसल चुनें जिसकी ऊंचाई और अवधि अलग हो, ताकि मुख्य फसल के खाली छोड़े हुए रोशनी और जगह का उपयोग हो।',
          'मुख्य फसल की कतार और दूरी साफ़ रखें ताकि निराई, छिड़काव और कटाई व्यावहारिक बनी रहे।',
          'छोटी कतार से शुरू करें और बढ़ाने से पहले दोनों फसलों की उपज अलग-अलग लिखें।',
          'दोनों फसलों का बाज़ार ज़रूर हो, यह देखकर ही खेत लगाएं।',
        ],
      },
      precautions: {
        en: [
          'Do not intercrop without a plan for sowing, spraying and harvesting - the extra complexity can cost more than it returns.',
          'Do not mix crops if you cannot keep the seed of each variety separate at harvest.',
        ],
        hi: [
          'बुवाई, छिड़काव और कटाई की योजना बिना अंतरफसल न करें - अतिरिक्त जटिलता फायदे से ज़्यादा खर्च करा सकती है।',
          'कटाई के समय हर किस्म का बीज अलग रख पाते हों तभी मिश्रित फसल करें।',
        ],
      },
      consult: {
        en: 'Your KVK or state agriculture university knows which intercropping combinations have been tested for your district\'s rainfall, soil and market, and can advise on the sowing geometry.',
        hi: 'आपका KVK या राज्य कृषि विश्वविद्यालय जानता है कि आपके जिले की बारिश, मिट्टी और बाज़ार के लिए कौन से अंतरफसल संयोजन परखे गए हैं, और बुवाई की बनावट भी बता सकता है।',
      },
    },
    sources: [ICAR, TNAU, general('Intercropping combination - confirm with your KVK')],
    needsContext: true,
    contextHints: ['Main crop', 'Location/district', 'Field size', 'Market for the second crop'],
  }),

  defineEntry({
    id: 'k-weeds',
    category: 'rotation-weeds',
    keywords: [
      'weed control',
      'weeds',
      'remove weeds',
      'weeding',
      'weedicide',
      'khap',
      'निराई',
      'खरपतवार',
      'खरपतवार हटाना',
      'निराई कैसे',
      'weeding kab',
      'niraai',
    ],
    question: 'Weed control',
    questionHi: 'खरपतवार की नियंत्रण',
    content: {
      direct: {
        en: 'Weeds compete with the crop for light, water and nutrients, and they host pests. Control them early: weeds that are allowed to flower and set seed come back next season. The order that works best is prevention (clean seed, clean field, no seed-setting weeds before harvest), then mechanical (hoeing, hand pulling, mulching with residue), then a weedicide only if the weeds have gone beyond the stage you can manage mechanically - and then only the one locally recommended for that crop and weed, at the label dose, with the label waiting period.',
        hi: 'खरपतवार फसल से रोशनी, पानी और पोषक तत्व के लिए प्रतिस्पर्धा करते हैं और कीटों को आश्रय देते हैं। इनका नियंत्रण जल्दी करें: जिन खरपतवारों को फूल और बीज आने दिया, वे अगले सीजन लौट आते हैं। सबसे अच्छा क्रम यह है - बचाव (साफ़ बीज, साफ़ खेत, कटाई से पहले बीज वाले खरपतवार निकालना), फिर यांत्रिक (निराई, हाथ से उखाड़ना, अवशेष से मल्च), और वीडनाशक तभी जब खरपतवार उस अवस्था से आगे बढ़ चुके हों जहाँ यांत्रिक नियंत्रण संभव न हो - और तब भी वही जो आपकी फसल और खरपतवार के लिए स्थानीय रूप से अनुशंसित हो, लेबल की मात्रा में और लेबल की प्रतीक्षा अवधि के साथ।',
      },
      steps: {
        en: [
          'Do the first weeding early, while the weeds are small and the crop roots are still shallow.',
          'Hoe or pull weeds before they flower; one weeding at the right time beats several late ones.',
          'Do not let weeds go to seed anywhere in the field, bunds or channels - that is where next season\'s weeds come from.',
          'Mulch between rows with crop residue once the crop is established.',
          'If you use a weedicide, apply it on the label dose at the label stage of the weed, and note the waiting period before harvest.',
        ],
        hi: [
          'पहली निराई जल्दी करें, जब खरपतवार छोटे हों और फसल की जड़ें अभी उथली हों।',
          'खरपतवार को फूल आने से पहले निराई या उखाड़ें; सही समय पर एक निराई कई देर की निराई से बेहतर है।',
          'खेत, मेड़ या नाली में खरपतवार को बीज बनने न दें - अगले सीजन के खरपतवार वहीं से आते हैं।',
          'फसल जमने के बाद कतारों के बीच फसल अवशेष की मल्च लगाएं।',
          'वीडनाशक डालें तो लेबल की मात्रा में, खरपतवार की लेबल-अवस्था में, और कटाई से पहले लेबल की प्रतीक्षा अवधि रखें।',
        ],
      },
      precautions: {
        en: [
          'Do not burn weeds that have gone to seed outside the field - that spreads the seed further.',
          'Do not use a weedicide without knowing the weed type; some herbicides damage the crop itself.',
        ],
        hi: [
          'खेत के बाहर बीज वाले खरपतवार न जलाएं - इससे बीज और दूर तक फैलते हैं।',
          'खरपतवार की पहचान के बिना वीडनाशक न डालें; कुछ वीडनाशक फसल को ही नुकसान पहुँचाते हैं।',
        ],
      },
      consult: {
        en: 'Your KVK can identify the weeds in your field and tell you the locally recommended control for your crop, including whether a herbicide is needed at all.',
        hi: 'आपका KVK आपके खेत के खरपतवार पहचानकर आपकी फसल के लिए स्थानीय अनुशंसित नियंत्रण बता सकेगा, इसमें यह भी शामिल है कि वीडनाशक की ज़रूरत है या नहीं।',
      },
    },
    sources: [ICAR, TNAU, general('Weed management - confirm with your KVK')],
    needsContext: true,
    contextHints: ['Crop and stage', 'Which weeds?', 'Rainfed or irrigated'],
  }),

  defineEntry({
    id: 'k-crop-stage',
    category: 'rotation-weeds',
    keywords: [
      'crop stage',
      'growth stage',
      'stage of crop',
      'crop calendar',
      'phenology',
      'फसल की अवस्था',
      'बढ़वार अवस्था',
      'कौन सी अवस्था',
      'अवस्था कैसे पता करें',
      'fasal ki avastha',
    ],
    question: 'Knowing which stage the crop is in',
    questionHi: 'फसल की अवस्था कैसे पहचानें',
    content: {
      direct: {
        en: 'Almost every agronomic decision - irrigation, weeding, fertiliser top-dressing, spraying, harvest - depends on the stage of the crop, not on the calendar date. Stages are usually counted from sowing: for cereals, sowing -> germination -> tillering -> booting/heading -> flowering -> grain filling -> maturity; for vegetables, germination -> vegetative -> flowering -> fruit set -> harvest. Count from your own sowing date and keep a note; then match what you see in the field with the stage pictures in the KVK advisory for your crop.',
        hi: 'लगभग हर कृषि निर्णय - सिंचाई, निराई, खाद का टॉप-ड्रेसिंग, छिड़काव, कटाई - कैलेंडर की तारीख पर नहीं, फसल की अवस्था पर निर्भर है। अवस्थाएँ आमतौर पर बुवाई से गिनी जाती हैं: अनाज में बुवाई -> अंकुरण -> कल्ले -> बाली/बाली निकलना -> फूल -> दाना भरना -> पकना; सब्ज़ी में अंकुरण -> वानस्पतिक -> फूल -> फल बनना -> कटाई। अपनी बुवाई तारीख से गिनें और नोट रखें; फिर खेत में जो दिखता है उसे अपनी फसल के KVK सलाह में दिए गए अवस्था की तस्वीरों से मिलाएं।',
      },
      steps: {
        en: [
          'Write down the sowing date for each plot - it is the zero point for every stage count.',
          'Look for the stage marker: number of leaves, number of tillers, whether the head is emerging, whether flowers are open, whether fruit has set.',
          'Use the same marker each time so your counts are comparable week to week.',
          'Compare with the stage chart for your crop and variety from the KVK or seed dealer.',
          'Plan each operation (irrigation, spray, weeding, harvest) a stage ahead, not on the day.',
        ],
        hi: [
          'हर खेत की बुवाई तारीख लिखें - यही हर अवस्था की गिनती का शून्य बिंदु है।',
          'अवस्था का पहचान संकेत देखें: पत्तों की संख्या, कल्लों की संख्या, बाली निकल रही है या नहीं, फूल खुले हैं या नहीं, फल बन गए हैं या नहीं।',
          'हर बार यही संकेत देखें ताकि हफ्ते-दर-हफ्ते की गिनती तुलनीय रहे।',
          'अपनी फसल और किस्म का अवस्था चित्र KVK या बीज दुकानदार से लें और मिलान करें।',
          'हर कार्रवाई (सिंचाई, छिड़काव, निराई, कटाई) उस दिन नहीं, एक अवस्था पहले तय करें।',
        ],
      },
      precautions: {
        en: [
          'Do not copy a neighbour\'s calendar - varieties and sowing dates differ by weeks.',
          'Do not delay a stage-based operation because the crop "looks small"; the stage, not the size, decides.',
        ],
        hi: [
          'पड़ोसी का कैलेंडर न उतारें - किस्मों और बुवाई तारीखों में हफ्तों का अंतर होता है।',
          'इसलिए काम टालें न कि फसल "छोटी" लगती है; अवस्था तय करती है, आकार नहीं।',
        ],
      },
      consult: {
        en: 'Your KVK or seed dealer publishes stage charts for your crop and variety, and the crop planner in this app can help you line up operations from your sowing date.',
        hi: 'आपका KVK या बीज दुकानदार आपकी फसल और किस्म के अवस्था चित्र देता है, और इस ऐप का फसल प्लानर आपकी बुवाई तारीख से कामों की समय-सारणी बनाने में मदद करता है।',
      },
    },
    sources: [ICAR, TNAU, general('Crop stage chart - confirm with your KVK')],
    needsContext: true,
    contextHints: ['Crop and variety', 'Sowing date', 'What does the crop look like now?'],
  }),
]
