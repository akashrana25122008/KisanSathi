import { AGRIWELFARE, ICAR, TNAU, general } from './sources'
import { defineEntry, type KnowledgeEntry } from './types'

/**
 * ---------------------------------------------------------------------------
 * Farming costs, labour and planning
 * ---------------------------------------------------------------------------
 * The assistant never invents a price, a wage or a profit figure. It helps the
 * farmer build the numbers himself and tells him where to get the two inputs
 * that change every year: local prices and local wages.
 */

export const ECONOMICS_ENTRIES: KnowledgeEntry[] = [
  defineEntry({
    id: 'k-farming-cost',
    category: 'economics',
    keywords: [
      'cost of cultivation',
      'farming cost',
      'cost calculation',
      'how much does it cost',
      'budget for farming',
      'profit',
      'net income',
      'loss',
      'investment',
      'खेती की लागत',
      'लागत',
      'खर्चा',
      'मुनाफा',
      'नुकसान',
      'पैसा लगाना',
      'kharcha',
      'lagat kitni',
    ],
    question: 'Working out the cost and return of a crop',
    questionHi: 'फसल की लागत और आमदनी की गणना',
    content: {
      direct: {
        en: 'Work out the cost per acre (or per hectare) on your own field, in three columns: inputs (seed, manure, fertiliser, plant protection, irrigation, diesel), labour (paid and family, priced at a local wage), and land and finance charges. Add the harvest, transport and packing cost. Compare with the price you can actually get - from your mandi board, not from memory - and treat the difference as uncertain, because the price, the weather and the yield can all move. This assistant will not quote prices or promise a profit, because those depend on your district, your market and the season.',
        hi: 'अपने खेत के लिए प्रति एकड़ (या प्रति हेक्टेयर) लागत तीन कॉलम में निकालें: आदान (बीज, खाद, उर्वरक, कीट-रक्षा, सिंचाई, डीज़ल), मजदूरी (देयदा और पारिवारिक, स्थानीय मजदूरी भाव पर), और भूमि व वित्त व्यय। कटाई, ढुलाई और पैकिंग का खर्च भी जोड़ें। उस भाव से तुलना करें जो आपको सचमुच मिलेगा - मंडी के बोर्ड से, याद से नहीं - और अंतर को अनिश्चित मानें, क्योंकि भाव, मौसम और उपज तीनों बदल सकते हैं। यह सहायक न भाव बताएगा और न मुनाफे का वादा करेगा, क्योंकि ये आपके जिले, बाज़ार और मौसम पर निर्भर हैं।',
      },
      steps: {
        en: [
          'Fix the unit - per acre or per hectare - and the crop, so the numbers are comparable year to year.',
          'Write every input you bought with its bill quantity: seed, compost, fertiliser, plant protection, irrigation charges, diesel, transport.',
          'Count labour days by task and price them at a local wage, including your own family labour - that is a real cost.',
          'Add the yield you actually got (not the expected one) and the price you actually received.',
          'Write the total down on one page and keep it. The second season is when the numbers start telling you something.',
          'Compare two years side by side and find the one line that grew fastest - that is usually where you can improve.',
        ],
        hi: [
          'इकाई तय करें - प्रति एकड़ या प्रति हेक्टेयर - और फसल भी, ताकि नंबर साल-दर-साल मिलाने योग्य रहें।',
          'हर आदान बिल की मात्रा के साथ लिखें: बीज, कम्पोस्ट, खाद, कीट-रक्षा, सिंचाई शुल्क, डीज़ल, ढुलाई।',
          'मजदूरी के दिन काम के हिसाब से गिनें और स्थानीय मजदूरी भाव पर आंकें - अपनी पारिवारिक मजदूरी भी शामिल करें, वह असली लागत है।',
          'जितनी उपज आपको असल में मिली (अपेक्षित नहीं) और जितना भाव असल में मिला, वही जोड़ें।',
          'कुल मात्रा एक पन्ने पर लिखकर रखें। दूसरे सीजन से ही ये नंबर कुछ कहने लगते हैं।',
          'दो साल के नंबर साथ-साथ रखें और देखें कि कौन सी लाइन सबसे ज़्यादा बढ़ी - आमतौर पर सुधार वहीं से शुरू होता है।',
        ],
      },
      precautions: {
        en: [
          'Do not plan the year on last year\'s price - prices move, and so does every input cost.',
          'Do not treat a good season as proof that the plan works; repeat it across at least two seasons before you invest more.',
        ],
        hi: [
          'पिछले साल के भाव पर अगले साल की योजना न बनाएं - भाव बदलते हैं, और हर आदान का खर्च भी।',
          'अच्छे सीजन को योजना सफल का सबूत न मानें; ज़्यादा निवेश से पहले कम से कम दो सीजन दोहराएं।',
        ],
      },
      consult: {
        en: 'Your KVK can give you the local package of practices (cost of cultivation and the operations you should follow) for your crop and district, and the state agriculture department publishes the same economics for many crops.',
        hi: 'आपका KVK आपकी फसल और जिले के लिए स्थानीय पैकेज ऑफ प्रैक्टिस (लागत और अपेक्षित काम) दे सकता है, और राज्य कृषि विभाग कई फसलों के लिए यही आर्थिकी प्रकाशित करता है।',
      },
    },
    sources: [ICAR, AGRIWELFARE, TNAU, general('Local prices and wages - collect them from your own market')],
    needsContext: true,
    contextHints: ['Crop', 'Area (acre/hectare)', 'District', 'Are you planning or reviewing last season?'],
  }),

  defineEntry({
    id: 'k-record-keeping',
    category: 'economics',
    keywords: [
      'record keeping',
      'farm records',
      'account',
      'bookkeeping',
      'note book',
      'diary',
      'farm diary',
      'खाता',
      'नोटबुक',
      'रिकॉर्ड',
      'हिसाब',
      'खेती का रिकॉर्ड',
    ],
    question: 'Keeping simple farm records',
    questionHi: 'खेती का सादा रिकॉर्ड कैसे रखें',
    content: {
      direct: {
        en: 'A simple notebook is enough to run a farm better. Keep one page per crop and season with four blocks: the date and the operation done, what you spent, what you harvested and what you sold it for. Write it the same day - a memory from three weeks later is already wrong. Even ten lines per season, kept for two years, will show you which operation or which input actually paid for itself.',
        hi: 'खेती बेहतर चलाने के लिए एक सादी नोटबुक काफ़ी है। हर फसल और सीजन के लिए एक पन्ना रखें, चार भागों में: कब और क्या काम किया, क्या खर्च हुआ, कितनी उपज निकली और कितने में बिकी। उसी दिन लिखें - तीन हफ्ते बाद की याद पहले से गलत होती है। हर सीजन दस पंक्तियां भी, दो साल तक लिखें, तो दिखेगा कि किस काम या किस आदान ने अपनी लागत निकाली।',
      },
      steps: {
        en: [
          'Get a cheap ruled notebook or use a phone note - the format matters less than the habit.',
          'One page per crop per season, with the date and the operation in the first column.',
          'Write the cost the same day, in the same column, so the totals can be added at the end.',
          'Photograph the bills and keep them with the page; the bill is the record, the note is the memory.',
          'At the end of the season, add three lines: total cost, total received, and the difference.',
        ],
        hi: [
          'सस्ती रेखांकित नोटबुक लें या फ़ोन के नोट का उपयोग करें - फॉर्मेट से ज़्यादा आदत ज़रूरी है।',
          'हर फसल-सीजन के लिए एक पन्ना, पहले कॉलम में तारीख और किया गया काम।',
          'खर्च उसी दिन उसी कॉलम में लिखें, ताकि अंत में जोड़ा जा सके।',
          'बिलों की तस्वीर लेकर पन्ने के साथ रखें; बिल ही असली रिकॉर्ड है, नोट सिर्फ़ याद है।',
          'सीजन के अंत में तीन पंक्तियां जोड़ें: कुल खर्च, कुल प्राप्ति और अंतर।',
        ],
      },
      precautions: {
        en: [
          'Do not mix two crops or two seasons on the same page - you will not be able to total them later.',
          'Do not rely on the notebook alone; keep the bills and, where possible, the bank or market records too.',
        ],
        hi: [
          'एक पन्ने पर दो फसल या दो सीजन न मिलाएं - बाद में जोड़ नहीं पाएंगे।',
          'सिर्फ़ नोटबुक पर निर्भर न रहें; बिल और जहाँ हो सके बैंक या बाज़ार के रिकॉर्ड भी रखें।',
        ],
      },
      consult: {
        en: 'Your KVK can suggest a record format for your crop and often has simple farm record sheets you can copy, and the state agriculture department may run a farm accounting training or demo.',
        hi: 'आपका KVK आपकी फसल के लिए रिकॉर्ड का प्रारूप बता सकता है और अक्सर सादी फसल रिकॉर्ड शीट देता है जिसे आप नकल कर सकते हैं, और राज्य कृषि विभाग कृषि लेखांकन प्रशिक्षण या प्रदर्शन चला सकता है।',
      },
    },
    sources: [ICAR, AGRIWELFARE, general('Simple farm record sheet - ask your KVK for a copy')],
    needsContext: true,
    contextHints: ['Crops you grow', 'Do you already keep any record?', 'Paper or phone?'],
  }),

  defineEntry({
    id: 'k-labour-hiring',
    category: 'economics',
    keywords: [
      'hire workers',
      'labour wage',
      'daily wage',
      'mazdoor kaise',
      'mazdoori',
      'batai kya hai',
      'wage rate',
      'worker shortage',
      'मजदूरी',
      'दिहाड़ी',
      'मजदूर कैसे रखें',
      'बेगार',
      'मजदूर की कमी',
      'majdoori kitni',
    ],
    question: 'Hiring workers and wage decisions',
    questionHi: 'मजदूर रखना और मजदूरी तय करना',
    content: {
      direct: {
        en: 'Wages are local: they differ between villages, between crops and between peak and slack weeks, so ask around rather than assume. Put the work in the app\'s Jobs section with the activity, crop, date, village and wage - a clear post attracts the right people. Agree the wage, the hours, the payment day and the amenities (water, shade, food, transport help) in front of a witness, and keep the agreement simple and written. During peak weeks, plan earlier and pay on time - reliable payment is what brings workers back.',
        hi: 'मजदूरी स्थानीय होती है: गाँवों में, फसलों में और व्यस्त व कम व्यस्त के हफ्तों में अलग होती है, इसलिए अंदाज़ा लगाने के बजाद पूछकर पता करें। काम को इस ऐप के जॉब्स हिस्से में काम, फसल, तारीख, गाँव और मजदूरी के साथ डालें - साफ़ पोस्ट सही लोगों को आकर्षित करती है। मजदूरी, घंटे, भुगतान का दिन और सुविधाएं (पानी, छाया, खाना, यात्रा मदद) गवाह के सामने तय करें, और सहमति सादी और लिखित रखें। व्यस्त हफ्तों में पहले से योजना बनाएं और समय पर भुगतान करें - भरोसेमंद भुगतान ही मजदूरों को दोबारा लाता है।',
      },
      steps: {
        en: [
          'Break the work into tasks with the number of people, the dates and the duration for each.',
          'Ask two or three local people or nearby employers what the going daily wage is this season.',
          'Post the job in KisanSathi Jobs with activity, crop, date, village and wage so it is visible to the right people.',
          'Confirm the start time, the work hours, the payment day and where to report, in front of a witness.',
          'Keep water and shade available at the work site - it costs little and it decides whether people return.',
          'Pay on the agreed day, every time, even if the harvest is small.',
        ],
        hi: [
          'काम को अलग-अलग कामों में बाँटें, हर काम के लिए लोगों की संख्या, तारीख और अवधि लिखें।',
          'दो-तीन स्थानीय लोगों या पास के रोज़गार दाताओं से इस मौसम की चलती दिहाड़ी पूछें।',
          'नौकरी किसानसाथी जॉब्स में काम, फसल, तारीख, गाँव और मजदूरी के साथ डालें ताकि सही लोगों तक पहुँचे।',
          'शुरू होने का समय, काम के घंटे, भुगतान का दिन और कहाँ आना है - गवाह के सामने तय करें।',
          'काम की जगह पर पानी और छाया रखें - खर्च कम है और इसी से लोग दोबारा आते हैं।',
          'तय तारीख को भुगतान हर बार करें, चाहे फसल छोटी हो।',
        ],
      },
      precautions: {
        en: [
          'Do not agree verbally and then argue later - put the wage and hours in writing, even on a phone note.',
          'Check the minimum wage notification for agricultural work in your state if a dispute arises.',
        ],
        hi: [
          'मौखिक तय करके बाद में बहस न करें - मजदूरी और घंटे लिखित रखें, फ़ोन के नोट पर भी।',
          'विवाद होने पर अपने राज्य के कृषि कार्य के न्यूनतम मजदूरी आदेश की जांच करें।',
        ],
      },
      consult: {
        en: 'The local agriculture office or panchayat can tell you the going local wage and whether a minimum wage notification applies to agricultural work in your state; nearby job listings in this app also show what people have posted.',
        hi: 'स्थानीय कृषि कार्यालय या पंचायत आपको स्थानीय चलती मजदूरी बता सकेगी और यह भी कि आपके राज्य में कृषि कार्य पर न्यूनतम मजदूरी आदेश लागू होता है या नहीं; इस ऐप में पास के जॉब विज्ञापन भी दिखाते हैं कि लोगों ने क्या डाला है।',
      },
    },
    sources: [
      { title: 'KisanSathi Jobs (in-app)', url: '/jobs', kind: 'general' },
      AGRIWELFARE,
      general('Local wage range - check nearby listings and the panchayat'),
    ],
    needsContext: true,
    contextHints: ['Activity and crop', 'Village/district', 'Date and duration', 'How many workers'],
  }),
]
