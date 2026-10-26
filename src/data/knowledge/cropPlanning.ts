import { ICAR, MIDH, TNAU, general } from './sources'
import { defineEntry, type KnowledgeEntry } from './types'

/**
 * ---------------------------------------------------------------------------
 * Crop selection, sowing, seed and basic cultivation
 * ---------------------------------------------------------------------------
 * Covers: choosing a crop, sowing windows, seed selection, spacing, land
 * preparation, nursery raising and transplanting.
 */

export const CROP_PLANNING_ENTRIES: KnowledgeEntry[] = [
  defineEntry({
    id: 'k-crop-choice',
    category: 'crop-planning',
    keywords: [
      'which crop should i grow',
      'which crop to grow',
      'best crop for my land',
      'what crop is good',
      'crop selection',
      'choose a crop',
      'कौन सी फसल लगाएं',
      'कौनसी फसल',
      'फसल चुनाव',
      'कौन सी फसल अच्छी',
      'konsi fasal',
      'kya fasal lagau',
      'what to grow',
      'kya fasal lagani hai',
      'kya ugaen',
      'kya lagayein',
      'fasal chunne',
      'kharif mein kya',
      'kharif crop',
    ],
    crops: ['wheat', 'paddy', 'cotton', 'tomato', 'onion', 'potato'],
    question: 'How to choose which crop to grow',
    questionHi: 'कौन सी फसल लगाएं, कैसे तय करें',
    content: {
      direct: {
        en: 'Choose a crop by matching four things: the season your rainfall falls in, the water you can reliably supply, what your soil already has, and whether there is a buyer and labour near you. No crop is "best" in the abstract - the best crop is the one your resources can carry through to harvest.',
        hi: 'चार बातों को मिलाकर फसल चुनें: आपके बारिश का मौसम, आपके पास ठीक से उपलब्ध पानी, आपकी मिट्टी की मौजूदा स्थिति, और पास में खरीदार व मजदूर। कोई फसल हमेशा "सबसे अच्छी" नहीं होती - सबसे अच्छी फसल वही है जिसे आपके संसाधन कटाई तक पहुँचा सकें।',
      },
      steps: {
        en: [
          'Note your normal rain months and first/last sowing dates from your district KVK or state agriculture office.',
          'Write down your water reality: rainfed, canal, borewell, tank or shared - and how reliable it is in April/May.',
          'Get your Soil Health Card from the local agriculture office (or the Soil Health Card portal) so you know texture, pH and available nutrients.',
          'Check local market demand and labour availability for two or three candidate crops before you commit.',
          'Compare the risk: a crop that fails halfway costs more than one that gives a modest but sure return.',
        ],
        hi: [
          'अपने जिले के KVK या राज्य कृषि कार्यालय से सामान्य बारिश के महीने और पहली/आखिरी बुवाई तारीख लें।',
          'अपनी पानी की स्थिति लिखें: वर्षा आधारित, नहर, बोरवेल, टैंक या साझा - और अप्रैल-मई में यह कितनी भरोसेमंद है।',
          'स्थानीय कृषि कार्यालय (या मृदा स्वास्थ्य कार्ड पोर्टल) से अपना मृदा स्वास्थ्य कार्ड लें, ताकि मिट्टी की बनावट, pH और पोषक तत्व पता चलें।',
          'तय करने से पहले दो-तीन संभावित फसलों के लिए स्थानीय मांग और मजदूर उपलब्धता देखें।',
          'जोखिम की तुलना करें: बीच में ही खराब हो जाने वाली फसल की लागत, ठीक से कट जाने वाली फसल से ज़्यादा होती है।',
        ],
      },
      precautions: {
        en: [
          'Do not pick a crop only because a neighbour grew it well last year - rainfall and prices move.',
          'Do not take on a high-input crop on borrowed money before you know your water and labour will hold up.',
        ],
        hi: [
          'सिर्फ इसलिए फसल न चुनें कि पड़ोसी ने पिछले साल अच्छी उपज लाई - बारिश और भाव बदलते हैं।',
          'अपना पानी और मजदूर सामने आने से पहले उधार के पैसे से अधिक लागत वाली फसल न लें।',
        ],
      },
      consult: {
        en: 'Ask your Krishi Vigyan Kendra (KVK) for the recommended crop varieties and sowing window for your district - the answer depends on local rainfall, soil and irrigation, not on a general list.',
        hi: 'अपने कृषि विज्ञान केंद्र (KVK) से अपने जिले के लिए अनुशंसित फसल किस्में और बुवाई का समय पूछें - उत्तर स्थानीय बारिश, मिट्टी और सिंचाई पर निर्भर है, किसी सामान्य सूची पर नहीं।',
      },
    },
    sources: [ICAR, TNAU, MIDH, general('Local crop suitability - confirm with your district KVK')],
    needsContext: true,
    contextHints: ['Location/district', 'Water source', 'Soil type', 'Family labour available'],
  }),

  defineEntry({
    id: 'k-sowing-window',
    category: 'cultivation',
    keywords: [
      'when to sow',
      'sowing time',
      'sowing window',
      'sowing date',
      'best time to plant',
      'when to plant',
      'बुवाई कब करें',
      'बुवाई का समय',
      'बुआई कब',
      'कब बुवाई',
      'बोने का समय',
      'sowing kab kare',
      'buvai kab',
    ],
    question: 'When to sow a crop',
    questionHi: 'फसल की बुवाई कब करें',
    content: {
      direct: {
        en: 'Sow when the soil is moist enough to germinate the seed but not so wet that it crusts, and when the local monsoon pattern makes the risk acceptable. Paddy is usually sown in the nursery in June-July and transplanted about 3-4 weeks later; wheat is usually sown from October to mid-November; cotton and soybean come with the Kharif rain around June-July. These are national patterns - your district can be earlier or later by 2-4 weeks.',
        hi: 'बुवाई तब करें जब मिट्टी बीज के अंकुरण के लिए पर्याप्त गीली हो पर ऊपर से पपड़ी न बन रही हो, और स्थानीय मानसून का जोखिम स्वीकार्य हो। धान का बीज आमतौर पर जून-जुलाई में नर्सरी में डाला जाता है और लगभग 3-4 हफ्ते बाद रोपा जाता है; गेहूँ अक्टूबर से नवंबर के मध्य तक बोया जाता है; कपास और सोयाबीन खरीफ की बारिश के साथ जून-जुलाई में। ये राष्ट्रीय ढांचा है - आपका जिला 2-4 हफ्ते पहले या बाद में हो सकता है।',
      },
      steps: {
        en: [
          'Check the soil by hand: squeeze a handful. It should hold together and break with a light touch, not be dust or mud.',
          'Look at the rainfall record for your block, not the district average - a 10-day early window is worth more than a generic date.',
          'Have seed, manure and the first irrigation arranged before you sow, so the crop does not wait.',
          'Sow on time rather than waiting for "good rain" every time - a delayed crop meets heat and pests at the wrong stage.',
          'Sow a small trial strip first if you are trying a new variety or a new sowing date.',
        ],
        hi: [
          'मिट्टी हाथ से जांचें: मुट्ठी में दबाएं। वह जुड़ी रहे और हल्के दबाव से टूटे, न बालू जैसी बनी और न कीचड़ जैसी।',
          'जिले के औसत नहीं, अपने ब्लॉक की बारिश का रिकॉर्ड देखें - सामान्य तारीख से 10 दिन पहले का समय ज़्यादा फायदेमंद है।',
          'बुवाई से पहले बीज, गोबर की खाद और पहली सिंचाई की व्यवस्था कर लें, ताकि फसल इंतज़ार न करे।',
          'हर बार "अच्छी बारिश" का इंतज़ार करने के बजाय समय पर बुवाई करें - देर से बोई फसल गर्मी और कीट से गलत अवस्था में मिलती है।',
          'नई किस्म या नई बुवाई तारीख आज़माने हो तो पहले एक छोटी ट्रायल कतार बोएं।',
        ],
      },
      precautions: {
        en: [
          'Do not sow into a dry, hard seedbed - emergence will be uneven and you will lose plants you paid for.',
          'Do not sow on waterlogged soil; a crust forms and seedlings cannot push through.',
        ],
        hi: [
          'सूखी, सख्त बीज-क्यारी में बुवाई न करें - अंकुरण असमान होगी और दिए पैसे के पौधे डूब जाएंगे।',
          'पानी भरे खेत में बुवाई न करें; ऊपर से पपड़ी बन जाती है और अंकुर ऊपर नहीं आ पाते।',
        ],
      },
      consult: {
        en: 'Get the sowing window for your specific crop and district from your KVK or state agriculture university - they publish local sowing and harvesting dates that fit your rainfall.',
        hi: 'अपनी फसल और जिले के लिए बुवाई का समय अपने KVK या राज्य कृषि विश्वविद्यालय से लें - वे स्थानीय बुवाई और कटाई की तारीखें बताते हैं जो आपकी बारिश के अनुकूल होती हैं।',
      },
    },
    sources: [ICAR, TNAU, general('Local sowing calendar - confirm with your district KVK')],
    needsContext: true,
    contextHints: ['Crop', 'Location/district', 'Irrigation source', 'Seed variety'],
  }),

  defineEntry({
    id: 'k-seed-selection',
    category: 'cultivation',
    keywords: [
      'seed selection',
      'which variety',
      'seed quality',
      'good seed',
      'hybrid or desi',
      'certified seed',
      'बीज कैसे चुनें',
      'कौन सी किस्म',
      'बीज की क्वालिटी',
      'बीज किस्म',
      'desi ya hybrid',
      'beej kaisay chune',
      'beej dalen',
      'beej ka chunav',
      'kya beej boe',
      'beej kaise chunein',
      'bhuva kya beej',
    ],
    question: 'Choosing good seed and the right variety',
    questionHi: 'अच्छा बीज और सही किस्म कैसे चुनें',
    content: {
      direct: {
        en: 'Buy certified seed from a licensed dealer and check the label: crop, variety, lot number, germination percentage and packing date. Choose the variety for your water and soil, not for a neighbour\'s result - a short-duration variety suits a limited-water field, a long-duration one suits assured irrigation. Treat your own saved seed carefully: keep it clean, dry and labelled, and expect lower germination than certified seed.',
        hi: 'लाइसेंस वाले दुकान से प्रमाणित बीज लें और लेबल देखें: फसल, किस्म, लॉट नंबर, अंकुरण प्रतिशत और पैकिंग की तारीख। किस्म अपने पानी और मिट्टी के अनुसार चुनें, पड़ोसी के परिणाम के अनुसार नहीं - कम पानी वाले खेत में कम अवधि वाली किस्म और भरोसेमंद सिंचाई वाले खेत में लंबी अवधि वाली किस्म। अपना बचाया बीज सावधानी से रखें: साफ़, सूखा और लेबल वाला रखें, और अंकुरण प्रमाणित बीज से कम रखें।',
      },
      steps: {
        en: [
          'Ask the dealer to show the pack sealed, and keep the bill - it is what you need if the seed fails to germinate.',
          'Do a simple germination check: soak 100 seeds from the lot, keep them moist in a cloth, and count how many sprout in 3-5 days.',
          'Match variety duration to your water: shorter duration means less risk from a delayed monsoon and less water.',
          'Keep seed cool, dry and in a sealed container, and label it with crop, variety and the year.',
          'Buy only the amount you will sow - old seed loses germination and old stock also carries storage risk.',
        ],
        hi: [
          'दुकानदार से बंद पैकेट दिखाकर लें और बिल रखें - बीज के अंकुरित न होने पर यही काम आता है।',
          'सादा अंकुरण जांच करें: उसी लॉट के 100 बीज भिगोएं, कपड़े में नम रखें और 3-5 दिन में कितने अंकुरित हुए गिनें।',
          'किस्म की अवधि अपने पानी से मिलाएं: कम अवधि का मतलब कम जोखिम और कम पानी।',
          'बीज ठंडे, सूखे और बंद डिब्बे में रखें और फसल, किस्म और साल का लेबल लगाएं।',
          'जितना बोना है उतना ही बीज लें - पुराने बीज की अंकुरण घटती है और भंडारण का जोखिम भी रहता है।',
        ],
      },
      precautions: {
        en: [
          'Never buy seed from an unlabelled packet or from a "huge discount" lot; it may be old, mislabelled or of an unknown variety.',
          'Do not store seed in a damp place or in a metal drum in the monsoon - moisture and heat kill germination.',
        ],
        hi: [
          'बिना लेबल के पैकेट या "बहुत सस्ता" वाले लॉट से बीज न लें; वह पुराना, गलत लेबल वाला या अज्ञात किस्म हो सकता है।',
          'बीज नम जगह या बरसात में लोहे के डिब्बे में न रखें - नमी और गर्मी अंकुरण ख़त्म कर देते हैं।',
        ],
      },
      consult: {
        en: 'Your KVK or state agriculture university can tell you which varieties are recommended in your district for your soil type and water availability, and where certified seed is sold nearby.',
        hi: 'आपका KVK या राज्य कृषि विश्वविद्यालय बता सकेगा कि आपके जिले, मिट्टी और पानी के अनुसार कौन सी किस्में अनुशंसित हैं, और पास में प्रमाणित बीज कहाँ मिलता है।',
      },
    },
    sources: [ICAR, TNAU, general('Seed storage practice - check with your KVK')],
    needsContext: true,
    contextHints: ['Crop', 'Location/district', 'Irrigation (rainfed/assured)'],
  }),

  defineEntry({
    id: 'k-spacing',
    category: 'cultivation',
    keywords: [
      'spacing',
      'plant spacing',
      'distance between plants',
      'row to row',
      'thin the crop',
      'thinning',
      'planting distance',
      'दूरी कितनी रखें',
      'दूरी',
      'बुवाई की दूरी',
      'पौधों की दूरी',
      'थिनिंग',
      'दूरी कितनी',
    ],
    question: 'Plant spacing and thinning',
    questionHi: 'बुवाई की दूरी और थिनिंग',
    content: {
      direct: {
        en: 'Spacing is set by the variety, not by habit - a spreading variety needs more room than an erect one. Wider spacing gives each plant light, air and root room, but wastes land and costs seed; too close and plants crowd, disease builds up and yields fall. After sowing, thin the crop once to the recommended plant population, otherwise you pay for seed and fertiliser that never becomes grain.',
        hi: 'दूरी किस्म से तय होती है, आदत से नहीं - फैलने वाली किस्म को सीधी किस्म से ज़्यादा जगह चाहिए। ज़्यादा दूरी से हर पौधे को रोशनी, हवा और जड़ की जगह मिलती है, पर ज़मीन और बीज दोनों बर्बाद होते हैं; बहुत पास-पास बोने पर बीमारी फैलती है और पैदावार घटती है। बुवाई के बाद फसल की सही संख्या पर एक बार थिन करें, वरना आप ऐसा बीज और खाद खर्च करते हैं जो दाना नहीं बनता।',
      },
      steps: {
        en: [
          'Find the recommended spacing on the seed packet or from your KVK - it is written for the variety you bought.',
          'Measure the row spacing with a rope or a row marker instead of guessing by eye.',
          'Thin the crop early - once seedlings have 2-3 true leaves - and remove the weakest plants first.',
          'Keep the gap filled: after thinning, irrigate lightly and loosen the soil so the remaining plants get space.',
          'Record the final plant population per hectare so you can adjust next season.',
        ],
        hi: [
          'बीज के पैकेट या KVK से अनुशंसित दूरी देखें - वह आपकी किस्म के लिए लिखी होती है।',
          'आंख से अंदाज़ा लगाने के बजाय रस्सी या कतार-मार्कर से कतार की दूरी नापें।',
          'फसल जल्दी थिन करें - जब अंकुर में 2-3 असली पत्ते हों - और कमज़ोर पौधे पहले निकालें।',
          'थिनिंग के बाद हल्की सिंचाई करें और मिट्टी हल्की खोदें, ताकि बचे पौधों को जगह मिले।',
          'प्रति हेक्टेयर अंतिम पौध संख्या लिखकर रखें, ताकि अगले सीजन में सुधार कर सकें।',
        ],
      },
      precautions: {
        en: [
          'Do not over-thin - every plant removed is a plant that could have produced grain or fruit.',
          'Do not thin when the soil is very dry; irrigate a little first so the roots are not torn.',
        ],
        hi: [
          'ज़्यादा न पतलाएं - हर हटाया पौधा वह पौधा है जो दाना या फल दे सकता था।',
          'बहुत सूखी मिट्टी में थिनिंग न करें; पहले हल्की सिंचाई करें ताकि जड़ें न उखड़ें।',
        ],
      },
      consult: {
        en: 'Your KVK or the seed dealer can confirm the recommended spacing and plant population for your variety, seed rate and sowing method (broadcast or line).',
        hi: 'आपका KVK या बीज दुकानदार आपकी किस्म, बीज दर और बुवाई तरीके (छिटकवां या कतार में) के लिए अनुशंसित दूरी और पौध संख्या बता देगा।',
      },
    },
    sources: [ICAR, TNAU, general('Spacing practice - confirm with your KVK')],
    needsContext: true,
    contextHints: ['Crop and variety', 'Sowing method (broadcast/line)', 'Soil fertility'],
  }),

  defineEntry({
    id: 'k-land-preparation',
    category: 'cultivation',
    keywords: [
      'land preparation',
      'prepare the field',
      'tillage',
      'ploughing',
      'plowing',
      'field preparation',
      'जुताई',
      'खेत की तैयारी',
      'खेत जोतना',
      'जमीन तैयार',
      'जुताई कैसे',
      'jutai',
    ],
    question: 'Land preparation before sowing',
    questionHi: 'बुवाई से पहले खेत की तैयारी',
    content: {
      direct: {
        en: 'Land preparation should give you a fine, level, weed-free seedbed that holds moisture but drains well. One deep tillage at the start, followed by 2-3 harrowings, is usually enough for most field crops - more passes cost fuel and time, break soil structure and bring stones to the surface. Level the field so water spreads evenly instead of collecting in patches.',
        hi: 'खेत की तैयारी से महीन, समतल और खरपतवार-मुक्त बीज-क्यारी बननी चाहिए जो नमी रोके पर पानी न रोके। आमतौर पर शुरू में एक गहरी जुताई और उसके बाद 2-3 बार कल्टी/हर्री काफी होती है - ज़्यादा जुताई ईंधन और समय खर्च करती है, मिट्टी की संरचना तोड़ती है और पत्थर ऊपर लाती है। खेत समतल करें ताकि पानी एक जैसा बँटे, एक जगह जमा न हो।',
      },
      steps: {
        en: [
          'Wait for the soil to be in the right moisture state - workable, not soaking wet and not dust.',
          'Do one deep ploughing (about 20-25 cm) after the previous crop, at the start of the season.',
          'Follow with 2-3 harrowings and planking to break clods and level the surface.',
          'Remove weeds and burn/compost them before sowing; do not leave seed of weeds in the field.',
          'Add well-rotted organic matter and level the field before the final pass, not after.',
        ],
        hi: [
          'मिट्टी की सही नमी का इंतज़ार करें - काम करने योग्य, न बहुत गीली और न सूखी धूल।',
          'पिछली फसल के बाद सीजन की शुरुआत में एक गहरी जुताई करें (लगभग 20-25 सेमी)।',
          'उसके बाद 2-3 बार कल्टी/हर्री करके पाटन (प्लांकिंग) करें ताकि ढेले बिखरें और सतह समतल हो।',
          'खरपतवार निकालकर उन्हें जला दें या कम्पोस्ट बनाएं; खेत में खरपतवार का बीज न छोड़ें।',
          'अच्छी तरह सड़ी जैविक खाद मिलाएं और आखिरी जुताई से पहले खेत समतल करें, बाद में नहीं।',
        ],
      },
      precautions: {
        en: [
          'Do not till wet soil - it destroys structure and makes the field hard to enter later.',
          'Do not burn crop residue in the field if stubble can be collected or incorporated; it removes organic matter.',
        ],
        hi: [
          'गीली मिट्टी में जुताई न करें - इससे मिट्टी की संरचना टूटती है और बाद में खेत में जाना मुश्किल हो जाता है।',
          'पराली जमीन पर न जलाएं अगर उसे इकट्ठा या मिट्टी में मिलाया जा सकता हो; इससे जैविक पदार्थ नष्ट होता है।',
        ],
      },
      consult: {
        en: 'Ask your KVK for the recommended tillage and seedbed preparation for your soil type - a heavy black soil needs different passes from a light sandy soil.',
        hi: 'अपने KVK से अपनी मिट्टी के अनुसार अनुशंसित जुताई और बीज-क्यारी तैयारी पूछें - भारी काली मिट्टी में हल्की रेती मिट्टी से अलग जुताई चाहिए।',
      },
    },
    sources: [ICAR, TNAU, general('Tillage practice - check locally')],
    needsContext: true,
    contextHints: ['Soil type', 'Previous crop', 'Rainfed or irrigated'],
  }),

  defineEntry({
    id: 'k-nursery',
    category: 'cultivation',
    keywords: [
      'nursery',
      'nursery raising',
      'nursery bed',
      'raise seedlings',
      'seedling',
      'नर्सरी',
      'नर्सरी कैसे',
      'पौध तैयार',
      'अंकुर',
      'nursery kaise',
    ],
    question: 'Raising a nursery',
    questionHi: 'नर्सरी कैसे तैयार करें',
    content: {
      direct: {
        en: 'A good nursery gives seedlings that are healthy, uniform and ready to transplant at the right size. Use clean, well-rotted compost, a raised bed about 1 m wide so you can reach the centre, and a light soil that drains well. Sow at even spacing, cover the bed lightly, and keep it moist but not flooded. Shade the first days in hot weather and protect from heavy rain.',
        hi: 'अच्छी नर्सरी से पौधे स्वस्थ, एक जैसे और सही समय पर रोपने योग्य निकलते हैं। साफ़, अच्छी तरह सड़ी कम्पोस्ट लें, लगभग 1 मीटर चौड़ी उठी हुई क्यारी बनाएं ताकि बीच तक पहुँच सकें, और ऐसी हल्की मिट्टी रखें जो पानी न रोके। बीज समान दूरी पर डालें, हल्का ढकें, और क्यारी में नमी बनाए रखें पर पानी न भरें। गर्मी में पहले कुछ दिन छाया दें और तेज़ बारिश से बचाएं।',
      },
      steps: {
        en: [
          'Choose a spot near a water source, level, with good drainage and away from a weedy corner.',
          'Build raised beds about 10-15 cm high, 1 m wide and as long as you need, with walkways between them.',
          'Fill the beds with a fine mixture of soil and well-rotted compost, then level and gently firm it.',
          'Sow at even spacing, cover with a thin layer of fine soil, and mulch lightly to keep moisture.',
          'Irrigate with a gentle rose or a watering can; a strong jet washes seeds out of the bed.',
          'Raise a simple shade (a bamboo frame with a net or cloth) over the bed for the first week if it is hot.',
        ],
        hi: [
          'पानी के स्रोत के पास, समतल, पानी निकलने वाली जगह चुनें और खरपतवार वाले कोने से दूर रखें।',
          '10-15 सेमी ऊँची, 1 मीटर चौड़ी और जितनी लंबी चाहिए क्यारियाँ बनाएं, बीच में पगडंडी रखकर।',
          'क्यारियों में महीन मिट्टी और अच्छी तरह सड़ी कम्पोस्ट का मिश्रण भरें, फिर समतल करें और हल्का दबाएं।',
          'समान दूरी पर बीज डालें, ऊपर से महीन मिट्टी की पतली परत बिछाएं और नमी रखने के लिए हल्का मल्च करें।',
          'हल्के फवारे या गडुआ से सिंचाई करें; तेज़ धार बीज बिस्करा देती है।',
          'गर्मी हो तो पहले हफ्ते क्यारी पर बाँस के ढाँचे पर नेट या कपड़े से छाया बनाएं।',
        ],
      },
      precautions: {
        en: [
          'Do not use fresh manure in the nursery - it burns roots and carries weed seeds.',
          'Do not let the bed crust over or dry out; both stop seedlings from coming up evenly.',
        ],
        hi: [
          'नर्सरी में ताज़ा गोबर की खाद न डालें - इससे जड़ें जल जाती हैं और खरपतवार के बीज आ जाते हैं।',
          'क्यारी पर पपड़ी न बनने दें और सूखने भी न दें; दोनों से अंकुर एक जैसे नहीं उगते।',
        ],
      },
      consult: {
        en: 'Your KVK can give you a nursery raising method and seed rate for your variety, and tell you when to transplant - typically when seedlings have 3-4 true leaves and a strong root system.',
        hi: 'आपका KVK आपकी किस्म के लिए नर्सरी तैयार करने का तरीका और बीज दर बता देगा, और रोपाई का समय भी - आमतौर पर जब अंकुर में 3-4 असली पत्ते और मज़बूत जड़ें हों।',
      },
    },
    sources: [ICAR, TNAU, general('Nursery practice - confirm with your KVK')],
    needsContext: true,
    contextHints: ['Crop', 'Season', 'Area to be planted'],
  }),

  defineEntry({
    id: 'k-transplanting',
    category: 'cultivation',
    keywords: [
      'transplanting',
      'transplant',
      'planting seedlings',
      'pitting',
      'रोपाई',
      'रोपना',
      'पौध लगाना',
      'रोपाई कैसे',
      'रोपाई का समय',
      'transplant kab',
    ],
    question: 'Transplanting seedlings into the field',
    questionHi: 'नर्सरी के पौधे खेत में रोपना',
    content: {
      direct: {
        en: 'Transplant young seedlings with a healthy root ball into wet or moist soil, at the recommended spacing, and in the evening or early morning so they do not face the midday heat. Plant them at the same depth they grew in the nursery - planting deeper buries the stem and the plant struggles. Keep the field moist for the first week or so so roots take hold.',
        hi: 'स्वस्थ जड़ों वाले छोटे पौधे नम या गीली मिट्टी में अनुशंसित दूरी पर रोपें, और दोपहर की गर्मी से बचने के लिए शाम या सुबह जल्दी रोपें। नर्सरी वाली गहराई पर ही रोपें - ज़्यादा गहरा रोपने पर तना दब जाता है और पौधा कष्ट में रहता है। पहले हफ्ते खेत में नमी बनाए रखें ताकि जड़ें जम जाएं।',
      },
      steps: {
        en: [
          'Prewet the field so the soil is moist where you plant, and mark rows at the recommended spacing.',
          'Uproot seedlings late in the day, keep them in a bundle with a wet cloth and carry them in the shade.',
          'Plant to the same depth as in the nursery - the collar should sit at soil level.',
          'Firm the soil lightly around each plant and water immediately.',
          'Keep the field moist for about a week, then check for gaps and replant any that did not take.',
        ],
        hi: [
          'खेत को पहले हल्का गीला करें ताकि रोपने की जगह मिट्टी नम रहे, और अनुशंसित दूरी पर कतारें बनाएं।',
          'पौधे शाम को निकालें, गीले कपड़े में बंधी रखें और छाया में ले जाएं।',
          'नर्सरी वाली गहराई पर ही रोपें - तने का जोड़ मिट्टी के स्तर पर रहे।',
          'हर पौधे के चारों ओर मिट्टी हल्की दबाएं और तुरंत पानी दें।',
          'लगभग एक हफ्ते खेत में नमी बनाए रखें, फिर जगहें देखें और जो न लगे उन्हें दोबारा लगाएं।',
        ],
      },
      precautions: {
        en: [
          'Do not transplant into hot, dry soil - seedlings suffer transplant shock and many die.',
          'Do not hold uprooted seedlings in a heap for hours; keep them cool, shaded and moist.',
        ],
        hi: [
          'गर्म, सूखी मिट्टी में रोपाई न करें - शिखर तनाव से बहुत सारे पौधे मर जाते हैं।',
          'निकाले गए पौधे घंटों तक ढेर में न रखें; उन्हें ठंडा, छायदार और नम रखें।',
        ],
      },
      consult: {
        en: 'Confirm the right age of the seedling and the spacing for your crop with your KVK - transplanting too early or too late changes how the crop grows all season.',
        hi: 'अपने KVK से अपनी फसल के लिए पौधे की सही उम्र और दूरी की पुष्टि करें - बहुत जल्दी या बहुत देर से रोपाई पूरे सीजन की बढ़वार बदल देती है।',
      },
    },
    sources: [ICAR, TNAU, general('Transplanting practice - confirm with your KVK')],
    needsContext: true,
    contextHints: ['Crop', 'Planting method (direct/transplant)', 'Irrigation availability'],
  }),
]
