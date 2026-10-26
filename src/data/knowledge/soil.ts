import { AGRIWELFARE, ICAR, SOIL_HEALTH, TNAU, general } from './sources'
import { defineEntry, type KnowledgeEntry } from './types'

/**
 * ---------------------------------------------------------------------------
 * Soil types, testing, nutrients and compost
 * ---------------------------------------------------------------------------
 * The assistant never gives a fertilizer dose: quantities depend on the soil
 * test, the crop, the yield target and the local recommendation. It explains
 * how to get the test, how to read the result and how to build fertility.
 */

export const SOIL_ENTRIES: KnowledgeEntry[] = [
  defineEntry({
    id: 'k-soil-type',
    category: 'soil',
    keywords: [
      'soil type',
      'what kind of soil',
      'sandy soil',
      'clay soil',
      'loamy soil',
      'black soil',
      'red soil',
      'alluvial soil',
      'soil texture',
      'मिट्टी का प्रकार',
      'किस मिट्टी',
      'काली मिट्टी',
      'रेतीली मिट्टी',
      'दोमट मिट्टी',
      'मिट्टी पहचान',
      'mitti ka prakar',
    ],
    question: 'Identifying soil type and what it means',
    questionHi: 'मिट्टी का प्रकार कैसे पहचानें',
    content: {
      direct: {
        en: 'Indian soils fall into broad groups: alluvial (most of the plains - river-deposited, generally fertile), black or regur (heavy clay, high moisture capacity, common in the Deccan), red (formed on crystalline rock, needs organic matter), laterite (humid tropics, heavily leached), sandy/desert (low water holding, needs frequent light irrigation) and saline/alkaline. The practical way to know your soil is a Soil Health Card test - a home "ribbon test" only gives a rough idea.',
        hi: 'भारतीय मिट्टियों के मुख्य समूह हैं: जलोढ़ (मैदानों का बड़ा हिस्सा - नदियों से जमा, आमतौर पर उपजाऊ), काली या रेगुर (भारी चिकनी मिट्टी, नमी रोकने की क्षमता अधिक, दक्कन में), लाल (क्रिस्टलीय चट्टान से बनी, जैविक पदार्थ की ज़रूरत), लेटेराइट (नम उष्ण कटिबंध, घुलन अधिक), रेती/रेगिस्तान (जल धारण कम, बार-बार हल्की सिंचाई चाहिए) और लवणीय/क्षारीय। अपनी मिट्टी का पक्का पता मृदा स्वास्थ्य कार्ड की जांच से ही चलता है - घर की "रीबन टेस्ट" से सिर्फ़ अंदाज़ा लगता है।',
      },
      steps: {
        en: [
          'Feel the soil in the field: gritty (sandy), smooth and sticky (clay), or smooth and crumbly (loam).',
          'Dig 30 cm and check the colour: dark brown/black, reddish, yellowish or greyish-white with a white crust (salinity).',
          'Check drainage after rain: water standing for hours means poor drainage; water vanishing instantly means too sandy.',
          'Get a Soil Health Card from your state agriculture department or the Soil Health Card portal - it lists pH, organic carbon and available nutrients.',
          'Write the soil type on a note with your field number and revisit it every year with the card.',
        ],
        hi: [
          'खेत की मिट्टी छूकर देखें: रेती जैसी दानेदार (रेती), चिकनी और चिपचिपी (चिकनी), या मुलायम और भुरभुरी (दोमट)।',
          '30 सेमी खोदकर रंग देखें: गहरा भूरा/काला, लाल, पीला या सफ़ेदी-भूरा जिस पर सफ़ेद परत जमी हो (लवण)।',
          'बारिश के बाद जल निकास देखें: घंटों तक पानी खड़ा रहे तो निकासी कमज़ोर; तुरंत गायब हो जाए तो मिट्टी बहुत रेती है।',
          'अपने राज्य कृषि विभाग या मृदा स्वास्थ्य कार्ड पोर्टल से मृदा स्वास्थ्य कार्ड लें - इसमें pH, जैविक कार्बन और उपलब्ध पोषक तत्व दिए होते हैं।',
          'मिट्टी का प्रकार खेत नंबर के साथ नोट करें और हर साल कार्ड के साथ दोबारा देखें।',
        ],
      },
      precautions: {
        en: [
          'Do not judge a field by one spot; check three or four places, including the low corner.',
          'Do not apply lime or gypsum without a test - the wrong dose can make a soil problem worse.',
        ],
        hi: [
          'खेत का आकलन एक जगह से मत करें; तीन-चार जगह देखें, खासकर निचले कोने में।',
          'जांच के बिना चूना या जिप्सम न डालें - गलत मात्रा मिट्टी की समस्या और बढ़ा सकती है।',
        ],
      },
      consult: {
        en: 'Your KVK or the Soil Health Card lab can classify your soil properly and advise which crops and amendments suit it. ICAR and the state agriculture university publish general soil-management guidance.',
        hi: 'आपका KVK या मृदा स्वास्थ्य कार्ड प्रयोगशाला आपकी मिट्टी की सही पहचान कराकर बता देगा कि कौन सी फसलें और कौन सा सुधार उपयुक्त है। ICAR और राज्य कृषि विश्वविद्यालय सामान्य मृदा-प्रबंधन जानकारी देते हैं।',
      },
    },
    sources: [ICAR, SOIL_HEALTH, TNAU, general('Soil identification - confirm with your KVK')],
    needsContext: true,
    contextHints: ['Location/district', 'Irrigation source', 'Do you have a Soil Health Card?'],
  }),

  defineEntry({
    id: 'k-soil-test',
    category: 'soil',
    keywords: [
      'soil test',
      'soil testing',
      'soil health card',
      'soil sample',
      'soil analysis',
      'test my soil',
      'mitti ki jaanch',
      'मिट्टी की जांच',
      'मृदा परीक्षण',
      'मृदा स्वास्थ्य कार्ड',
      'soil health card kaise',
      'mitti ki janch',
      'mitti ki testing',
      'mitti testing',
      'soil kaise check kare',
    ],
    question: 'Getting and reading a soil test',
    questionHi: 'मिट्टी की जांच कैसे कराएं और कैसे पढ़ें',
    content: {
      direct: {
        en: 'A soil test tells you three things: pH (how acidic or alkaline the soil is), organic carbon (how much life and nutrient-holding capacity it has) and available nutrients (what the soil can actually give the crop this season). Get it from the state Soil Health Card programme through your agriculture office or KVK, or through a recognised soil testing lab. The number on the card tells you what to add - the dose has to come from the recommendation for your crop and soil.',
        hi: 'मिट्टी की जांच तीन बातें बताती है: pH (मिट्टी कितनी अम्लीय या क्षारीय है), जैविक कार्बन (कितनी ज़िंदगी और पोषक तत्व रोकने की क्षमता है) और उपलब्ध पोषक तत्व (मिट्टी इस सीजन फसल को वास्तव में क्या दे सकती है)। यह आपके कृषि कार्यालय या KVK के ज़रिए राज्य मृदा स्वास्थ्य कार्ड कार्यक्रम से, या किसी मान्यता प्राप्त मृदा परीक्षण प्रयोगशाला से कराएं। कार्ड पर लिखी संख्या बताती है कि क्या डालना है - मात्रा आपकी फसल और मिट्टी की सिफ़ारिश से आएगी।',
      },
      steps: {
        en: [
          'Collect samples from 8-10 spots across the field in a zigzag, at about 15 cm depth, avoiding bunds and dung spots.',
          'Mix the small amounts together in a clean bucket, then take about half a kilogram from the mixture.',
          'Dry it in shade (never in direct sun), crumble it, and pass it through a 2 mm sieve.',
          'Fill the sample form with crop, field, village, date and the previous crop, and hand it to the lab or KVK.',
          'When the report arrives, read pH, organic carbon and the available nutrient values, and ask the KVK what the report means for your next crop.',
        ],
        hi: [
          'खेत में ज़िग-ज़ैग तरीके से 8-10 जगहों से, लगभग 15 सेमी गहराई से नमूना लें; मेड़ और गोबर के ढेर से बचें।',
          'साफ़ बाल्टी में थोड़े-थोड़े नमूने मिलाएं, फिर मिश्रण में से लगभग आधा किलो निकालें।',
          'छाया में सुखाएं (धूप में कभी नहीं), मिट्टी को बारीक करें और 2 मिमी की छलनी से छान लें।',
          'फसल, खेत नंबर, गाँव, तारीख और पिछली फसल भरकर फॉर्म में दें और प्रयोगशाला या KVK को दें।',
          'रिपोर्ट आने पर pH, जैविक कार्बन और उपलब्ध पोषक तत्व पढ़ें, और अगली फसल के लिए इसका क्या मतलब है, KVK से पूछें।',
        ],
      },
      precautions: {
        en: [
          'Do not send a sample that has been mixed with fertiliser, manure or salt - the result will be wrong.',
          'Do not use a soil test from more than two or three seasons ago; the field changes.',
        ],
        hi: [
          'खाद, गोबर या नमक मिला नमूना न भेजें - रिजल्ट गलत आएगा।',
          'दो-तीन सीजन से पुरानी मिट्टी की जांच का इस्तेमाल न करें; खेत बदलता रहता है।',
        ],
      },
      consult: {
        en: 'The Soil Health Card portal and your state agriculture department run the sampling and testing service, usually free or at a nominal charge through your village or block office. Your KVK interprets the report and writes the fertilizer recommendation for your crop.',
        hi: 'मृदा स्वास्थ्य कार्ड पोर्टल और आपका राज्य कृषि विभाग नमूना और जांच की सुविधा चलाते हैं, आमतौर पर गाँव या ब्लॉक कार्यालय से मुफ़्त या नाम मात्र की फीस में। आपका KVK रिपोर्ट समझकर आपकी फसल के लिए खाद की सिफ़ारिश लिखता है।',
      },
    },
    sources: [SOIL_HEALTH, ICAR, AGRIWELFARE, TNAU],
    needsContext: true,
    contextHints: ['Crop to be grown', 'Which field', 'Do you have a Soil Health Card already?'],
  }),

  defineEntry({
    id: 'k-compost',
    category: 'soil',
    keywords: [
      'compost',
      'vermicompost',
      'farmyard manure',
      'fym',
      'organic manure',
      'manure',
      'cow dung',
      'गोबर की खाद',
      'कम्पोस्ट',
      'वर्मी कम्पोस्ट',
      'जैविक खाद',
      'कूड़ा',
      'जैविक',
      'compost kaise banaye',
      'gobar ki khad',
    ],
    question: 'Making and using compost / organic manure',
    questionHi: 'कम्पोस्ट और जैविक खाद कैसे बनाएं और कब डालें',
    content: {
      direct: {
        en: 'Compost turns crop residue, weeds and animal dung into a stable, soil-building material. The recipe is simple: brown (dry, carbon-rich) material such as straw or stalks, green (fresh, nitrogen-rich) material such as weeds or vegetable waste, animal dung, and water - layered together, kept moist like a wrung-out sponge, and turned every few weeks. Farmyard manure and vermicompost are the ready-made versions. Organic matter improves structure and water holding, but it works slowly, so apply it before sowing and expect the benefit over seasons.',
        hi: 'कम्पोस्ट फसल अवशेष, खरपतवार और गोबर को मिट्टी को मज़बूत बनाने वाली स्थिर खाद में बदल देता है। तरीका आसान है: भूरा (सूखा, कार्बन वाला) पदार्थ जैसे पुआल या डंठल, हरा (ताज़ा, नाइट्रोजन वाला) पदार्थ जैसे खरपतवार या सब्ज़ी के छिलके, गोबर और पानी - परतें बनाकर रखें, नमी "निचोड़े हुए स्पंज" जैसी रखें, और हर कुछ हफ्ते में पलटें। गोबर की खाद और वर्मी कम्पोस्ट तैयार रूप में मिलते हैं। जैविक पदार्थ मिट्टी की बनावट और पानी सोखने की क्षमता बढ़ाता है, पर असर धीरे होता है, इसलिए बुवाई से पहले डालें और फल अगले सीजनों में दिखें।',
      },
      steps: {
        en: [
          'Pick a shaded spot near the house or field with drainage; a simple pit or a low wall of bricks works.',
          'Layer dry stalks or straw first, then a layer of fresh green material, then a thin layer of dung, and sprinkle water over each layer.',
          'Cover the pile completely with soil, straw or a plastic sheet so it does not dry out or get washed away in rain.',
          'Turn it every 2-3 weeks to add air; the pile should feel warm in the middle and smell of earth, not of rot.',
          'It is ready in roughly 2-3 months when the material is dark, crumbly and the original pieces are no longer recognisable.',
          'Spread it evenly on the field and mix it into the top soil before sowing - the quantity for your crop should follow your soil test.',
        ],
        hi: [
          'घर या खेत के पास छायादार जगह चुनें जहाँ पानी निकले; एक गड्ढा या ईंटों की नीची दीवार काफ़ी है।',
          'पहले सूखी पुआल/डंठल की परत, फिर ताज़ा हरा पदार्थ, फिर गोबर की पतली परत, हर परत पर पानी छिड़कें।',
          'पूरे ढेर को मिट्टी, पुआल या प्लास्टिक से ढक दें ताकि सूखे न जाए और बारिश में बह न जाए।',
          'हर 2-3 हफ्ते में पलटें ताकि हवा मिले; बीच में गर्मी होनी चाहिए और गंध सड़ी नहीं, मिट्टी जैसी होनी चाहिए।',
          'लगभग 2-3 महीने में तैयार - तब तक सामग्री गहरी काली, भुरभुरी हो और मूल चीज़ें पहचान में न आएं।',
          'खेत में बराबर बिखोरकर बुवाई से पहले ऊपरी मिट्टी में मिलाएं - आपकी फसल के लिए मात्रा आपकी मृदा जांच के अनुसार हो।',
        ],
      },
      precautions: {
        en: [
          'Never use raw manure straight on a seedbed or mix it into the planting row - it burns roots and spreads weed seeds.',
          'Never compost plastic, glass or pesticide packets; keep them out of the pile.',
        ],
        hi: [
          'कच्ची गोबर की खाद सीधे बीज-क्यारी या बुवाई की कतार में न मिलाएं - इससे जड़ें जल जाती हैं और खरपतवार के बीज फैलते हैं।',
          'प्लास्टिक, कांच या कीटनाशक की पर्चियां कम्पोस्ट में न डालें; ढेर से बाहर रखें।',
        ],
      },
      consult: {
        en: 'Your KVK can guide you on local compost recipes, how much organic matter your soil needs, and whether vermicompost or FYM suits your crop and price.',
        hi: 'आपका KVK आपको स्थानीय कम्पोस्ट बनाने के तरीके, आपकी मिट्टी को कितनी जैविक खाद चाहिए, और आपकी फसल व भाव के हिसाब से वर्मी कम्पोस्ट या गोबर की खाद कौन सी उपयुक्त है, बता सकेगा।',
      },
    },
    sources: [ICAR, TNAU, general('Compost practice - confirm locally')],
    needsContext: true,
    contextHints: ['Crop', 'Amount of residue/waste available', 'Field size'],
  }),

  defineEntry({
    id: 'k-nutrient-management',
    category: 'soil',
    keywords: [
      'nutrient deficiency',
      'deficiency symptoms',
      'nitrogen deficiency',
      'phosphorus deficiency',
      'potassium deficiency',
      'yellow leaves',
      'fertilizer dose',
      'how much fertilizer',
      'urea',
      'उर्वरक',
      'पोषक तत्व',
      'कमी के लक्षण',
      'यूरिया',
      'खाद कितनी',
      'fertilizer kitna',
      'poshan ki kami',
      'improve soil',
      'soil improvement',
      'mitti behtar',
    ],
    question: 'Nutrient deficiency and fertilizer planning',
    questionHi: 'पोषक तत्वों की कमी और खाद की योजना',
    content: {
      direct: {
        en: 'Plants show what they are short of. Older leaves pale and yellow usually point to nitrogen; older leaves with purple or red edges point to phosphorus; leaf-edge scorch and weak stems on fruiting crops often point to potassium. But symptoms overlap with disease, water stress and salinity - confirm with a soil test before you buy anything. The quantity of any fertiliser depends on the soil test, the crop, the target yield and the local recommendation, so this assistant will not guess a dose for you.',
        hi: 'पौधे बताते हैं कि उन्हें किसकी कमी है। पुराने पत्ते पीले-हरे होना आमतौर पर नाइट्रोजन की कमी दिखाता है; पुराने पत्तों के किनारे बैंगनी या लाल होना फॉस्फोरस की कमी; पत्तों के किनारे सूखना और फल वाली फसलों में कमज़ोर तना अक्सर पोटाश की कमी। पर ये लक्षण रोग, पानी की कमी और लवण में भी दिखते हैं - खाद खरीदने से पहले मृदा जांच से पुष्टि करें। किसी भी खाद की मात्रा मृदा जांच, फसल, अपेक्षित उपज और स्थानीय सिफ़ारिश पर निर्भर है, इसलिए यह सहायक मात्रा अंदाज़े से नहीं बताएगा।',
      },
      steps: {
        en: [
          'Look at the oldest leaves first and compare one affected plant with a healthy one from the same spot.',
          'Note the pattern: whole field, patches along a bund, or only one row - pattern points to the cause.',
          'Get a soil test before buying fertiliser, and take the report to your KVK for a crop-specific recommendation.',
          'Build organic matter with compost and crop residues - it improves the use of any fertiliser you apply.',
          'Split the application instead of applying everything at sowing, and keep a record of what you applied and when.',
        ],
        hi: [
          'सबसे पुराने पत्ते पहले देखें और एक प्रभावित पौधे की तुलना उसी जगह के स्वस्थ पौधे से करें।',
          'पैटर्न लिखें: पूरा खेत, मेड़ के साथ टुकड़े, या सिर्फ एक कतार - पैटर्न कारण बताता है।',
          'खाद खरीदने से पहले मृदा जांच कराएं और रिपोर्ट अपने KVK को दें, फसल-विशेष सिफ़ारिश पाएं।',
          'कम्पोस्ट और फसल अवशेष से जैविक पदार्थ बढ़ाएं - इससे दी गई हर खाद का उपयोग बेहतर होता है।',
          'सारी खाद एक साथ न डालें, बुवाई के समय बांटकर दें, और क्या दिया कब दिया उसकी नोटबुक रखें।',
        ],
      },
      precautions: {
        en: [
          'Do not add urea to dry soil or just before heavy rain - nitrogen is lost as gas or washes away.',
          'Do not pile fertiliser next to a plant or in one spot; it burns roots and wastes nutrients.',
        ],
        hi: [
          'सूखी मिट्टी में या तेज़ बारिश से ठीक पहले यूरिया न डालें - नाइट्रोजन गैस बनकर उड़ जाती है या बह जाती है।',
          'खाद को पौधे के बगल में या एक ही जगह ढेर न लगाएं; इससे जड़ें जल जाती हैं और पोषक तत्व बर्बाद होते हैं।',
        ],
      },
      consult: {
        en: 'The fertiliser quantity for your field should come from your soil test and your KVK recommendation, or from the state agriculture department\'s package of practices for your crop. This assistant will not invent a dose, and neither should a forwarded message.',
        hi: 'आपके खेत के लिए खाद की मात्रा आपकी मृदा जांच और KVK की सिफ़ारिश या राज्य कृषि विभाग की फसल-विशेष पैकेज ऑफ प्रैक्टिस से आनी चाहिए। यह सहायक मात्रा नहीं बनाएगा, और आगे भेजा गया संदेश भी नहीं।',
      },
    },
    sources: [ICAR, SOIL_HEALTH, TNAU, general('Nutrient management - confirm with your KVK')],
    needsContext: true,
    contextHints: ['Crop and stage', 'Symptoms (which leaves, what colour)', 'Soil test available?', 'Irrigation source'],
  }),
]
