import { AGRIWELFARE, DBT_BHARAT, ENAM, ICAR, INDIA_PORTAL, PM_KISAN, general } from './sources'
import { defineEntry, type KnowledgeEntry } from './types'

/**
 * ---------------------------------------------------------------------------
 * Government schemes, agricultural services and where to get help
 * ---------------------------------------------------------------------------
 * The assistant explains how a scheme works and where the official record
 * lives. It never states an amount, an eligibility rule or a status - those
 * change and only the official portal (or your local office) has them.
 */

export const GOVERNMENT_ENTRIES: KnowledgeEntry[] = [
  defineEntry({
    id: 'k-govt-schemes',
    category: 'schemes-services',
    keywords: [
      'government scheme',
      'pm kisan',
      'pm-kisan',
      'pm kisan scheme',
      'subsidy',
      'kisan credit card',
      'kcc',
      'pm fasal bima',
      'insurance',
      'scheme',
      'सरकारी योजना',
      'योजना',
      'पीएम किसान',
      'सब्सिडी',
      'फसल बीमा',
      'किसान क्रेडिट कार्ड',
      'kisan credit card',
      'pm kisan me kitna paisa',
    ],
    question: 'Government schemes for farmers',
    questionHi: 'किसानों के लिए सरकारी योजनाएं',
    content: {
      direct: {
        en: 'The main central schemes farmers ask about are PM-KISAN (income support for eligible landholding farmer families), Pradhan Mantri Fasal Bima Yojana (crop insurance), the Kisan Credit Card (short-term credit at concessional interest) and state-level schemes on subsidies, horticulture, dairy, equipment and irrigation. This assistant will not quote an amount, an eligibility rule or a payment status - those change with each notification and only the official portal or your Block Agriculture Office has the current record. If you tell me the scheme and the state, I can point you at the right official page and tell you what to ask for.',
        hi: 'किसानों की मुख्य केंद्रीय योजनाएं हैं - पीएम किसान (योग्य भूमिधारक किसान परिवारों को आय सहायता), प्रधानमंत्री फसल बीमा योजना (फसल बीमा), किसान क्रेडिट कार्ड (रियायती ब्याज पर अल्पकालिक ऋण) और राज्य स्तर की सब्सिडी, बागवानी, डेयरी, उपकरण व सिंचाई योजनाएं। यह सहायक राशि, पात्रता का नियम या भुगतान की स्थिति नहीं बताएगा - ये हर अधिसूचना के साथ बदलती हैं और सही जानकारी केवल आधिकारिक पोर्टल या आपके ब्लॉक कृषि कार्यालय के पास है। योजना और राज्य बताइए, मैं सही आधिकारिक पेज का पता और यह बता सकता हूँ कि किससे क्या पूछना है।',
      },
      steps: {
        en: [
          'Write down the scheme name and the state - most farmer schemes are run through the state government.',
          'Check the official portal listed below for the current notification and the application form.',
          'Keep your land record (Khatauni / RoR), Aadhaar and bank details ready - these are asked for again and again.',
          'Use the in-app Jobs marketplace for labour, and your Block Agriculture Office or KVK for scheme help in person.',
          'Never share your Aadhaar, bank account number or OTP with anyone who contacts you claiming to be from a government office - no genuine official asks for an OTP.',
        ],
        hi: [
          'योजना का नाम और राज्य लिख लें - ज़्यादातर किसान योजनाएं राज्य सरकार के ज़रिए चलती हैं।',
          'नीचे दिए आधिकारिक पोर्टल पर मौजूदा अधिसूचना और आवेदन फ़ॉर्म देखें।',
          'अपनी भूमि रिकॉर्ड (खतौनी), आधार और बैंक विवरण तैयार रखें - ये बार-बार मांगे जाते हैं।',
          'मजदूरी के लिए इस ऐप का जॉब्स मार्केटप्लेस और योजना में मदद के लिए ब्लॉक कृषि कार्यालय या KVK का उपयोग करें।',
          'कोई भी जो सरकारी कार्यालय होने का दावा करके आपसे आधार, बैंक खाता नंबर या OTP मांगे, उसे कभी न दें - असली सरकारी अधिकारी OTP नहीं मांगता।',
        ],
      },
      precautions: {
        en: [
          'Do not pay a "processing fee" to a private agent for a government scheme; official enrolment is free at the agriculture office and on the portal.',
          'Do not act on a forwarded screenshot of an amount - verify the scheme name and the notification on the portal.',
        ],
        hi: [
          'सरकारी योजना के लिए किसी निजी एजेंट को "प्रोसेसिंग फीस" न दें; कृषि कार्यालय और पोर्टल पर नामांकन मुफ़्त है।',
          'आगे भेजे गए स्क्रीनशॉट में दी राशि के आधार पर कोई काम न करें - योजना का नाम और अधिसूचना पोर्टल पर जांचें।',
        ],
      },
      consult: {
        en: 'Your Block Agriculture Office or the nearest Krishi Vigyan Kendra (KVK) can confirm whether you are eligible for a particular scheme and walk you through the application; for an expert reading of any scheme rule, ask the district agriculture office.',
        hi: 'आपका ब्लॉक कृषि कार्यालय या नज़दीकी कृषि विज्ञान केंद्र (KVK) पुष्टि कर सकता है कि आप किसी योजना के पात्र हैं और आवेदन में मदद कर सकता है; किसी भी योजना के नियम की विशेषज्ञ समझ के लिए जिला कृषि कार्यालय से पूछें।',
      },
    },
    sources: [PM_KISAN, AGRIWELFARE, INDIA_PORTAL, DBT_BHARAT, ICAR, general('Your Block Agriculture Office / KVK for eligibility')],
    needsContext: true,
    contextHints: ['Which scheme?', 'State and district', 'Are you asking about eligibility, amount or status?'],
  }),

  defineEntry({
    id: 'k-agri-services',
    category: 'schemes-services',
    keywords: [
      'agriculture office',
      'extension officer',
      'agri services',
      'farm advice',
      'advisory service',
      'where can i ask',
      'agriculture helpline',
      'कृषि कार्यालय',
      'विस्तार अधिकारी',
      'कृषि सलाह',
      'कहाँ पूछें',
      'मदद',
    ],
    question: 'Where to get agricultural advice and services',
    questionHi: 'कृषि सलाह और सेवाएं कहां से पाएं',
    content: {
      direct: {
        en: 'For anything that must be local, go to the people whose job it is: the Krishi Vigyan Kendra (KVK) for your district, the Block or District Agriculture Office, the state horticulture and animal husbandry offices for their subjects, the soil testing laboratory for a soil report, and the nearest mandi or e-NAM registration centre for market services. Ask for the person who handles your crop - a potato question and a paddy question go to different officers.',
        hi: 'जो बात स्थानीय होनी चाहिए, उसके लिए उसी व्यक्ति के पास जाएं जिसका काम यह है: आपके जिले का कृषि विज्ञान केंद्र (KVK), ब्लॉक या जिला कृषि कार्यालय, बागवानी और पशुधन के मामलों में राज्य संबंधित कार्यालय, मिट्टी की जांच के लिए मृदा प्रयोगशाला, और बाज़ार सेवाओं के लिए नज़दीकी मंडी या e-NAM पंजीकरण केंद्र। अपनी फसल का अधिकारी पूछें - आलू का सवाल और धान का सवाल अलग-अलग अधिकारी को जाते हैं।',
      },
      steps: {
        en: [
          'Find out which KVK covers your district and note its address, phone number and visiting day.',
          'Take your field details with you: crop, variety, sowing date, area and what you have already tried.',
          'If you need a soil or water test, ask where the nearest laboratory is and what a sample needs.',
          'For a scheme, ask the Block Agriculture Office for the current circular and the application process.',
          'For market prices and registration, ask the local mandi or the e-NAM helpdesk how to register and how payment works.',
        ],
        hi: [
          'पता लगाएं कि आपके जिले का कौन सा KVK है और उसका पता, फ़ोन नंबर और दौरे का दिन नोट करें।',
          'खेत की जानकारी साथ ले जाएं: फसल, किस्म, बुवाई तारीख, क्षेत्रफल और आपने अब तक क्या किया है।',
          'मिट्टी या पानी की जांच चाहिए हो तो नज़दीकी प्रयोगशाला और नमूने की ज़रूरत पूछें।',
          'योजना के लिए ब्लॉक कृषि कार्यालय से मौजूदा परिपत्र और आवेदन प्रक्रिया पूछें।',
          'भाव और पंजीकरण के लिए स्थानीय मंडी या e-NAM सहायता कक्ष से पूछें कि पंजीकरण और भुगतान कैसे होता है।',
        ],
      },
      precautions: {
        en: [
          'Do not pay an agent to get a "KVK recommendation letter" - the advisory service is free.',
          'Do not share your OTP or bank details with anyone, including people who claim to be from an agriculture office.',
        ],
        hi: [
          '"KVK सिफ़ारिश पत्र" दिलाने के लिए एजेंट को पैसा न दें - सलाह सेवा मुफ़्त है।',
          'अपना OTP या बैंक विवरण किसी को न दें, कृषि कार्यालय का दावा करने वालों को भी नहीं।',
        ],
      },
      consult: {
        en: 'The Department of Agriculture & Farmers Welfare and ICAR portals list the national-level programmes and institutions; the state agriculture department lists your district offices and KVKs.',
        hi: 'कृषि एवं किसान कल्याण विभाग और ICAR के पोर्टल राष्ट्रीय स्तर के कार्यक्रम और संस्थाएं सूचीबद्ध करते हैं; राज्य कृषि विभाग आपके जिले के कार्यालयों और KVK की सूची देता है।',
      },
    },
    sources: [AGRIWELFARE, ICAR, INDIA_PORTAL, ENAM, general('Your district KVK / Block Agriculture Office')],
    needsContext: true,
    contextHints: ['District', 'What do you need help with?', 'Crop or topic'],
  }),
]
