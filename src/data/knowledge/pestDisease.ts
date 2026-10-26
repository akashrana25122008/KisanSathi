import { ICAR, TNAU, general } from './sources'
import { defineEntry, type KnowledgeEntry } from './types'

/**
 * ---------------------------------------------------------------------------
 * Pests, diseases, symptom triage and integrated pest management
 * ---------------------------------------------------------------------------
 * Two rules hold across this whole file:
 *   1. A symptom match is a *possibility*, not a confirmed diagnosis.
 *   2. No product names, no doses, no mixtures. The assistant sends the
 *      farmer to the KVK for the locally approved option and quantity.
 */

export const PEST_DISEASE_ENTRIES: KnowledgeEntry[] = [
  defineEntry({
    id: 'k-scouting',
    category: 'pest-disease',
    keywords: [
      'scouting',
      'pest scouting',
      'how to inspect field',
      'monitoring',
      'field inspection',
      'check for pests',
      'निगरानी',
      'निगरानी कैसे',
      'खेत में देखना',
      'कीट की जांच',
      'अवलोकन',
    ],
    question: 'How to scout a field for pests and disease',
    questionHi: 'खेत में कीट और रोग की निगरानी कैसे करें',
    content: {
      direct: {
        en: 'Scouting means walking the field in a fixed pattern every week and counting what you find. Walk a diagonal and the four sides, look at the top of the plant and under the leaves, and check a few plants at each spot. Count the plants affected and the insects seen, and write the numbers down - a rising trend matters far more than a single bad leaf.',
        hi: 'निगरानी का मतलब है हर हफ्ते खेत को एक तय तरीके से देखना और गिनना कि क्या मिला। एक डायगनल और चार किनारे चलें, पौधे के ऊपर और पत्तों के नीचे देखें, और हर जगह कुछ पौधे जांचें। प्रभावित पौधे और दिखे कीट गिनें और संख्या लिखें - बढ़ता हुआ रुझान एक खराब पत्ते से कहीं ज़्यादा मायने रखता है।',
      },
      steps: {
        en: [
          'Fix one route - for example, 5 spots of 10 plants each - and use the same route every week.',
          'Check the top of the plant, the underside of leaves, the stem base and the soil surface.',
          'Shake a few plants over a white cloth or an open palm; small soft-bodied insects fall out and are easy to miss otherwise.',
          'Count affected plants out of the plants inspected, and note where in the field they are.',
          'Record date, crop, growth stage, the count and the weather - a three-year record tells you a lot about your own field.',
        ],
        hi: [
          'एक रास्ता तय करें - जैसे 5 जगह, हर जगह 10 पौधे - और हर हफ्ते वही रास्ता लें।',
          'पौधे के ऊपर, पत्तों के नीचे, तने के आधार और मिट्टी की सतह - सब जांचें।',
          'कुछ पौधों को सफ़ेद कपड़े या खुले हाथ पर हिलाएं; नरम शरीर वाले छोटे कीट गिरकर दिखते हैं, वरना चूक जाते हैं।',
          'जांचे गए पौधों में से कितने प्रभावित हैं, यह गिनें और खेत में कहाँ हैं, यह लिखें।',
          'तारीख, फसल, अवस्था, गिनती और मौसम दर्ज करें - तीन साल का रिकॉर्ड आपके खेत के बारे में बहुत कुछ बता देता है।',
        ],
      },
      precautions: {
        en: [
          'Do not scout only the field edge; pests often start in the middle where humidity and plant density are higher.',
          'Do not spray just because you saw one insect - first check how many plants are actually affected.',
        ],
        hi: [
          'सिर्फ खेत के किनारे की निगरानी न करें; कीट अक्सर बीच में शुरू होते हैं जहां नमी और पौधों की घनत्व ज़्यादा होती है।',
          'एक कीट देखकर छिड़काव न करें - पहले देखें कि वास्तव में कितने पौधे प्रभावित हैं।',
        ],
      },
      consult: {
        en: 'Share your counts with your KVK or agriculture officer. When a count crosses their threshold for your crop and stage, they can tell you the right action - cultural, biological or chemical - for your area.',
        hi: 'अपनी गिनती अपने KVK या कृषि अधिकारी को बताएं। जब गिनती आपकी फसल और अवस्था की सीमा से आगे बढ़े, तो वे बता सकते हैं कि आपके क्षेत्र में सही कार्रवाई कौन सी है - सांस्कृतिक, जैविक या रासायनिक।',
      },
    },
    sources: [ICAR, TNAU, general('Field scouting method - confirm locally')],
    needsContext: true,
    contextHints: ['Crop', 'Growth stage', 'Which symptoms have you seen?'],
  }),

  defineEntry({
    id: 'k-ipm',
    category: 'pest-disease',
    keywords: [
      'ipm',
      'integrated pest management',
      'integrated management',
      'biological control',
      'natural pest control',
      'without chemicals',
      'organic pest control',
      'जैविक खेती',
      'कीट प्रबंधन',
      'एकीकृत कीट प्रबंधन',
      'बिना दवा',
      'ipm kya hai',
      'kida kaise control',
      'kide control',
      'kida marne',
      'kida udane',
    ],
    question: 'Integrated pest management',
    questionHi: 'एकीकृत कीट प्रबंधन (IPM)',
    content: {
      direct: {
        en: 'IPM is a decision ladder, not a product. Start with prevention (resistant varieties, clean seed, rotation, correct spacing and sowing date), then use mechanical and cultural measures (trap crops, removing infected parts, traps, barriers), then conserve natural enemies, and only as a last step use a chemical - and only the one your local advisory recommends, at the label dose, with the right waiting period. Stop treating when the pest is below the damage threshold, because a few survivors help the natural enemies.',
        hi: 'IPM एक निर्णय-सीढ़ी है, कोई दवा नहीं। पहले बचाव (रोग-रोधी किस्में, साफ़ बीज, फसल चक्र, सही दूरी और बुवाई तारीख), फिर यांत्रिक और सांस्कृतिक उपाय (ट्रैप फसल, संक्रमित हिस्से हटाना, ट्रैप, बाधा), फिर प्राकृतिक शत्रु बचाना, और सबसे आखिर में रासायनिक उपाय - और वह भी वही जो स्थानीय सलाह बताए, लेबल की मात्रा में और सही प्रतीक्षा अवधि के साथ। कीट के नुकसान की सीमा से नीचे आ जाने पर छिड़काव बंद कर दें, क्योंकि कुछ बचे हुए कीट प्राकृतिक शत्रुओं के काम आते हैं।',
      },
      steps: {
        en: [
          'Prevent: choose a tolerant variety, treat seed, rotate crops and plant on the recommended date.',
          'Monitor: scout weekly and keep the counts - you cannot make a decision without numbers.',
          'Correct the environment: fix drainage and spacing, remove alternate hosts and crop residue, and rotate the field.',
          'Use traps: light traps, pheromone traps, sticky traps and yellow/blue traps for monitoring or mass trapping.',
          'Conserve natural enemies: ladybird beetles, lacewings, spiders, hoverflies and parasitic wasps do a lot of work for free.',
          'If a chemical step is needed, follow the local advisory exactly - product, dose, timing and waiting period.',
        ],
        hi: [
          'बचाव करें: सहनशील किस्म चुनें, बीज उपचारित करें, फसल चक्र अपनाएं और अनुशंसित तारीख पर बुवाई करें।',
          'निगरानी करें: हर हफ्ते निगरानी करें और गिनती लिखे रखें - संख्या के बिना निर्णय नहीं हो सकता।',
          'पर्यावरण सुधारें: निकासी और दूरी ठीक करें, वैकल्पिक पौधे और फसल अवशेष हटाएं, और खेत का चक्र बदलें।',
          'ट्रैप लगाएं: प्रकाश ट्रैप, फेरोमोन ट्रैप, चिपचिपे ट्रैप और पीले/नीले ट्रैप निगरानी या भारी पकड़ के लिए।',
          'प्राकृतिक शत्रु बचाएं: लेडीबर्ड बीटल, लेसविंग, मकड़ी, हॉवरफ्लाई और परजीवी वास्प बहुत मुफ़्त काम करते हैं।',
          'रासायनिक कदम ज़रूरी हो तो स्थानीय सलाह का साफ़ पालन करें - उत्पाद, मात्रा, समय और प्रतीक्षा अवधि।',
        ],
      },
      precautions: {
        en: [
          'Never mix two products together unless the label of one of them explicitly allows it - it can create a dangerous reaction.',
          'Do not spray during flowering or when bees are active on the crop; spray in the evening instead.',
          'Always wear the protection the label asks for, and keep children and animals away from the field after spraying.',
        ],
        hi: [
          'दो उत्पाद मिलाकर कभी न डालें जब तक कि एक के लेबल में साफ़ अनुमति न हो - खतरनाक प्रतिक्रिया हो सकती है।',
          'फूल अवस्था में या फसल पर मधुमक्खियां सक्रिय हों तो छिड़काव न करें; शाम को करें।',
          'लेबल में बताई सुरक्षा उपकरण हमेशा पहनें, और छिड़काव के बाद बच्चों और जानवरों को खेत से दूर रखें।',
        ],
      },
      consult: {
        en: 'Your KVK runs IPM training and tells you which locally available options work against the pests found in your area and crop. Ask for the threshold-based advisory for your next spray decision.',
        hi: 'आपका KVK IPM प्रशिक्षण चलाता है और बताता है कि आपके क्षेत्र और फसल में मिलने वाले कीटों के लिए कौन से स्थानीय विकल्प काम करते हैं। अगले छिड़काव के निर्णय के लिए सीमा-आधारित सलाह मांगें।',
      },
    },
    sources: [ICAR, TNAU, general('IPM practice - confirm the product and dose with your KVK')],
    needsContext: true,
    contextHints: ['Crop and stage', 'Which pest/disease?', 'How much of the field is affected?'],
  }),

  defineEntry({
    id: 'k-common-pests',
    category: 'pest-disease',
    keywords: [
      'aphid',
      'aphids',
      'whitefly',
      'whitefly',
      'thrips',
      'bollworm',
      'stem borer',
      'borer',
      'caterpillar',
      'mite',
      'insect pest',
      'माहू',
      'सफेद मक्खी',
      'थ्रिप्स',
      'सुंडी',
      'तना छेदक',
      'इल्ली',
      'कीट',
      'keeda',
    ],
    question: 'Common insect pests and what the symptoms suggest',
    questionHi: 'आम कीट और उनके लक्षण',
    content: {
      direct: {
        en: 'Common pests look different but leave readable clues. Aphids cluster on tender shoots and underside of leaves and cause curling with sticky honeydew. Whiteflies are tiny white insects that fly up when disturbed, usually with yellowing and leaf curl. Thrips give silvery streaks and black specks. Bollworm and other borers enter the stem or fruit, leaving a hole with frass around it. Mites cause fine stippling and webbing on the underside of leaves. These are possibilities, not a confirmed diagnosis - the same yellowing can come from water stress, nutrient shortage or disease.',
        hi: 'आम कीट अलग दिखते हैं पर साफ़ संकेत देते हैं। माहू कोमल शाखियों और पत्तों के नीचे जमा होते हैं और मरोड़ के साथ चिपचिपा मधु बनाते हैं। सफेद मक्खी बहुत छोटे सफेद कीट हैं जो छूने पर उड़ जाते हैं, आमतौर पर पीलापन और पत्ते मुड़ने के साथ। थ्रिप्स चाँदी जैसी लकीरें और काले बिंदु देते हैं। सुंडी और अन्य छेदक तना या फल में घुसकर छेद और उसके आसपास मल-मूत्र छोड़ते हैं। मकड़ी महीन धब्बे और जाले बनाती है। ये संभावनाएं हैं, पुष्टि नहीं - पीलापन पानी की कमी, पोषक की कमी या रोग से भी हो सकता है।',
      },
      steps: {
        en: [
          'Shake or tap a few affected plants over white paper and look at what falls - this identifies small insects quickly.',
          'Look for honeydew (sticky, shiny), sooty mould (black coating), silvering, webbing or entry holes - each points to a different group.',
          'Count affected plants and insects per plant, and note where they are in the field.',
          'Take photos of leaves, stems and fruit if you can - a clear photo helps the KVK identify it quickly.',
          'Before treating, check whether a large number of natural enemies is already present.',
        ],
        hi: [
          'कुछ प्रभावित पौधों को सफेद कागज़ पर हिलाएं और गिरने वाले कीट देखें - इससे छोटे कीट जल्दी पहचान में आ जाते हैं।',
          'मधु (चिपचिपा, चमकदार), काली फफूंद, चाँदी जैसी चमक, जाले या छेद - हर एक अलग समूह की ओर संकेत करता है।',
          'प्रभावित पौधे और प्रति पौधा कीट गिनें, और खेत में कहाँ हैं यह लिखें।',
          'संभव हो तो पत्तों, तनों और फलों की तस्वीर लें - साफ़ फोटो से KVK जल्दी पहचान लेता है।',
          'उपचार से पहले देखें कि क्या बहुत सारे प्राकृतिक शत्रु पहले से मौजूद हैं।',
        ],
      },
      precautions: {
        en: [
          'Do not start with a spray. Most problems can be reduced by removing the affected plants, fixing the schedule and protecting natural enemies.',
          'Do not apply any product on the basis of this list - the right option depends on the crop, the pest and your local approval.',
        ],
        hi: [
          'छिड़काव से शुरुआत न करें। ज़्यादातर समस्याएं प्रभावित पौधे हटाने, समय सुधारने और प्राकृतिक शत्रु बचाने से कम हो जाती हैं।',
          'इस सूची के आधार पर कोई उत्पाद न डालें - सही विकल्प फसल, कीट और आपके स्थानीय अनुमोदन पर निर्भर है।',
        ],
      },
      consult: {
        en: 'Show the KVK the insect or a photograph of it. They can confirm the identification and tell you the locally recommended option, dose and timing, plus whether your field is at a stage where treatment is even needed.',
        hi: 'KVK को कीट दिखाएं या उसकी तस्वीर दें। वे पहचान की पुष्टि करके स्थानीय अनुशंसित विकल्प, मात्रा और समय बताएंगे, और यह भी कि आपके खेत की अवस्था में उपचार ज़रूरी है या नहीं।',
      },
    },
    sources: [ICAR, TNAU, general('Pest identification - confirm with your KVK before treating')],
    needsContext: true,
    contextHints: ['Crop and stage', 'Which insect/where on the plant?', 'How many plants affected?', 'Recent weather'],
  }),

  defineEntry({
    id: 'k-common-diseases',
    category: 'pest-disease',
    keywords: [
      'blight',
      'late blight',
      'early blight',
      'rust',
      'smut',
      'mildew',
      'wilt',
      'disease in plants',
      'fungus',
      'leaf spot',
      'rot',
      'झुलसा',
      'रतुआ',
      'उकठा',
      'मिल्ड्यू',
      'उकठा रोग',
      'पत्ती धब्बे',
      'सड़न',
      'रोग',
      'blight kaise',
      'पत्ते पीले',
      'पत्ते काले',
      'पत्ते मुड़े',
      'पत्ते झड़ते',
    ],
    question: 'Common plant diseases and what the symptoms suggest',
    questionHi: 'आम पौधा रोग और उनके लक्षण',
    content: {
      direct: {
        en: 'Some symptom patterns give useful clues, but they are possibilities, not diagnoses. Water-soaked or dark brown patches that spread fast in cool, wet weather can be blight. Orange, yellow or brown powdery pustules on leaves or stems point to rust. Black or grey powdery heads on grain or seed heads suggest smut. White or grey powdery growth, and leaf margins drying, suggest mildew. Sudden wilting with green leaves often means a stem or root problem. Because a shortage of water or nutrients can look similar, confirm the cause before you act.',
        hi: 'कुछ लक्षण-पैटर्न उपयोगी संकेत देते हैं, पर वे संभावनाएं हैं, पुष्टि नहीं। ठंडे-गीले मौसम में तेज़ी से फैलते पानी-भीगे या गहरे भूरे धब्बे झुलसा हो सकते हैं। पत्तों या तनों पर नारंगी, पीले या भूरे चूर्ण जैसे फफोले रतुआ दिखाते हैं। दाने या बीज की झुंडी पर काला या भूरा चूर्ण उकठा बताता है। सफेद या भूरा चूर्ण जैसी वृद्धि और पत्तों का किनारा सूखना मिल्ड्यू दिखाता है। पत्ते हरे रहते हुए अचानक मुरझाना तना या जड़ की समस्या बताता है। क्योंकि पानी या पोषक की कमी भी ऐसा दिख सकती है, कार्रवाई से पहले कारण की पुष्टि करें।',
      },
      steps: {
        en: [
          'Note the pattern of the symptom: on leaves, stem, roots, fruit or the whole plant; spreading fast or slowly.',
          'Look at the underside of leaves and at the stem base - many signs start there.',
          'Check whether affected plants are scattered or in patches - patches point to drainage, soil or a soil-borne problem.',
          'Compare with a healthy plant from the same spot, and record the crop, stage and recent weather.',
          'Keep a sample of the affected plant (leaves, stem and roots with soil) for the KVK, and remove badly affected plants from the field.',
        ],
        hi: [
          'लक्षण का पैटर्न लिखें: पत्तों पर, तने पर, जड़ पर, फल पर या पूरे पौधे पर; तेज़ी से फैल रहा है या धीरे।',
          'पत्तों के नीचे और तने के आधार पर देखें - कई संकेत वहीं से शुरू होते हैं।',
          'जांचें कि प्रभावित पौधे बिखरे हैं या टुकड़ों में - टुकड़े निकासी, मिट्टी या मिट्टी-जनित रोग की ओर संकेत करते हैं।',
          'उसी जगह के स्वस्थ पौधे से तुलना करें, और फसल, अवस्था तथा हाल का मौसम लिखें।',
          'प्रभावित पौधे का नमूना (पत्ते, तना और जड़, साथ मिट्टी) KVK के लिए रखें, और बहुत प्रभावित पौधे खेत से हटा दें।',
        ],
      },
      precautions: {
        en: [
          'Do not compost or leave infected plant material in the field; it carries the problem into the next crop.',
          'Do not spray a fungicide until the problem is identified - the wrong product wastes money and can build resistance.',
          'Do not work in a wet field, because you spread the spores mechanically while walking.',
        ],
        hi: [
          'संक्रमित पौधों की चीज़ें कम्पोस्ट में न डालें और खेत में न छोड़ें; समस्या अगली फसल तक पहुँच जाती है।',
          'समस्या पहचाने बिना फफूंदनाशी न डालें - गलत उत्पाद पैसा बर्बाद करता है और प्रतिरोध बनाता है।',
          'गीले खेत में काम न करें, क्योंकि चलते-फिरते आप बीजाणु पैदा करते हैं।',
        ],
      },
      consult: {
        en: 'Take the sample to your KVK or agriculture office for identification and a written recommendation. They will tell you the correct product, dose and timing for your crop and area, and whether a spray is needed at all.',
        hi: 'नमूना अपने KVK या कृषि कार्यालय ले जाएं - पहचान और लिखित सिफ़ारिश के लिए। वे आपकी फसल और क्षेत्र के लिए सही उत्पाद, मात्रा और समय बताएंगे, और यह भी कि छिड़काव की ज़रूरत है या नहीं।',
      },
    },
    sources: [ICAR, TNAU, general('Disease identification - confirm with your KVK before treating')],
    needsContext: true,
    contextHints: ['Crop and growth stage', 'Symptoms (colour, shape, where on the plant)', 'Location/district', 'Recent weather'],
  }),

  defineEntry({
    id: 'k-biological-control',
    category: 'pest-disease',
    keywords: [
      'beneficial insects',
      'natural enemies',
      'ladybird',
      'trichogramma',
      'pheromone trap',
      'neem',
      'neem oil',
      'bio agent',
      'बायो कंट्रोल',
      'जैविक कीट नियंत्रण',
      'ट्राइकोग्रामा',
      'फेरोमोन ट्रैप',
      'नीम',
      'लाभदायक कीट',
    ],
    question: 'Natural enemies and biological control',
    questionHi: 'प्राकृतिक शत्रु और जैविक कीट नियंत्रण',
    content: {
      direct: {
        en: 'Natural enemies do a lot of the work for free: ladybird beetles and lacewing larvae eat aphids, hoverfly larvae eat aphids, parasitic wasps attack caterpillars and borers, spiders and assassin bugs take a general toll, and birds and frogs eat insects in the field. Pheromone and sticky traps work well for monitoring and mass trapping of specific insects. Neem-based and other botanical products can be useful, but they are still pesticides - use them on the label, and only after the pest is confirmed.',
        hi: 'प्राकृतिक शत्रु बिना खर्च के बहुत काम करते हैं: लेडीबर्ड बीटल और लेसविंग के लार्वे माहू खाते हैं, हॉवरफ्लाई के लार्वे माहू खाते हैं, परजीवी वास्प इल्लियों और छेदकों पर आक्रमण करते हैं, मकड़ी और assassin bug आम तौर पर शिकार करते हैं, और पक्षी-मेंगद खेत में कीट खाते हैं। फेरोमोन और चिपचिपे ट्रैप निगरानी और विशेष कीटों के भारी पकड़ के लिए अच्छे हैं। नीम आधारित और अन्य वनस्पति-उत्पाद उपयोगी हो सकते हैं, पर वे भी कीटनाशक हैं - लेबल के अनुसार और कीट की पुष्टि के बाद ही इस्तेमाल करें।',
      },
      steps: {
        en: [
          'Identify what is eating the pest before removing anything - a caterpillar on a leaf may be a parasitoid cocoon.',
          'Avoid broad-spectrum sprays during flowering and early season; they remove natural enemies first.',
          'Grow border plants and trap crops that host natural enemies and keep them in the field.',
          'Use pheromone traps at the recommended density for monitoring, and place them at canopy height.',
          'Keep spray equipment clean and calibrated, so you spray the crop and not the bund.',
        ],
        hi: [
          'कुछ भी हटाने से पहले पहचानें कि कीट को कौन खा रहा है - पत्ते पर इल्ली कभी परजीवी का कोकोन होती है।',
          'फूल अवस्था और सीजन की शुरुआत में व्यापक-स्पेक्ट्रम छिड़काव से बचें; ये पहले प्राकृतिक शत्रु हटा देते हैं।',
          'सीमा-पौधे और ट्रैप फसल लगाएं जो प्राकृतिक शत्रुओं को खेत में बनाए रखें।',
          'निगरानी के लिए अनुशंसित संख्या में फेरोमोन ट्रैप लगाएं और उन्हें फसल की ऊँचाई पर रखें।',
          'छिड़काव की मशीन साफ़ और ठीक-ठाक रखें, ताकि फसल पर छिड़के, मेड़ पर नहीं।',
        ],
      },
      precautions: {
        en: [
          'Do not release or buy biological agents without a proper source and advice - an unverified agent can carry disease.',
          'Do not expect an instant result; most natural enemies need one to two weeks to build up.',
        ],
        hi: [
          'बिना सही स्रोत और सलाह के जैविक एजेंट न खरीदें और न छोड़ें - असत्यापित एजेंट रोग ला सकता है।',
          'तुरंत परिणाम की उम्मीद न रखें; ज़्यादातर प्राकृतिक शत्रुओं को बढ़ने में एक-दो हफ्ते लगते हैं।',
        ],
      },
      consult: {
        en: 'Your KVK runs demonstrations on bio-agents and pheromone traps and can tell you which are available and effective in your district for the pest you are facing.',
        hi: 'आपका KVK जैविक एजेंट और फेरोमोन ट्रैप पर प्रदर्शन कराता है और बता सकता है कि आपके जिले में आपके कीट के लिए कौन से उपलब्ध और प्रभावी हैं।',
      },
    },
    sources: [ICAR, TNAU, general('Biological control - confirm locally available agents')],
    needsContext: true,
    contextHints: ['Crop', 'Which pest?', 'What have you already tried?'],
  }),
]
