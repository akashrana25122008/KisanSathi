import { DAHD, ICAR, NDDB, general } from './sources'
import { defineEntry, type KnowledgeEntry } from './types'

/**
 * ---------------------------------------------------------------------------
 * Livestock and poultry care
 * ---------------------------------------------------------------------------
 * General husbandry only. The assistant never gives a medicine, a vaccine
 * schedule or a dose for an animal - that belongs with a veterinarian.
 */

export const LIVESTOCK_ENTRIES: KnowledgeEntry[] = [
  defineEntry({
    id: 'k-dairy-care',
    category: 'livestock',
    keywords: [
      'cow care',
      'buffalo care',
      'cattle',
      'dairy',
      'milking',
      'cow feeding',
      'पशु',
      'गाय',
      'भैंस',
      'दुधारू',
      'दूध',
      'पालन',
      'दुग्ध व्यवसाय',
      'gaye ki dekh bhal',
      'gaay ki care',
      'gaay ko khana',
      'khana kaise dein',
      'gaay ko kya khilayein',
      'cow feed',
    ],
    question: 'Cattle and buffalo care',
    questionHi: 'गाय-भैंस की देखभाल',
    content: {
      direct: {
        en: 'Healthy cattle depend on three things: clean water, a balanced ration with enough roughage (dry fodder) and green fodder, and a clean shed with dry bedding. Watch the everyday signs - a cow that stops eating, drops milk, has loose dung, limps or has a rough coat is not well, even before a vet sees it. Keep records of each animal: date of calving, milk yield, service and treatment, so problems can be traced and repeated treatment avoided.',
        hi: 'स्वस्थ पशु तीन बातों पर निर्भर हैं: साफ़ पानी, पर्याप्त सूखा चारा और हरा चारा मिलाकर संतुलित राशन, और साफ़ बाड़ा जिसमें सूखा बिछौना हो। रोज़ के संकेत देखें - जो पशु खाना छोड़े, दूध कम करे, ढीला मल करे, लंगड़ाए या बाल बिखरे हों, वह ठीक नहीं है, वेटनर देखने से पहले ही। हर पशु का रिकॉर्ड रखें: ब्याने की तारीख, दूध उत्पादन, गर्भाधान और उपचार - ताकि समस्या पता चल सके और बार-बार दवा न देनी पड़े।',
      },
      steps: {
        en: [
          'Give green fodder, dry fodder and a balanced ration in separate containers, and remove leftovers daily.',
          'Provide clean drinking water at all times; check the trough for algae and clean it regularly.',
          'Keep the shed floor dry, swept and with fresh bedding - wet bedding causes hoof rot and mastitis.',
          'Milk at fixed times, dry the udder afterwards and check for swelling or small clots in the milk.',
          'Weigh or estimate the milk per animal every day so you notice a drop early.',
          'Keep a record book per animal with calving, service, vaccination and treatment dates.',
        ],
        hi: [
          'हरा चारा, सूखा चारा और संतुलित राशन अलग-अलग बर्तों में दें, और बचा हुआ चारा रोज़ हटा दें।',
          'हमेशा साफ़ पीने का पानी दें; नल में शैवाल जमा हो तो उसे नियमित रूप से साफ़ करें।',
          'बाड़े का फर्श सूखा, झाड़ा हुआ और नया बिछौना रखें - गीला बिछौना खुर की बीमारी और स्तनशोथ करता है।',
          'निश्चित समय पर दुहाएं, बाद में थन का पोंछा पोंछें और सूजन या दूध में बारीक-बारीक धागे देखें।',
          'हर पशु का दूध रोज़ तोलें या आकलन करें ताकि कमी जल्दी पता चले।',
          'हर पशु की अलग रिकॉर्ड बुक रखें - ब्याना, गर्भाधान, टीका और उपचार की तारीखें।',
        ],
      },
      precautions: {
        en: [
          'Do not give a new or suspected feed, or a leftover from a previous batch, without checking with the owner of the fodder or a veterinarian.',
          'Do not treat an animal with any medicine without a veterinarian\'s advice - the wrong drug or dose in a milk animal is both risky and unlawful.',
        ],
        hi: [
          'नया या संदिग्ध चारा, या पुराने बैच का बचा हुआ चारा, चारा देने वाले या पशु चिकित्सक की सलाह के बिना न दें।',
          'पशु चिकित्सक की सलाह के बिना कोई दवा न दें - दुधारू पशु में गलत दवा या मात्रा खतरनाक है और अवैध भी।',
        ],
      },
      consult: {
        en: 'Contact a veterinarian or a livestock development officer for any animal that is off feed, off milk, limping or showing a discharge, and for your vaccination and health-check schedule. The Department of Animal Husbandry & Dairying and NDDB list local services.',
        hi: 'ऐसे हर पशु के लिए पशु चिकित्सक या पशुधन विकास अधिकारी से संपर्क करें जो खाना छोड़े, दूध कम करे, लंगड़ाए या स्राव दिखाए, और अपने टीका व स्वास्थ्य-जांच कैलेंडर के लिए भी। पशुधन एवं दुग्ध विकास विभाग और NDDB स्थानीय सेवाएँ सूचीबद्ध करते हैं।',
      },
    },
    sources: [DAHD, NDDB, ICAR, general('Livestock husbandry - confirm with a veterinarian')],
    needsContext: true,
    contextHints: ['Species (cow/buffalo)', 'Number of animals', 'What is the symptom?', 'Village/district'],
  }),

  defineEntry({
    id: 'k-poultry',
    category: 'livestock',
    keywords: [
      'poultry',
      'chicken',
      'hen',
      'broiler',
      'backyard poultry',
      'egg production',
      'murgi',
      'kukkut',
      'अंडा',
      'मुर्गी',
      'कुक्कुट',
      'पोल्ट्री',
      'मुर्गी पालन',
      'murgi palan',
    ],
    question: 'Backyard poultry and egg care',
    questionHi: 'मुर्गी पालन और अंडे की देखभाल',
    content: {
      direct: {
        en: 'For a small backyard flock the essentials are simple: a dry, shaded, well-ventilated house with clean dry litter, clean water at all times, a simple feed (grain with protein and mineral), and protection from wild birds and rodents which carry disease. Watch the flock every day: reduced feed intake, drooping, reduced egg production, breathing difficulty or sudden death are warning signs. Collect eggs at least twice a day and store them cool; do not wash them unless you know they will be refrigerated.',
        hi: 'छोटे पीछे-मुर्गी पालन की बातें सरल हैं: सूखा, छायादार, हवादार आश्रय और साफ़-सूखा बिछौना; हमेशा साफ़ पानी; सादा दाना-मिश्रण जिसमें प्रोटीन और खनिज हों; और जंगली पक्षियों व चूहों से सुरक्षा, क्योंकि वे रोग फैलाते हैं। रोज़ झुंड देखें: खाना कम खाना, सुस्त पड़ना, अंडे कम देना, साँस लेने में तकलीफ या अचानक मौत - ये चेतावनी संकेत हैं। अंडे दिन में कम से कम दो बार इकट्ठा करें और ठंडे जगह रखें; जब तक यह पता न हो कि वे ठंडा किया जाएगा, तब तक धोएं नहीं।',
      },
      steps: {
        en: [
          'Keep the litter dry - damp litter causes coccidiosis and foot problems, so remove wet and droppings daily.',
          'Give clean water daily and scrub the drinker at least once a week.',
          'Feed a balanced ration: grain plus a protein source and mineral, and grit if they are kept on the ground.',
          'Provide a small grit and oyster-shell or calcium source separately for egg shell strength.',
          'Collect eggs twice a day, keep them in a cool place and sell them as fresh as possible.',
          'Keep new birds separate from the old flock for a couple of weeks, and watch for any that stop eating.',
        ],
        hi: [
          'बिछौना सूखा रखें - गीला बिछौना कोसिडियोसिस और पंजे की समस्या करता है, इसलिए गीला हिस्सा और मल रोज़ हटाएं।',
          'रोज़ साफ़ पानी दें और पानी का बर्तन सप्ताह में कम से कम एक बार घोएं।',
          'संतुलित दाना-मिश्रण दें: दाना + प्रोटीन स्रोत + खनिज, और ज़मीन पर पालने पर दाना (grit) भी।',
          'अंडे के खोल की मज़बूती के लिए अलग से grit और चूना/कौपल (oyster shell) रखें।',
          'अंडे दिन में दो बार इकट्ठा करें, ठंडी जगह रखें और जितने ताज़ा बेच सकें बेचें।',
          'नए पक्षियों को पुराने झुंड से अलग रखें और जो खाना छोड़ें उन्हें नज़र में रखें।',
        ],
      },
      precautions: {
        en: [
          'Never give leftover kitchen food with high salt or onion as a regular feed.',
          'Do not handle sick birds with bare hands and then handle the rest of the flock - wash your hands between birds.',
        ],
        hi: [
          'ज़्यादा नमक या प्याज वाला बचा हुआ खाना नियमित आहार न बनाएं।',
          'बीमार पक्षियों को खाली हाथ से न छुएं और फिर बाकी झुंड को भी न छुएं - पक्षियों के बीच हाथ धोएं।',
        ],
      },
      consult: {
        en: 'For vaccination, disease outbreaks and low egg production, contact a poultry veterinarian or your state poultry development officer. The Department of Animal Husbandry & Dairying lists poultry health services.',
        hi: 'टीका, रोग के प्रकोप और अंडे के कम उत्पादन के लिए पोल्ट्री चिकित्सक या राज्य पोल्ट्री विकास अधिकारी से संपर्क करें। पशुधन एवं दुग्ध विकास विभाग पोल्ट्री स्वास्थ्य सेवाएँ सूचीबद्ध करता है।',
      },
    },
    sources: [DAHD, ICAR, general('Poultry husbandry - confirm with a poultry veterinarian')],
    needsContext: true,
    contextHints: ['Number of birds', 'Meat or eggs?', 'What is the symptom?', 'Village/district'],
  }),

  defineEntry({
    id: 'k-animal-health',
    category: 'livestock',
    keywords: [
      'animal disease',
      'vaccination',
      'cattle vaccination',
      'veterinary',
      'animal health',
      'पशु रोग',
      'टीका',
      'पशु चिकित्सा',
      'बीमार पशु',
      'पशु स्वास्थ्य',
      'tika kab lagana hai',
    ],
    question: 'Animal health, disease signs and vaccination',
    questionHi: 'पशु स्वास्थ्य, रोग के लक्षण और टीका',
    content: {
      direct: {
        en: 'The common early signs of trouble in cattle and poultry are the same whichever disease it is: animals stop eating or eat less, drink more or less, become dull, isolate themselves, show loose dung or discharge, breathe faster than usual, swell under the skin or limp. Because many different diseases look the same early on, an animal that is off feed for more than a day, is not eating or drinking, has laboured breathing, cannot stand or has died suddenly needs a veterinarian - not a guess. The right vaccination schedule depends on your area, the disease history and the local veterinary department, so do not follow a schedule from a forwarded message.',
        hi: 'चाहे कोई भी रोग हो, पशुओं में शुरुआती संकेत एक जैसे होते हैं: खाना कम या बंद, पीना कम या ज़्यादा, सुस्ती, अलग रहना, ढीला मल या स्राव, सामान्य से तेज़ साँस, त्वचा के नीचे सूजन, या लंगड़ाना। क्योंकि कई अलग-अलग रोग शुरू में एक जैसे दिखते हैं, इसलिए जो पशु एक दिन से ज़्यादा खाना नहीं खा रहा, न खा रहा और न पी रहा, साँस लेने में ज़ोर लग रहा हो, खड़ा न हो पा रहा हो या अचानक मर गया हो, उसे पशु चिकित्सक दिखाएं - अंदाज़े से नहीं। टीका का सही कैलेंडर आपके क्षेत्र, रोग के इतिहास और स्थानीय पशु चिकित्सा विभाग पर निर्भर है, इसलिए आगे भेजे गए संदेश वाला कैलेंडर न अपनाएं।',
      },
      steps: {
        en: [
          'Note the animal, the symptom, when it started and what changed in feed, water or weather - the vet will ask for this.',
          'Isolate a sick animal from the rest of the flock immediately; it protects the others and simple separations often help.',
          'Keep water and feed available and soft; do not force-feed a sick animal.',
          'Do not give leftover human medicine to an animal.',
          'Ask your veterinary department or livestock officer for the vaccination and de-worming calendar for your area and keep it in one place.',
        ],
        hi: [
          'पशु, लक्षण, कब शुरू हुआ और चारा-पानी या मौसम में क्या बदला - यह वेटनर पूछेगा, इसलिए लिख लें।',
          'बीमार पशु को तुरंत बाकी झुंड से अलग करें; इससे बाकी सुरक्षित रहते हैं और अलग रखने से अक्सर आराम मिलता है।',
          'पानी और चारा उपलब्ध रखें और नरम दें; बीमार पशु को ज़बरन न खिलाएं।',
          'पशु को बचा हुआ इंसानी दवा न दें।',
          'अपने पशु चिकित्सा विभाग या पशुधन अधिकारी से अपने क्षेत्र का टीका और कृमि-मुक्ति कैलेंडर लें और एक जगह रखें।',
        ],
      },
      precautions: {
        en: [
          'Never give a medicine to an animal without a veterinary prescription - residues in milk and meat are a real risk.',
          'Do not bury or leave a dead animal in the open; it spreads disease - ask the local authority how to dispose of it safely.',
        ],
        hi: [
          'पशु चिकित्सक की पर्ची के बिना पशु को कोई दवा न दें - दूध और मांस में दवा का अवशेष बहुत बड़ा जोखिम है।',
          'मरे पशु को खुले में न दफनाएं और न छोड़ें; इससे रोग फैलता है - सुरक्षित निपटान की जानकारी स्थानीय प्राधिकरण से लें।',
        ],
      },
      consult: {
        en: 'Call a veterinarian or the nearest veterinary hospital for sick animals and for the local vaccination schedule. The Department of Animal Husbandry & Dairying can direct you to services in your state.',
        hi: 'बीमार पशु के लिए और स्थानीय टीका कैलेंडर के लिए पशु चिकित्सक या नज़दीकी पशु चिकित्सा अस्पताल को बुलाएं। पशुधन एवं दुग्ध विकास विभाग आपके राज्य की सेवाओं तक पहुँचा सकता है।',
      },
    },
    sources: [DAHD, ICAR, general('Animal health - a veterinarian must advise on medicines')],
    needsContext: true,
    contextHints: ['Species', 'Symptoms and when they started', 'Number of animals affected', 'Village/district'],
  }),
]
