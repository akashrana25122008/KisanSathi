import { ICAR, MIDH, TNAU, general } from './sources'
import { defineEntry, type KnowledgeEntry } from './types'

/**
 * ---------------------------------------------------------------------------
 * Harvesting, drying, storage and post-harvest handling
 * ---------------------------------------------------------------------------
 */

export const POST_HARVEST_ENTRIES: KnowledgeEntry[] = [
  defineEntry({
    id: 'k-harvest-timing',
    category: 'post-harvest',
    keywords: [
      'when to harvest',
      'harvesting time',
      'maturity',
      'when is it ready',
      'harvest',
      'cutting time',
      'कटाई कब',
      'कटाई का समय',
      'पकने का समय',
      'फसल पक गई',
      'harvest kab',
      'kadai kab',
      'gehun kab katein',
      'kab katein',
      'fasal kab kate',
    ],
    question: 'When to harvest a crop',
    questionHi: 'फसल की कटाई कब करें',
    content: {
      direct: {
        en: 'Harvest at the right moisture and the right stage, not on a fixed date. Practical signs: for wheat and other grains, the seed is hard and cannot be dented with a thumbnail, the straw is dry and the ear has turned golden; for paddy, the grains are hard and the panicles bend down; for vegetables and fruit, the colour, size and firmness of the day you want to sell. Harvesting too early gives shrivelled grain that loses weight in storage; too late means shattering, bird damage and pest attack.',
        hi: 'तय तारीख पर नहीं, सही नमी और सही अवस्था पर कटाई करें। व्यावहारिक संकेत: गेहूँ और अन्य दाने में बीज कठोर हो और नाखूने से दबाए जाने पर दाग न पड़े, भूसा सूखा हो और बाली सुनहरी हो; धान में दाने कठोर हों और बालियां झुक जाएं; सब्ज़ी और फल में उस दिन की रंग, आकार और कठोरपन हो जो आप बेचना चाहते हैं। बहुत जल्दी कटाई से दाना सिकुड़ जाता है और भंडारण में वजन घटता है; बहुत देर से बालियां टूटती हैं, पक्षी नुकसान पहुँचाते हैं और कीट लग जाते हैं।',
      },
      steps: {
        en: [
          'Check a few plants across the field, not one corner - maturity is rarely even.',
          'Test a handful of grains for hardness and moisture before you start.',
          'Harvest on a dry day when the crop is dry, and keep cut produce out of the sun.',
          'Do not mix ripe and unripe material, or old and new lots, in the same heap.',
          'Clean the threshing floor and the storage area before you bring the harvest in.',
        ],
        hi: [
          'खेत के एक कोने में नहीं, कई जगहों पर कुछ पौधे देखें - पकापन एक जैसा नहीं होता।',
          'शुरू करने से पहले मुट्ठी भर दाने की कठोरता और नमी जांचें।',
          'सूखे दिन में कटाई करें जब फसल सूखी हो, और कटी चीज़ को धूप से दूर रखें।',
          'पके और अधपके या पुराने और नए माल को एक ही ढेर में न मिलाएं।',
          'फसल लाने से पहले थ्रेशिंग फर्श और भंडारण जगह साफ़ कर लें।',
        ],
      },
      precautions: {
        en: [
          'Do not harvest a wet crop - it takes long to dry, spoils faster and encourages mould in storage.',
          'Do not leave harvested crop lying in the field overnight; it attracts animals, pests and moisture.',
        ],
        hi: [
          'गीली फसल की कटाई न करें - सूखने में समय लगता है, जल्दी खराब होती है और भंडारण में फफूंद लगती है।',
          'कटी फसल को रात भर खेत में न छोड़ें; यह जानवरों, कीटों और नमी को आकर्षित करती है।',
        ],
      },
      consult: {
        en: 'Your KVK or the seed dealer can tell you the exact harvest window and safe moisture for your variety, and your local buyer usually knows the moisture level they will accept.',
        hi: 'आपका KVK या बीज दुकानदार आपकी किस्म के लिए सही कटाई समय और सुरक्षित नमी बता सकेगा, और आपका स्थानीय खरीदार भी जानता है कि वह कितनी नमी वाला माल लेगा।',
      },
    },
    sources: [ICAR, TNAU, general('Harvest practice - confirm with your KVK')],
    needsContext: true,
    contextHints: ['Crop and variety', 'Location/district', 'Storage arrangement'],
  }),

  defineEntry({
    id: 'k-drying',
    category: 'post-harvest',
    keywords: [
      'drying',
      'dry the grain',
      'moisture content',
      'sun drying',
      'drying yard',
      'how to dry',
      'सुखाना',
      'नमी',
      'धूप में सुखाना',
      'सुखाने का तरीका',
      'moisture',
      'dry kaise kare',
    ],
    question: 'Drying grain and removing moisture',
    questionHi: 'दाना/उपज सुखाना और नमी कम करना',
    content: {
      direct: {
        en: 'Drying is the single most important post-harvest step: grain stored wet will grow mould, heat up, attract insects and lose both weight and quality. Dry on a clean raised surface (a tarpaulin, a mat or a drying floor), in thin layers, and turn it regularly so it dries evenly; avoid drying it directly on bare soil or on a road. Aim for a moisture level that lets the grain stay cool in storage - a practical field test is that the grain should not stick to the palm and should break cleanly when bitten, and in the sun it should not feel cool. For a precise number, a moisture meter or the KVK can check it.',
        hi: 'सुखाना कटाई के बाद सबसे ज़रूरी कदम है: नम दाना रखने पर फफूंद लगती है, गर्मी पैदा होती है, कीट लगते हैं और वजन व गुणवत्ता दोनों घटते हैं। साफ़ ऊँची जगह (टारपोलिन, मच्छर या सुखाने का फर्श) पर पतली परत में सुखाएं और बीच-बीच में पलटें ताकि एक जैसा सूखे; सीधे ज़मीन या सड़क पर न सुखाएं। ऐसी नमी का लक्ष्य रखें जिससे भंडारण में दाना ठंडा रहे - एक व्यावहारिक जांच यह है कि दाना हाथ से चिपके नहीं और दांत से काटने पर साफ़ टूटे, और धूप में ठंडा न लगे। सही संख्या के लिए नमी मीटर या KKV जांच कर सकता है।',
      },
      steps: {
        en: [
          'Spread the produce in a thin layer on a clean raised surface, no more than a few inches deep.',
          'Turn it every few hours during the day and bring it in at night if dew is likely.',
          'Dry during the day and cover it at night so moisture does not come back in.',
          'Keep different lots apart and mark each lot with the date and the field.',
          'Store only when the grain is properly dry - if it is warm or smells musty, it is not ready.',
        ],
        hi: [
          'उपज साफ़ ऊँची जगह पर पतली परत में फैलाएं, कुछ इंच से ज़्यादा मोटी नहीं।',
          'दिन में हर कुछ घंटे में पलटें और ओस की संभावना हो तो रात में अंदर रखें।',
          'दिन में सुखाएं और रात में ढकें ताकि नमी वापस न आए।',
          'अलग-अलग लॉट अलग रखें और हर लॉट पर तारीख व खेत नंबर लिखें।',
          'जब दाना ठीक से सूखा हो तभी भंडारण करें - अगर गर्म है या सड़ी गंध आती है तो तैयार नहीं है।',
        ],
      },
      precautions: {
        en: [
          'Never dry grain on a road or on bare soil - dust, stones and soil contaminate it.',
          'Do not stack hot or damp produce in a bag or a heap; it will heat and spoil quickly.',
        ],
        hi: [
          'दाना सड़क या खुली मिट्टी पर कभी न सुखाएं - धूल, पत्थर और मिट्टी माल खराब कर देते हैं।',
          'गर्म या गीली उपज बोरी या ढेर में न रखें; वह गर्म होकर जल्दी खराब हो जाती है।',
        ],
      },
      consult: {
        en: 'Your KVK can tell you the safe storage moisture for your crop and can check moisture with a meter, and can advise on mechanical dryers for larger quantities.',
        hi: 'आपका KVK आपकी फसल के लिए सुरक्षित भंडारण नमी बता सकेगा और मीटर से जांच कर सकता है, तथा बड़ी मात्रा के लिए मशीनी सुखाने की सलाह दे सकता है।',
      },
    },
    sources: [ICAR, TNAU, general('Drying practice - confirm the safe moisture with your KVK')],
    needsContext: true,
    contextHints: ['Crop', 'Quantity', 'Do you have a drying floor or meter?'],
  }),

  defineEntry({
    id: 'k-storage',
    category: 'post-harvest',
    keywords: [
      'storage',
      'store the crop',
      'godown',
      'warehouse',
      'grain bin',
      'storage loss',
      'rakhne ka tareeka',
      'how to store',
      'store grain',
      'store wheat',
      'storing grain',
      'भंडारण',
      'गोदाम',
      'रखना',
      'सुरक्षित रखें',
      'stock',
      'bunker',
    ],
    question: 'Storing grain safely',
    questionHi: 'दाने को सुरक्षित कैसे रखें',
    content: {
      direct: {
        en: 'Good storage protects the crop from insects, rodents, mould and moisture. Start with clean, dry, well-filled bags or a clean pucca (lined) bin; keep the store dry, ventilated and shaded, and keep the material off the floor on pallets so it cannot draw moisture from the ground. Do not mix new and old stock, and do not store a lot that is still warm. Watch for webbing, gnawed husks, a musty smell or a rising temperature inside the heap - any of these means act now, because damage in storage spreads fast and is invisible until the grain is gone.',
        hi: 'अच्छा भंडारण फसल को कीटों, चूहों, फफूंद और नमी से बचाता है। साफ़, सूखी, अच्छी तरह भरी बोरियों या साफ़ पक्के (पक्की दीवार वाले) बिन से शुरू करें; भंडारण को सूखा, हवादार और छायादार रखें, और माल को फर्श से ऊपर रखें ताकि वह ज़मीन से नमी न खींचे। नया और पुराना माल न मिलाएं, और जो अभी गर्म है उसे रखें नहीं। जाले, कुतरा हुआ छिलका, सड़ी गंध या ढेर में बढ़ता तापमान - इनमें से कुछ भी दिखे तो तुरंत कार्रवाई करें, क्योंकि भंडारण में नुकसान तेज़ी से बढ़ता है और दाना गायब होने तक दिखता नहीं।',
      },
      steps: {
        en: [
          'Clean and dry the store before filling it - old grain and old husks carry insects.',
          'Keep stock on pallets or wooden planks, 10-15 cm off the wall, so air can move and rats cannot get in.',
          'Stack in neat rows with aisles between them so you can inspect regularly.',
          'Keep the store roof sound: a leak in the roof ruins the lot below it.',
          'Check the store every week: look for webbing, live insects, chewed grain, condensation on the walls or a hot spot in the heap.',
          'Keep old and new stock separate and label each lot with the crop, variety and date.',
        ],
        hi: [
          'भरने से पहले भंडारण साफ़ और सूखा करें - पुराना दाना और पुराने छिलके कीट ले आते हैं।',
          'माल को पैलेट या लकड़ी की तख्ते पर, दीवार से 10-15 सेमी दूर, रखें ताकि हवा चले और चूहे अंदर न घुसें।',
          'माल को सीधी कतारों में, बीच में गलियां छोड़कर रखें ताकि नियमित जांच हो सके।',
          'भंडारण की छत मज़बूत रखें: छत में चूरना उसके नीचे रखे पूरे लॉट को खराब कर देता है।',
          'हर हफ्ते जांचें: जाले, जीवित कीट, कुतरे दाने, दीवार पर नमी या ढेर में गर्म जगह देखें।',
          'पुराने और नए माल को अलग रखें और हर लॉट पर फसल, किस्म और तारीख लिखें।',
        ],
      },
      precautions: {
        en: [
          'Never store grain together with chemicals, fertilizer or empty pesticide containers.',
          'Do not open bags and re-bag grain in the store - it spreads whatever is already inside.',
        ],
        hi: [
          'दाने को रसायन, खाद या खाली कीटनाशक डिब्बों के साथ कभी न रखें।',
          'भंडारण में बोरियां खोलकर दाने दोबारा न भरें - इससे जो अंदर है, वह फैल जाता है।',
        ],
      },
      consult: {
        en: 'Your KVK can advise on storage structures, safe moisture and the local storage-loss problems for your crop, and the state has storage schemes and warehouse options - ask the agriculture office about them.',
        hi: 'आपका KVK भंडारण संरचना, सुरक्षित नमी और आपकी फसल के स्थानीय भंडारण-हानि के बारे में सलाह दे सकता है, और राज्य में भंडारण योजनाएं और गोदाम विकल्प हैं - इसके बारे में कृषि कार्यालय से पूछें।',
      },
    },
    sources: [ICAR, TNAU, general('Storage practice - confirm with your KVK')],
    needsContext: true,
    contextHints: ['Crop and quantity', 'Storage type (bags/bin/covered space)', 'How long will you store?'],
  }),

  defineEntry({
    id: 'k-value-addition',
    category: 'post-harvest',
    keywords: [
      'value addition',
      'processing',
      'value added product',
      'grading',
      'packing',
      'grading and packing',
      'मूल्य संवर्धन',
      'प्रसंस्करण',
      'पैकिंग',
      'ग्रेडिंग',
      'value addition kaise',
    ],
    question: 'Grading, packing and value addition',
    questionHi: 'ग्रेडिंग, पैकिंग और मूल्य संवर्धन',
    content: {
      direct: {
        en: 'Grading and packing often add more value than growing a different crop. Sorting produce by size, maturity and condition removes damaged material, gives the buyer a consistent lot and lets you sell the best part at a better rate - and the rejected part can go into value addition instead of being thrown away. Simple steps that help: use clean, food-grade containers; label the lot with crop, variety, packing date and your contact; avoid mixing grades in one bag; and keep the packing area shaded and clean.',
        hi: 'अलग फसल उगाने से ज़्यादा अक्सर ग्रेडिंग और पैकिंग से ज़्यादा मूल्य बनता है। उपज को आकार, पकापन और स्थिति के हिसाब से छाँटने से खराब माल निकल जाता है, खरीदार को एक जैसा माल मिलता है और आपके सबसे अच्छे हिस्से की बेहतर दर मिलती है - और निकला हुआ हिस्सा बर्बाद होने के बजाय मूल्य संवर्धन में जा सकता है। मदद करने वाले सादे कदम: साफ़, खाने-योग्य डिब्बे इस्तेमाल करें; लॉट पर फसल, किस्म, पैकिंग तारीख और अपना संपर्क लिखें; एक बोरी में अलग-अलग ग्रेड न मिलाएं; और पैकिंग जगह को छायादार व साफ़ रखें।',
      },
      steps: {
        en: [
          'Sort out damaged, over-ripe, misshapen and off-colour produce first.',
          'Grade by size and maturity if the buyer pays by grade - ask the buyer what grade they want.',
          'Pack in clean, food-grade, ventilated containers and do not overfill them.',
          'Label every lot: crop, variety, grade, packing date and your contact number.',
          'Keep a record of what you packed and sold so next season you know which grade paid best.',
          'Explore local options - many states and the horticulture mission support packing units and small processing equipment.',
        ],
        hi: [
          'पहले टूटा-फूटा, ज़्यादा पका, टेढ़ा और रंग वाला माल अलग करें।',
          'अगर खरीदार ग्रेड के हिसाब से भाव देता है तो आकार और पकापन के अनुसार ग्रेड करें - खरीदार से पूछें कि उसे कौन सा ग्रेड चाहिए।',
          'साफ़, खाने-योग्य, हवादार डिब्बों में पैक करें और ज़्यादा भरें नहीं।',
          'हर लॉट पर लेबल लगाएं: फसल, किस्म, ग्रेड, पैकिंग तारीख और अपना नंबर।',
          'पैक और बिक्री का रिकॉर्ड रखें ताकि अगले सीजन पता चले कि किस ग्रेड का भाव सबसे अच्छा मिला।',
          'स्थानीय विकल्प देखें - कई राज्य और बागवानी मिशन पैकिंग यूनिट और छोटी प्रसंस्करण मशीनों के लिए सहायता देते हैं।',
        ],
      },
      precautions: {
        en: [
          'Do not pack produce that has been wet or heat-baked - it spoils inside the pack.',
          'Do not reuse containers that held chemicals; keep them clearly separate from produce.',
        ],
        hi: [
          'गीला या गर्म से पका हुआ माल पैक न करें - पैक के अंदर ही खराब हो जाता है।',
          'रसायन रखे डिब्बे दोबारा उपज के लिए इस्तेमाल न करें; उन्हें साफ़ अलग रखें।',
        ],
      },
      consult: {
        en: 'Your KVK, the state horticulture mission (MIDH) or the local horticulture office can tell you about local packing units, cold chain, storage and grading support, and which schemes are currently open.',
        hi: 'आपका KVK, राज्य बागवानी मिशन (MIDH) या स्थानीय बागवानी कार्यालय स्थानीय पैकिंग यूनिट, कोल्ड चेन, भंडारण और ग्रेडिंग सहायता तथा इस समय खुली योजनाओं के बारे में बता सकेगा।',
      },
    },
    sources: [ICAR, MIDH, TNAU, general('Grading and packing - check local buyer requirements')],
    needsContext: true,
    contextHints: ['Crop and quantity', 'Who is your buyer?', 'Storage and transport available?'],
  }),
]
