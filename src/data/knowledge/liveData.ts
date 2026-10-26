import { AGMARKNET, DBT_BHARAT, ENAM, IMD, PM_KISAN, general } from './sources'
import { defineEntry, type KnowledgeEntry } from './types'

/**
 * ---------------------------------------------------------------------------
 * Live data: weather, mandi prices, scheme status
 * ---------------------------------------------------------------------------
 * These topics change every day. This app has no live feed - no weather API,
 * no price feed, no scheme database - so these entries are honest about it
 * and give the farmer the right official place to look plus a next step they
 * can take right now. No prices, amounts or forecasts are ever invented here.
 */

export const LIVE_DATA_ENTRIES: KnowledgeEntry[] = [
  defineEntry({
    id: 'k-live-weather',
    category: 'live-data',
    liveData: true,
    keywords: [
      'weather',
      'weather forecast',
      'will it rain',
      'rain today',
      'temperature today',
      'mausam',
      'mausam ka update',
      'barish hogi',
      'मौसम',
      'मौसम का अनुमान',
      'बारिश होगी',
      'आज का मौसम',
      'तापमान',
      'weather aaj ka',
    ],
    question: 'Current weather and forecast',
    questionHi: 'मौसम का अनुमान और आज का मौसम',
    content: {
      direct: {
        en: 'I don\'t have a reliable answer for today\'s weather or the next few days - there is no live weather feed here, so I will not guess what the weather will do - a wrong forecast can cost you a spraying, an irrigation or a whole harvest. The authoritative source for your district is the IMD Mausam portal, which gives the official forecast, rainfall and warning; the state meteorological department issues local warnings, and many districts also post a daily "agri weather" advisory for crop operations. For a general idea of how weather affects farming (and how to prepare), I can help you plan.',
        hi: 'आज के मौसम और आगे कुछ दिनों के पूर्वानुमान का मेरे पास विश्वसनीय उत्तर नहीं है। मेरे पास लाइव मौसम फीड नहीं है, इसलिए मौसम क्या करेगा यह अंदाज़ा नहीं लगाऊँगा - गलत पूर्वानुमान से एक छिड़काव, एक सिंचाई या पूरी फसल का नुकसान हो सकता है। आपके जिले का आधिकारिक स्रोत IMD Mausam पोर्टल है, जहाँ आधिकारिक पूर्वानुमान, वर्षा और चेतावनी मिलती है; राज्य मौसम विभाग स्थानीय चेतावनी देता है, और कई जिले फसल के कामों के लिए रोज़ "एग्री वेदर" सलाह भी जारी करते हैं। मौसम खेती को कैसे प्रभावित करता है और तैयारी कैसे करें, इसकी सामान्य जानकारी मैं दे सकता हूँ।',
      },
      steps: {
        en: [
          'Open the IMD Mausam portal and select your state and district for the current forecast and any active warning.',
          'Note the forecast for the next 48 hours - that is what matters for spraying, irrigation and harvest.',
          'If your state issues district crop advisories, ask your KVK or agriculture office for the phone number and add it.',
          'Write down the date and forecast each time you look; it takes two weeks of notes to build a useful picture for your own field.',
        ],
        hi: [
          'IMD Mausam पोर्टल खोलें और मौजूदा पूर्वानुमान व चेतावनी के लिए अपना राज्य और जिला चुनें।',
          'अगले 48 घंटों का पूर्वानुमान नोट करें - छिड़काव, सिंचाई और कटाई के लिए यही मायने रखता है।',
          'अगर आपका राज्य जिला-स्तरीय फसल सलाह जारी करता है, तो KVK या कृषि कार्यालय से फ़ोन नंबर लेकर सहेज लें।',
          'हर बार देखने पर तारीख और पूर्वानुमान लिखें; दो हफ्ते के नोट से ही आपके खेत की अपनी समझ बनती है।',
        ],
      },
      precautions: {
        en: [
          'Do not rely on an app or a rumour for a spraying or irrigation decision - use the official district forecast.',
          'Keep a rain gauge or a simple measuring bottle in the field so you know how much rain actually fell, not just that it rained.',
        ],
        hi: [
          'छिड़काव या सिंचाई के निर्णय के लिए किसी ऐप या अफवाह पर भरोसा न करें - आधिकारिक जिला पूर्वानुमान देखें।',
          'खेत में बारिश मापने का बर्तन या वर्षा मापक रखें ताकि यह पता रहे कि असल में कितनी बारिश हुई, केवल यह नहीं कि बारिश हुई।',
        ],
      },
      consult: {
        en: 'Your nearest Krishi Vigyan Kendra (KVK) publishes district crop-weather advisories that combine the forecast with the stage of your crop, and the state agriculture office can tell you when the local advisory is updated.',
        hi: 'आपका कृषि विज्ञान केंद्र (KVK) जिला फसल-मौसम सलाह जारी करता है जो पूर्वानुमान को आपकी फसल की अवस्था के साथ जोड़ता है, और राज्य कृषि कार्यालय बता सकता है कि स्थानीय सलाह कब अपडेट होती है।',
      },
    },
    sources: [IMD, general('State/district crop advisory from your KVK')],
    needsContext: true,
    contextHints: ['District', 'Crop and stage', 'What decision are you planning?'],
  }),

  defineEntry({
    id: 'k-live-mandi-price',
    category: 'live-data',
    liveData: true,
    keywords: [
      'mandi price',
      'mandi rate',
      'market price',
      'bhav',
      'rate today',
      'price of wheat',
      'price today',
      'apna mandi',
      'मंडी भाव',
      'भाव',
      'आज का भाव',
      'मंडी का भाव',
      'फसल का भाव',
      'mandi bhav aaj',
    ],
    question: 'Today\'s market / mandi price',
    questionHi: 'आज का मंडी भाव',
    content: {
      direct: {
        en: 'I don\'t have a reliable answer for today\'s price in your mandi - there is no live price feed here, so I will not quote a rate that I cannot verify - a wrong price can make you sell early or hold too long. The official places to see the real price are e-NAM (where you can also trade online) and Agmarknet (the daily market price service), plus your own mandi\'s display board, which is the price you will actually get. Prices differ by mandi, by quality, by moisture and by the day, so always check the local board on the morning you plan to sell.',
        hi: 'आज के मंडी भाव का मेरे पास विश्वसनीय उत्तर नहीं है। मेरे पास लाइव भाव फीड नहीं है, इसलिए जिस भाव की पुष्टि नहीं कर सकता वह नहीं बताऊँगा - गलत भाव से आप जल्दी बेच सकते हैं या ज़्यादा देर तक रोक सकते हैं। असली भाव देखने के आधिकारिक जगहें हैं - e-NAM (जहाँ आप ऑनलाइन बेच भी सकते हैं) और Agmarknet (दैनिक मार्केट भाव सेवा), और साथ में आपके अपने मंडी का बोर्ड, क्योंकि यही भाव आपको मिलेगा। भाव मंडी, गुणवत्ता, नमी और दिन के अनुसार बदलते हैं, इसलिए बेचने की तारीख की सुबह स्थानीय बोर्ड ज़रूर देखें।',
      },
      steps: {
        en: [
          'On e-NAM or Agmarknet, select your state, district, market and commodity to see the reported prices.',
          'Note the price and the date you saw it - a price without a date is not a price.',
          'Ask at your local mandi what quality and moisture they are buying at today, and compare with what they paid others.',
          'Check your transport cost and packing cost before deciding - a higher mandi rate does not always mean more money in hand.',
          'If you are selling a small lot, e-NAM registration can help you reach buyers beyond your own mandi.',
        ],
        hi: [
          'e-NAM या Agmarknet पर अपना राज्य, जिला, मंडी और फसल चुनकर रिपोर्ट किए गए भाव देखें।',
          'भाव और देखने की तारीख दोनों लिखें - तारीख के बिना भाव अधूरा है।',
          'अपनी मंडी से पूछें कि आज वे कितनी गुणवत्ता और नमी के माल खरीद रहे हैं, और दूसरों को क्या भाव दिया, यह मिलाएं।',
          'निर्णय से पहले ढुलाई और पैकिंग का खर्च जोड़ें - ज़्यादा भाव का मतलब ज़्यादा पैसा हाथ में नहीं होता।',
          'छोटी मात्रा बेचते हों तो e-NAM पंजीकरण से अपनी मंडी के बाहर के खरीदारों तक पहुँच सकते हैं।',
        ],
      },
      precautions: {
        en: [
          'Do not sell on a rumour or an old forwarded rate - prices move daily.',
          'Do not accept a lower rate than the board shows without asking why - moisture and quality deductions are common and should be explained.',
        ],
        hi: [
          'अफवाह या पुराने भाव पर बेचने का निर्णय न लें - भाव रोज़ बदलते हैं।',
          'बोर्ड से कम भाव बिना पूछे मत लें - नमी और गुणवत्ता की कटौती आम है और उसका कारण बताया जाना चाहिए।',
        ],
      },
      consult: {
        en: 'Your local mandi secretary or the e-NAM helpdesk can explain how a particular lot is graded and priced on the day, and your nearest Krishi Vigyan Kendra (KVK) can advise on how to store a crop while you wait for a better rate.',
        hi: 'आपके मंडी सचिव या e-NAM सहायता कक्षा बता सकेगा कि उस दिन माल कैसे ग्रेड और भाव होता है, और आपका कृषि विज्ञान केंद्र (KVK) बेहतर भाव की प्रतीक्षा में फसल कैसे रखें, यह सलाह दे सकता है।',
      },
    },
    sources: [ENAM, AGMARKNET, general('Your local mandi display board - the price you will actually get')],
    needsContext: true,
    contextHints: ['Crop and variety', 'District and mandi', 'Quantity', 'Quality/grade'],
  }),

  defineEntry({
    id: 'k-live-scheme-status',
    category: 'live-data',
    liveData: true,
    keywords: [
      'scheme status',
      'installment',
      'payment status',
      'instalment',
      'did i get my payment',
      'pm kisan payment',
      'pm kisan installment',
      'when will the money come',
      'योजना की स्थिति',
      'किस्त',
      'भुगतान की स्थिति',
      'पैसा आया या नहीं',
      'कब आएगा',
      'scheme amount',
      'subsidy amount',
      'how much money',
    ],
    question: 'Scheme status, instalment and amount',
    questionHi: 'योजना की स्थिति, किस्त और राशि',
    content: {
      direct: {
        en: 'I don\'t have a reliable answer for the exact amount, whether your instalment has been credited, or when it will arrive - there is no live record of scheme payments or eligibility here, and I will not guess. Your own record is on the official portal: check your beneficiary or instalment status there, or look at your bank passbook for the credit. If the status does not match what you expect, take your Aadhaar and land record to the Block Agriculture Office, which can raise the query for you.',
        hi: 'सही राशि, किस्त की स्थिति या तारीख का मेरे पास विश्वसनीय उत्तर नहीं है। योजना के भुगतान या पात्रता की लाइव रिकॉर्ड मेरे पास नहीं है, इसलिए मैं सही राशि, यह बता सकता हूँ कि आपकी किस्त आई है या नहीं, या कब आएगी - और अंदाज़ा नहीं लगाऊँगा। आपका अपना रिकॉर्ड आधिकारिक पोर्टल पर है: वहां अपना लाभार्थी या किस्त की स्थिति देखें, या बैंक पासबुक में जमा राशि देखें। स्थिति जैसी अपेक्षा के अनुसार न हो तो आधार और भूमि रिकॉर्ड लेकर ब्लॉक कृषि कार्यालय जाएं, वह आपकी ओर से शिकायत दर्ज करा सकता है।',
      },
      steps: {
        en: [
          'Open the official scheme portal and use the beneficiary, instalment or status section with your registration details.',
          'Cross-check your bank passbook for the credit - many "not received" complaints are a wrong account number or a name mismatch.',
          'Check that your Aadhaar and bank account are seeded and verified on the portal, and that your bank account is active.',
          'If something is missing, take the Aadhaar, land record and passbook to the Block Agriculture Office.',
          'Never share your OTP with anyone who calls about a "pending instalment".',
        ],
        hi: [
          'आधिकारिक योजना पोर्टल खोलें और अपने पंजीकरण विवरण से लाभार्थी, किस्त या स्थिति वाला हिस्सा देखें।',
          'अपनी बैंक पासबुक से जमा राशि मिलाएं - कई "पैसा नहीं आया" शिकायतें गलत खाता नंबर या नाम की गड़बड़ी होती हैं।',
          'जांचें कि पोर्टल पर आपका आधार और बैंक खाता जुड़ा और सत्यापित है, और खाता चालू है।',
          'कुछ भी कमी हो तो आधार, भूमि रिकॉर्ड और पासबुक लेकर ब्लॉक कृषि कार्यालय जाएं।',
          '"लंबित किस्त" के बहाने किसी को अपना OTP कभी न दें।',
        ],
      },
      precautions: {
        en: [
          'No one from a government office will ever ask for your OTP, PIN or full bank password - treat such a call as a scam.',
          'Do not believe a forwarded message saying "your instalment is approved, pay this fee to release it".',
        ],
        hi: [
          'सरकारी कार्यालय से कोई कभी आपका OTP, PIN या पूरा बैंक पासवर्ड नहीं मांगेगा - ऐसी कॉल को धोखाधड़ी मानें।',
          'आगे भेजे गए संदेश "आपकी किस्त मंज़ूर हो गई है, छोड़ने के लिए यह राशि दें" पर विश्वास न करें।',
        ],
      },
      consult: {
        en: 'The official portal and your Block Agriculture Office or Krishi Vigyan Kendra (KVK) are the right places for scheme status questions, and an agriculture expert can also check the scheme notification for your state and confirm the eligibility rules.',
        hi: 'आधिकारिक पोर्टल और आपका ब्लॉक कृषि कार्यालय या कृषि विज्ञान केंद्र (KVK) योजना की स्थिति के सवालों के लिए सही जगह हैं, और कृषि विज्ञान केंद्र (KVK) या कृषि विशेषज्ञ आपके राज्य की योजना अधिसूचना देखकर पात्रता के नियम भी जांच सकता है।',
      },
    },
    sources: [PM_KISAN, DBT_BHARAT, general('Your Block Agriculture Office / KVK for scheme records')],
    needsContext: true,
    contextHints: ['Which scheme?', 'State and district', 'What exactly do you need to know?'],
  }),
]
