import { useCallback } from 'react'

import { useApp } from '@/store/AppContext'
import type { UiLanguage } from '@/store/types'

/**
 * Every user-facing string in the shell and dashboards lives here so that the
 * English / Hindi switch is a real feature rather than decoration.
 */
export const STRINGS = {
  'app.name': { en: 'KisanSathi', hi: 'किसानसाथी' },
  'app.tagline': { en: 'Better farm work. Smarter farming.', hi: 'बेहतर खेती का काम। स्मार्ट खेती।' },

  'nav.home': { en: 'Home', hi: 'होम' },
  'nav.jobs': { en: 'Jobs', hi: 'नौकरियाँ' },
  'nav.ai': { en: 'Kisan AI', hi: 'किसान AI' },
  'nav.planner': { en: 'Crop Planner', hi: 'फसल योजना' },
  'nav.profile': { en: 'Profile', hi: 'प्रोफ़ाइल' },
  'nav.dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड' },

  'role.farmer': { en: 'Farmer', hi: 'किसान' },
  'role.worker': { en: 'Worker', hi: 'मज़दूर' },
  'role.switch': { en: 'Switch role', hi: 'भूमिका बदलें' },

  'common.sampleData': { en: 'Sample data', hi: 'नमूना डेटा' },
  'common.demoNotice': {
    en: 'Prototype with realistic sample data - no live services connected.',
    hi: 'यह एक नमूना डेटा वाला प्रोटोटाइप है - कोई लाइव सेवा नहीं जुड़ी है।',
  },
  'common.viewAll': { en: 'View all', hi: 'सभी देखें' },
  'common.seeDetails': { en: 'See details', hi: 'विवरण देखें' },
  'common.cancel': { en: 'Cancel', hi: 'रद्द करें' },
  'common.save': { en: 'Save', hi: 'सहेजें' },
  'common.close': { en: 'Close', hi: 'बंद करें' },
  'common.search': { en: 'Search', hi: 'खोजें' },
  'common.all': { en: 'All', hi: 'सभी' },
  'common.apply': { en: 'Enroll', hi: 'शामिल हों' },
  'common.enrolled': { en: 'Enrolled', hi: 'शामिल' },
  'common.withdraw': { en: 'Withdraw', hi: 'हटें' },
  'common.vacancies': { en: 'vacancies', hi: 'रिक्त पद' },
  'common.workers': { en: 'workers', hi: 'मज़दूर' },
  'common.perDay': { en: '/day', hi: '/दिन' },
  'common.days': { en: 'days', hi: 'दिन' },
  'common.fullyStaffed': { en: 'Fully staffed', hi: 'पूरी टोली भरी' },
  'common.noVacancies': { en: 'No vacancies', hi: 'कोई रिक्त पद नहीं' },
  'common.duration': { en: 'Duration', hi: 'अवधि' },
  'common.clearFilters': { en: 'Clear filters', hi: 'फ़िल्टर हटाएँ' },
  'common.filters': { en: 'Filters', hi: 'फ़िल्टर' },
  'common.searchPlaceholder': {
    en: 'Search by crop, activity, village or district...',
    hi: 'फसल, काम, गाँव या जिले से खोजें...',
  },

  'home.greetingFarmer': { en: 'Namaste, Ramesh ji', hi: 'नमस्ते, रमेश जी' },
  'home.greetingWorker': { en: 'Namaste, Ramesh', hi: 'नमस्ते, रमेश' },
  'home.farmerIntro': {
    en: 'Here is what is happening on your farm today.',
    hi: 'आज आपके खेत में जो हो रहा है, वह यहाँ है।',
  },
  'home.workerIntro': {
    en: 'Find farm work near you and track your crew assignments.',
    hi: 'अपने पास खेती का काम खोजें और अपनी टोली देखें।',
  },
  'home.statOpenJobs': { en: 'Open jobs', hi: 'खुली नौकरियाँ' },
  'home.statWorkersHired': { en: 'Workers hired', hi: 'हायर किए मज़दूर' },
  'home.statActivities': { en: 'Upcoming activities', hi: 'आने वाली गतिविधियाँ' },
  'home.statVacancies': { en: 'Open vacancies', hi: 'कुल रिक्त पद' },
  'home.statMyJobs': { en: 'Jobs I joined', hi: 'मैंने जुड़ी नौकरियाँ' },
  'home.statEarnings': { en: 'Expected earnings', hi: 'अनुमानित कमाई' },
  'home.quickActions': { en: 'Quick actions', hi: 'त्वरित कार्य' },
  'home.recentJobs': { en: 'Latest farm work', hi: 'नवीनतम खेती का काम' },
  'home.recentJobsSub': {
    en: 'Sample jobs from nearby farms',
    hi: 'आस-पास के खेतों के नमूना काम',
  },
  'home.myJobs': { en: 'My posted jobs', hi: 'मेरी पोस्ट की गई नौकरियाँ' },
  'home.myJobsSub': {
    en: 'Track how many workers have joined each job',
    hi: 'देखें कि हर नौकरी में कितने मज़दूर जुड़े',
  },
  'home.nearbyJobs': { en: 'Open jobs nearby', hi: 'आस-पास की खुली नौकरियाँ' },
  'home.nearbyJobsSub': {
    en: 'Sample work from other farms in your area',
    hi: 'आपके इलाके के दूसरे खेतों का नमूना काम',
  },
  'home.upcoming': { en: 'Upcoming farm activities', hi: 'आने वाली खेती गतिविधियाँ' },
  'home.upcomingSub': {
    en: 'Sample schedule from your crop plan',
    hi: 'आपकी फसल योजना का नमूना कार्यक्रम',
  },

  'job.post': { en: 'Post a job', hi: 'नौकरी दें' },
  'job.find': { en: 'Find work', hi: 'काम खोजें' },
  'job.openAi': { en: 'Ask Kisan AI', hi: 'किसान AI से पूछें' },
  'job.createPlan': { en: 'Create crop plan', hi: 'फसल योजना बनाएँ' },
  'job.workersNeeded': { en: 'Workers needed', hi: 'मज़दूर चाहिए' },
  'job.enrolled': { en: 'Enrolled', hi: 'जुड़े हुए' },
  'job.vacancies': { en: 'Vacancies', hi: 'रिक्त पद' },
  'job.village': { en: 'Village', hi: 'गाँव' },
  'job.date': { en: 'Date', hi: 'तारीख' },
  'job.wage': { en: 'Daily wage', hi: 'दिहाड़ी' },
  'job.activities': { en: 'Activities', hi: 'गतिविधियाँ' },
  'job.all': { en: 'All jobs', hi: 'सभी नौकरियाँ' },
  'job.allSub': {
    en: 'Browse sample farm work across districts',
    hi: 'जिलों में उपलब्ध नमूना खेती के काम देखें',
  },
  'job.enrolledCount': {
    en: '{enrolled} of {required} workers enrolled',
    hi: '{required} में से {enrolled} मज़दूर शामिल',
  },
  'job.yourJob': { en: 'Your job', hi: 'आपकी नौकरी' },
  'job.sampleJob': { en: 'Sample job', hi: 'नमूना नौकरी' },
  'job.notEnrolled': { en: 'Not enrolled', hi: 'शामिल नहीं' },
  'job.enrolledYou': { en: 'You are enrolled', hi: 'आप शामिल हैं' },
  'job.openStatus': { en: 'Open', hi: 'खुली' },
  'job.closedStatus': { en: 'Closed', hi: 'बंद' },
  'job.description': { en: 'Job description', hi: 'कार्य विवरण' },
  'job.myApplications': { en: 'My applications', hi: 'मेरे आवेदन' },
  'job.vacanciesOnly': { en: 'Vacancies only', hi: 'केवल रिक्त पद वाली' },
  'job.district': { en: 'District', hi: 'जिला' },
  'job.crop': { en: 'Crop', hi: 'फसल' },
  'job.activity': { en: 'Activity', hi: 'काम' },
  'job.sortNewest': { en: 'Newest first', hi: 'नए पहले' },
  'job.sortWage': { en: 'Highest wage', hi: 'सबसे ज़्यादा दिहाड़ी' },
  'job.sortDate': { en: 'Earliest date', hi: 'सबसे पहली तारीख' },
  'job.showing': { en: 'Showing', hi: 'दिखा रहे हैं' },
  'job.of': { en: 'of', hi: 'में से' },
  'job.results': { en: 'jobs', hi: 'नौकरियाँ' },
  'job.noResults': { en: 'No jobs match these filters', hi: 'इन फ़िल्टर से कोई नौकरी नहीं मिली' },
  'job.noResultsHint': {
    en: 'Try a different crop or activity, widen the search, or clear the filters.',
    hi: 'कोई दूसरी फसल या काम आज़माएँ, खोज बदलें, या फ़िल्टर हटाएँ।',
  },
  'job.notFound': { en: 'Job not found', hi: 'नौकरी नहीं मिली' },
  'job.notFoundHint': {
    en: 'This job is not in the current demo set. It may have been removed after you opened the link.',
    hi: 'यह नौकरी मौजूदा नमूना डेटा में नहीं है। लिंक खोलने के बाद हटा दी गई होगी।',
  },
  'job.backToMarketplace': { en: 'Back to jobs', hi: 'नौकरियों पर लौटें' },
  'job.applyNow': { en: 'Enroll in this job', hi: 'इस नौकरी में शामिल हों' },
  'job.withdrawFrom': { en: 'Withdraw from job', hi: 'नौकरी से हटें' },
  'job.enrollmentStatus': { en: 'Your enrollment', hi: 'आपकी भागीदारी' },
  'job.vacancySummary': { en: 'Crew summary', hi: 'टोली का सारांश' },
  'job.scopeAll': { en: 'All jobs', hi: 'सभी नौकरियाँ' },
  'job.scopeMineFarmer': { en: 'My posted jobs', hi: 'मेरी नौकरियाँ' },
  'job.scopeMineWorker': { en: 'My applications', hi: 'मेरे आवेदन' },
  'job.myApplicationsSub': {
    en: 'Jobs you have enrolled in for this demo',
    hi: 'इस डेमो के लिए आपने जिन नौकरियों में शामिल हुए हैं',
  },
  'job.publishedBy': { en: 'Posted by', hi: 'पोस्ट किया' },
  'job.farm': { en: 'Farm', hi: 'खेत' },
  'job.requiredWorkers': { en: 'Workers required', hi: 'कुल मज़दूर चाहिए' },
  'job.enrolledWorkers': { en: 'Workers enrolled', hi: 'शामिल मज़दूर' },
  'job.vacantPositions': { en: 'Vacancies left', hi: 'बचे रिक्त पद' },
  'job.startTime': { en: 'Start time', hi: 'शुरुआत का समय' },
  'job.workDate': { en: 'Work date', hi: 'काम की तारीख' },
  'job.notPosted': { en: 'Not posted yet', hi: 'अभी तक पोस्ट नहीं' },
  'job.sampleBanner': {
    en: 'Sample record - created for the demo, not a live listing.',
    hi: 'नमूना रिकॉर्ड - डेमो के लिए बनाया गया, लाइट लिस्टिंग नहीं।',
  },

  'ai.title': { en: 'Kisan AI Assistant', hi: 'किसान AI सहायक' },
  'ai.subtitle': {
    en: 'Ask about crops, soil, pests, irrigation, storage or farm work in Hindi, Hinglish or English.',
    hi: 'फसल, मिट्टी, कीट, सिंचाई, भंडारण या खेती के काम के बारे में हिंदी, हिंग्लिश या अंग्रेज़ी में पूछें।',
  },
  'ai.disclaimer': {
    en: 'Local prototype, not a live AI service.',
    hi: 'स्थानीय प्रोटोटाइप, लाइव AI सेवा नहीं।',
  },
  'ai.status.title': {
    en: 'KisanSathi AI is ready.',
    hi: 'किसानसाथी AI तैयार है।',
  },
  'ai.status.offline': {
    en: 'Runs completely offline on this device from a curated knowledge base - no API key needed, no account, no data charges.',
    hi: 'पूरी तरह ऑफ़लाइन, इसी डिवाइस पर, क्यूरेटेड नॉलेज बेस से - न API key चाहिए, न अकाउंट, न डेटा का खर्च।',
  },
  'ai.status.noRemote': {
    en: 'No remote model is connected in this build, and nothing you type leaves the phone.',
    hi: 'इस बिल्ड में कोई रिमोट मॉडल जुड़ा नहीं है, और आपका लिखा हुआ कुछ भी फ़ोन से बाहर नहीं जाता।',
  },
  'ai.status.free': {
    en: 'Free to use, with no running cost and no recurring charges.',
    hi: 'निःशुल्क इस्तेमाल - न कोई चलन-खर्च, न कोई बार-बार लगने वाला शुल्क।',
  },
  'ai.status.topics': {
    en: 'Covers crop planning and seasonal work, sowing and seed choice, soil and compost, irrigation and drainage, pests and diseases, rotation and weeds, harvest and storage, livestock and poultry, government schemes and services, and farm costs.',
    hi: 'फसल योजना और मौसमी काम, बुवाई और बीज चुनाव, मिट्टी और कम्पोस्ट, सिंचाई और जल निकास, कीट-रोग, फसल चक्र और खरपतवार, कटाई और भंडारण, पशु और मुर्गी पालन, सरकारी योजनाएं और सेवाएं, और खेती की लागत।',
  },
  'ai.placeholder': {
    en: 'Ask a farming question or describe the job you need...',
    hi: 'खेती से जुड़ा सवाल पूछें या मजदूरों की जरूरत बताएं...',
  },
  'ai.send': { en: 'Send', hi: 'भेजें' },
  'ai.clear': { en: 'Clear conversation', hi: 'बातचीत साफ़ करें' },
  'ai.fullscreen': { en: 'Full screen', hi: 'पूरी स्क्रीन' },
  'ai.exitFullscreen': { en: 'Exit full screen', hi: 'पूरी स्क्रीन से बाहर' },
  'ai.suggestions': { en: 'Quick prompts', hi: 'त्वरित सुझाव' },
  'ai.typing': { en: 'Kisan AI is thinking...', hi: 'किसान AI सोच रहा है...' },
  'ai.emptyTitle': { en: 'Ask Kisan AI', hi: 'किसान AI से पूछें' },
  'ai.emptyDesc': {
    en: 'Get general guidance on crops, irrigation, pests, seasonal work or draft a job in Hindi/Hinglish/English.',
    hi: 'फसल, सिंचाई, कीट, मौसमी काम या नौकरी का ड्राफ्ट हिंदी/हिंग्लिश/अंग्रेज़ी में पाएं।',
  },
  'ai.copy': { en: 'Copy answer', hi: 'उत्तर कॉपी करें' },
  'ai.copied': { en: 'Copied', hi: 'कॉपी हो गया' },
  'ai.sources': { en: 'Sources', hi: 'स्रोत' },
  'ai.sourced': { en: 'Sourced', hi: 'संदर्भित' },
  'ai.general': { en: 'General guidance', hi: 'सामान्य सुझाव' },
  'ai.contextNeeded': { en: 'More context needed', hi: 'और जानकारी चाहिए' },
  'ai.draftTitle': { en: 'Job draft (editable)', hi: 'नौकरी ड्राफ्ट (संपादन योग्य)' },
  'ai.draftReview': {
    en: 'Review and edit fields. Nothing is posted until you confirm.',
    hi: 'फ़ील्ड जाँचें और संपादित करें। पुष्टि से पहले कुछ भी पोस्ट नहीं होता।',
  },
  'ai.missing': { en: 'Missing', hi: 'अनुपस्थित' },
  'ai.confirmOpen': { en: 'Open post form', hi: 'पोस्ट फॉर्म खोलें' },
  'ai.confirmHint': {
    en: 'Opens the existing JobPostModal with these values. You review and publish there.',
    hi: 'मौजूदा पोस्ट फॉर्म इन मूल्यों के साथ खुलेगा। आप वहीं समीक्षा कर पोस्ट करेंगे।',
  },
  'ai.understood': { en: 'Detected', hi: 'पहचान लिया' },
  'ai.notUnderstood': { en: 'Not detected', hi: 'नहीं मिला' },
  'ai.hint': {
    en: 'Enter sends · Shift+Enter adds a line · Your messages stay on this device.',
    hi: 'Enter से भेजें · Shift+Enter से नई लाइन · आपके संदेश इसी डिवाइस पर रहते हैं।',
  },
  'ai.errorTitle': { en: 'Something went wrong', hi: 'कुछ गड़बड़ हुई' },
  'ai.errorText': {
    en: 'The assistant could not process that message. Please try again or rephrase your question.',
    hi: 'सहायक वह संदेश प्रोसेस नहीं कर सका। कृपया दोबारा कोशिश करें या सवाल दूसरे शब्दों में पूछें।',
  },
  'ai.clearedToast': { en: 'Conversation cleared', hi: 'बातचीत साफ़ कर दी गई' },
  'ai.clearedToastDesc': {
    en: 'This chat was only stored in this tab.',
    hi: 'यह बातचीत सिर्फ़ इसी टैब में थी।',
  },
  'ai.copyFailed': { en: 'Could not copy', hi: 'कॉपी नहीं हो सका' },
  'ai.copyFailedHint': {
    en: 'Copy is not available in this browser. Select the answer text and copy it manually.',
    hi: 'इस ब्राउज़र में कॉपी उपलब्ध नहीं है। उत्तर का टेक्स्ट चुनकर मैन्युअली कॉपी करें।',
  },
  'ai.safetyShort': {
    en: 'Fertilizer doses, pesticide instructions, scheme eligibility, mandi prices and live weather are not guessed.',
    hi: 'खाद की मात्रा, कीटनाशक निर्देश, योजना की पात्रता, मंडी भाव और मौसम का अनुमान नहीं लगाया जाता।',
  },
  'ai.quickPrompts': { en: 'Quick prompts', hi: 'त्वरित सुझाव' },

  'voice.title': { en: 'Voice', hi: 'आवाज़' },
  'voice.micStart': {
    en: 'Start voice input',
    hi: 'आवाज़ से लिखना शुरू करें',
  },
  'voice.micStop': { en: 'Stop listening', hi: 'सुनना बंद करें' },
  'voice.micUnavailable': {
    en: 'Voice input is not available in this browser',
    hi: 'इस ब्राउज़र में आवाज़ से लिखना उपलब्ध नहीं है',
  },
  'voice.ready': { en: 'Ready', hi: 'तैयार' },
  'voice.listening': { en: 'Listening...', hi: 'सुन रहा है...' },
  'voice.processing': { en: 'Processing...', hi: 'प्रोसेस हो रहा है...' },
  'voice.speaking': { en: 'Speaking...', hi: 'बोल रहा है...' },
  'voice.error': { en: 'Voice problem', hi: 'आवाज़ में गड़बड़' },
  'voice.speakReplies': { en: 'Voice replies', hi: 'जवाब सुनाएं' },
  'voice.speakRepliesOn': {
    en: 'Voice replies are on. Answers are read aloud.',
    hi: 'जवाब सुनाना चालू है। उत्तर बोलकर सुनाए जाएंगे।',
  },
  'voice.speakRepliesOff': {
    en: 'Voice replies are off. Answers are shown as text only.',
    hi: 'जवाब सुनाना बंद है। उत्तर सिर्फ़ टेक्स्ट में दिखेंगे।',
  },
  'voice.stopSpeaking': { en: 'Stop speaking', hi: 'बोलना बंद करें' },
  'voice.transcriptHint': {
    en: 'Speech becomes editable text - nothing is sent until you press send.',
    hi: 'बोली बात संपादन योग्य टेक्स्ट बन जाती है - भेजें दबाने तक कुछ नहीं जाता।',
  },
  'voice.privacy': {
    en: 'Your voice is handled by your own browser. KisanSathi has no server and never receives your audio.',
    hi: 'आपकी आवाज़ आपके ही ब्राउज़र के पास रहती है। किसानसाथी का कोई सर्वर नहीं है और वह आपका ऑडियो कभी नहीं पाता।',
  },
  'voice.errorPermissionDenied': {
    en: 'Microphone permission was denied. Allow the microphone in the browser settings to use voice input, or keep typing - the text chat works the same.',
    hi: 'माइक्रोफ़ोन की अनुमति नहीं मिली। आवाज़ से लिखने के लिए ब्राउज़र सेटिंग्स में माइक्रोफ़ोन की अनुमति दें, या टाइप करते रहें - टेक्स्ट चैट वैसे ही काम करती है।',
  },
  'voice.errorNoSpeech': {
    en: 'Nothing was heard. Try again a little closer to the microphone.',
    hi: 'कोई आवाज़ नहीं सुनाई दी। माइक्रोफ़ोन के थोड़ा पास जाकर दोबारा कोशिश करें।',
  },
  'voice.errorAudioCapture': {
    en: 'No microphone could be used. Check that a microphone is connected and not blocked by another app.',
    hi: 'माइक्रोफ़ोन का उपयोग नहीं हो सका। जाँचें कि माइक्रोफ़ोन जुड़ा है और किसी दूसरे ऐप ने उसे ब्लॉक तो नहीं किया।',
  },
  'voice.errorNetwork': {
    en: 'The speech service of your browser could not be reached. Chromium browsers send the audio to the browser maker service for recognition, so this needs a working internet connection. KisanSathi itself never receives your audio. You can keep typing instead.',
    hi: 'आपके ब्राउज़र की स्पीच सेवा से संपर्क नहीं हो सका। Chromium ब्राउज़र पहचान के लिए ऑडियो ब्राउज़र बनाने की सेवा को भेजते हैं, इसलिए इंटरनेट चाहिए। किसानसाथी को आपका ऑडियो कभी नहीं मिलता। आप टाइप करते रह सकते हैं।',
  },
  'voice.errorLanguageNotSupported': {
    en: 'Your browser does not have a speech model for this language. You can change the app language, or keep typing.',
    hi: 'आपके ब्राउज़र में इस भाषा का स्पीच मॉडल नहीं है। आप ऐप की भाषा बदल सकते हैं, या टाइप करते रह सकते हैं।',
  },
  'voice.errorNotSupported': {
    en: 'This browser does not provide speech recognition, so voice input is not possible here. Nothing is faked - keep typing, the text chat works exactly the same.',
    hi: 'इस ब्राउज़र में स्पीच रिकॉग्निशन उपलब्ध नहीं है, इसलिए आवाज़ से लिखना यहाँ संभव नहीं है। कोई नकल नहीं की जा रही है - टाइप करते रहें, टेक्स्ट चैट वैसे ही काम करती है।',
  },
  'voice.errorSynthesisNotSupported': {
    en: 'This browser cannot read the answers aloud. The answers are still shown as text.',
    hi: 'यह ब्राउज़र उत्तर बोलकर नहीं सुना सकता। उत्तर टेक्स्ट में दिखते रहेंगे।',
  },
  'voice.errorStartFailed': {
    en: 'Voice input could not be started. Please try again.',
    hi: 'आवाज़ से लिखना शुरू नहीं हो सका। कृपया दोबारा कोशिश करें।',
  },
  'voice.errorUnknown': {
    en: 'Voice input stopped unexpectedly. Please try again or keep typing.',
    hi: 'आवाज़ से लिखना अचानक बंद हो गया। कृपया दोबारा कोशिश करें या टाइप करते रहें।',
  },

  'planner.eyebrow': { en: 'Planning · approximate', hi: 'योजना · अनुमानित' },
  'planner.title': { en: 'Crop-to-Work Planner', hi: 'फसल से काम की योजना' },
  'planner.subtitle': {
    en: 'Choose your crop, area and start date to build an approximate work timeline, then turn labour-heavy steps into job posts.',
    hi: 'अपनी फसल, रकबा और शुरुआत की तारीख चुनें, अनुमानित काम की समय-सारिणी बनाएँ और ज़्यादा मज़दूर वाले कामों को नौकरी में बदलें।',
  },
  'planner.disclosure': {
    en: 'Prototype planner with curated templates and local calculations.',
    hi: 'क्यूरेटेड टेम्पलेट और स्थानीय गणना वाला प्रोटोटाइप प्लानर।',
  },
  'planner.setupTitle': { en: 'Plan setup', hi: 'योजना सेटअप' },
  'planner.setupSubtitle': {
    en: 'The crop template and crew estimates update from these four choices.',
    hi: 'इन चार चुनावों से फसल टेम्पलेट और मज़दूरों का अनुमान बदलता है।',
  },
  'planner.crop': { en: 'Crop', hi: 'फसल' },
  'planner.cropPlaceholder': { en: 'Select a crop', hi: 'फसल चुनें' },
  'planner.area': { en: 'Farm area (acres)', hi: 'खेत का रकबा (एकड़)' },
  'planner.areaHint': {
    en: '0.1 to 100 acres. Crew estimates scale from this area.',
    hi: '0.1 से 100 एकड़। मज़दूरों का अनुमान इसी रकबे से बढ़ता-घटता है।',
  },
  'planner.district': { en: 'District', hi: 'जिला' },
  'planner.districtPlaceholder': { en: 'Select a district', hi: 'जिला चुनें' },
  'planner.startDate': { en: 'Crop start date', hi: 'फसल शुरू होने की तारीख' },
  'planner.startDateHint': {
    en: 'Day 0 for this plan. The crop note below explains what this date means.',
    hi: 'इस योजना का दिन 0। नीचे फसल टिप्पणी बताती है कि यह तारीख किसकी है।',
  },
  'planner.generate': { en: 'Create work plan', hi: 'काम की योजना बनाएँ' },
  'planner.replace': { en: 'Replace plan', hi: 'योजना बदलें' },
  'planner.cancel': { en: 'Cancel', hi: 'रद्द करें' },
  'planner.formNote': {
    en: 'Dates are approximate and labour is illustrative. Verify with your KVK or agriculture officer.',
    hi: 'तारीखें अनुमानित और मज़दूरों की संख्या उदाहरण हैं। केवीके या कृषि अधिकारी से पुष्टि करें।',
  },
  'planner.errorCropRequired': { en: 'Choose a crop.', hi: 'फसल चुनें।' },
  'planner.errorCropUnsupported': {
    en: 'This crop is not in the planner yet.',
    hi: 'यह फसल अभी प्लानर में उपलब्ध नहीं है।',
  },
  'planner.errorAreaRequired': {
    en: 'Enter the farm area in acres.',
    hi: 'खेत का रकबा एकड़ में भरें।',
  },
  'planner.errorAreaInvalid': {
    en: 'Enter a valid number of acres.',
    hi: 'एकड़ में सही संख्या भरें।',
  },
  'planner.errorAreaRange': {
    en: 'Area must be between 0.1 and 100 acres.',
    hi: 'रकबा 0.1 से 100 एकड़ के बीच होना चाहिए।',
  },
  'planner.errorDistrictRequired': { en: 'Choose a district.', hi: 'जिला चुनें।' },
  'planner.errorDistrictInvalid': {
    en: 'Choose a district from the list.',
    hi: 'सूची में से जिला चुनें।',
  },
  'planner.errorDateRequired': {
    en: 'Choose the crop start date.',
    hi: 'फसल शुरू होने की तारीख चुनें।',
  },
  'planner.errorDateInvalid': { en: 'Enter a valid date.', hi: 'सही तारीख भरें।' },
  'planner.errorDateRange': {
    en: 'Choose a date between 2000 and 2100.',
    hi: '2000 से 2100 के बीच की तारीख चुनें।',
  },
  'planner.fixFields': {
    en: 'Please fix the highlighted fields',
    hi: 'चिह्नित फ़ील्ड ठीक करें',
  },
  'planner.fixFieldsBody': {
    en: 'Some plan details are missing or invalid.',
    hi: 'योजना की कुछ जानकारी गायब या गलत है।',
  },
  'planner.emptyTitle': { en: 'No crop plan yet', hi: 'अभी कोई फसल योजना नहीं' },
  'planner.emptyBody': {
    en: 'Pick a crop on the left to see a stage-by-stage work timeline for your farm.',
    hi: 'बाईं ओर फसल चुनें और अपने खेत के लिए चरण-दर-चरण काम की समय-सारिणी देखें।',
  },
  'planner.emptyPoint1': {
    en: 'Crop-specific stages, not one generic checklist.',
    hi: 'हर फसल के अपने चरण, कोई सामान्य सूची नहीं।',
  },
  'planner.emptyPoint2': {
    en: 'Crew estimates scale transparently from your acreage.',
    hi: 'मज़दूरों का अनुमान आपके रकबे से साफ गणना के साथ बढ़ता है।',
  },
  'planner.emptyPoint3': {
    en: 'Turn labour-heavy steps into marketplace job posts.',
    hi: 'ज़्यादा मज़दूर वाले कामों को मार्केटप्लेस में नौकरी बनाएँ।',
  },
  'planner.emptyFoot': {
    en: 'Templates are planning aids; always confirm local dates and practices.',
    hi: 'टेम्पलेट योजना सहायता हैं; स्थानीय तारीखों व तरीकों की पुष्टि करें।',
  },
  'planner.planFor': { en: '{crop} work plan', hi: '{crop} काम की योजना' },
  'planner.areaValue': { en: '{area} acres', hi: '{area} एकड़' },
  'planner.startMeta': { en: 'Day 0 · {date}', hi: 'दिन 0 · {date}' },
  'planner.dayZero': { en: 'Day 0', hi: 'दिन 0' },
  'planner.spanLabel': { en: 'Plan span', hi: 'योजना अवधि' },
  'planner.spanValue': { en: '{days} days', hi: '{days} दिन' },
  'planner.progressTitle': { en: 'Overall progress', hi: 'कुल प्रगति' },
  'planner.progressCount': {
    en: '{done} of {total} tasks done',
    hi: '{total} में से {done} काम पूरे',
  },
  'planner.workerDaysLabel': {
    en: 'Illustrative worker-days',
    hi: 'अनुमानित मज़दूर-दिन',
  },
  'planner.workerDays': { en: '{days} worker-days', hi: '{days} मज़दूर-दिन' },
  'planner.crewTasks': {
    en: '{count} tasks have a crew estimate',
    hi: '{count} कामों में मज़दूरों का अनुमान है',
  },
  'planner.nextUp': { en: 'Next up', hi: 'आगे के काम' },
  'planner.nextUpEmpty': {
    en: 'Every task in this plan is complete.',
    hi: 'इस योजना के सभी काम पूरे हैं।',
  },
  'planner.addTask': { en: 'Add custom task', hi: 'अपना काम जोड़ें' },
  'planner.planSettings': { en: 'Plan settings', hi: 'योजना सेटिंग' },
  'planner.hideSettings': { en: 'Hide settings', hi: 'सेटिंग छिपाएँ' },
  'planner.print': { en: 'Print', hi: 'प्रिंट' },
  'planner.clearPlan': { en: 'Clear plan', hi: 'योजना हटाएँ' },
  'planner.overdue': { en: 'Overdue', hi: 'समय बीत गया' },
  'planner.today': { en: 'Today', hi: 'आज' },
  'planner.completedBadge': { en: 'Done', hi: 'पूरा' },
  'planner.timelineTitle': { en: 'Work timeline', hi: 'काम की समय-सारिणी' },
  'planner.timelineSubtitle': {
    en: '{count} steps · approximate dates · verify locally',
    hi: '{count} चरण · अनुमानित तारीखें · स्थानीय पुष्टि करें',
  },
  'planner.customTask': { en: 'Custom task', hi: 'अपना काम' },
  'planner.stage': { en: 'Stage {number}', hi: 'चरण {number}' },
  'planner.day': { en: 'Day {day}', hi: 'दिन {day}' },
  'planner.beforeStart': { en: 'Before start', hi: 'शुरुआत से पहले' },
  'planner.markComplete': { en: 'Mark complete', hi: 'पूरा हुआ' },
  'planner.completed': { en: 'Completed', hi: 'पूरा' },
  'planner.markIncomplete': { en: 'Mark incomplete', hi: 'अधूरा करें' },
  'planner.editTask': { en: 'Edit', hi: 'संपादित करें' },
  'planner.removeTask': { en: 'Remove', hi: 'हटाएँ' },
  'planner.createJob': { en: 'Create job', hi: 'नौकरी बनाएँ' },
  'planner.noLabour': { en: 'No crew estimate', hi: 'मज़दूरों का अनुमान नहीं' },
  'planner.noLabourHint': {
    en: 'Usually farm-family, skilled or mechanised work.',
    hi: 'आमतौर पर परिवार, कुशल या मशीन का काम।',
  },
  'planner.labourTitle': { en: 'Estimated crew', hi: 'अनुमानित टोली' },
  'planner.workersValue': { en: '{workers} workers', hi: '{workers} मज़दूर' },
  'planner.durationValue': { en: '{days} days', hi: '{days} दिन' },
  'planner.formula': {
    en: '{perAcre} workers/acre × {area} acres, rounded up',
    hi: '{perAcre} मज़दूर/एकड़ × {area} एकड़, ऊपर की पूर्ण संख्या',
  },
  'planner.minimumCrew': { en: 'minimum crew {min}', hi: 'न्यूनतम टोली {min}' },
  'planner.capped': {
    en: 'capped at {max} for one job',
    hi: 'एक नौकरी के लिए {max} तक सीमित',
  },
  'planner.farmerEstimate': { en: 'Your estimate', hi: 'आपका अनुमान' },
  'planner.farmerEstimateHint': {
    en: 'Custom task, so no acreage formula is applied.',
    hi: 'अपना काम, इसलिए रकबे का फ़ॉर्मूला लागू नहीं।',
  },
  'planner.illustrative': { en: 'Illustrative estimate', hi: 'उदाहरण अनुमान' },
  'planner.approx': { en: 'Approximate dates', hi: 'अनुमानित तारीखें' },
  'planner.jobReady': { en: 'Can become a job', hi: 'नौकरी बन सकती है' },
  'planner.edited': { en: 'Edited', hi: 'संपादित' },
  'planner.taskUpdated': { en: 'Task updated', hi: 'काम अपडेट हुआ' },
  'planner.taskUpdatedBody': {
    en: 'Your edit is saved on this device.',
    hi: 'आपका बदलाव इसी डिवाइस पर सहेजा गया।',
  },
  'planner.customAdded': { en: 'Custom task added', hi: 'अपना काम जोड़ा गया' },
  'planner.customAddedBody': {
    en: 'It is included in your plan and progress.',
    hi: 'यह आपकी योजना और प्रगति में शामिल है।',
  },
  'planner.customRemoved': { en: 'Custom task removed', hi: 'अपना काम हटाया गया' },
  'planner.customRemovedBody': {
    en: 'The crop template was not changed.',
    hi: 'फसल टेम्पलेट नहीं बदला गया।',
  },
  'planner.removeTitle': { en: 'Remove custom task?', hi: 'अपना काम हटाएँ?' },
  'planner.removeBody': {
    en: '"{name}" will be removed from this plan. Template stages are not affected.',
    hi: '"{name}" इस योजना से हट जाएगा। टेम्पलेट चरण प्रभावित नहीं होंगे।',
  },
  'planner.removeConfirm': { en: 'Remove task', hi: 'काम हटाएँ' },
  'planner.keepTask': { en: 'Keep task', hi: 'काम रखें' },
  'planner.editBaseTitle': { en: 'Edit crop task', hi: 'फसल का काम संपादित करें' },
  'planner.editCustomTitle': { en: 'Edit custom task', hi: 'अपना काम संपादित करें' },
  'planner.editBaseSub': {
    en: 'Change the wording or move the estimated date. The crop template stays intact.',
    hi: 'शब्द या अनुमानित तारीख बदलें। फसल टेम्पलेट वैसा ही रहेगा।',
  },
  'planner.editCustomSub': {
    en: 'Only this custom task changes.',
    hi: 'केवल यह अपना काम बदलेगा।',
  },
  'planner.taskName': { en: 'Task name', hi: 'काम का नाम' },
  'planner.description': { en: 'Description', hi: 'विवरण' },
  'planner.descriptionHint': {
    en: 'Your wording replaces the template text for this task.',
    hi: 'आपके शब्द इस काम में टेम्पलेट की जगह दिखेंगे।',
  },
  'planner.date': { en: 'Estimated date', hi: 'अनुमानित तारीख' },
  'planner.dateHint': {
    en: 'This moves the start date; the stage length stays the same.',
    hi: 'इससे शुरुआत की तारीख बदलेगी; चरण की अवधि वही रहेगी।',
  },
  'planner.workers': { en: 'Workers needed (optional)', hi: 'ज़रूरी मज़दूर (वैकल्पिक)' },
  'planner.workersHint': {
    en: 'Leave blank if you do not need a crew.',
    hi: 'अगर टोली नहीं चाहिए तो खाली छोड़ें।',
  },
  'planner.workType': { en: 'Work type', hi: 'काम का प्रकार' },
  'planner.village': { en: 'Village', hi: 'गाँव' },
  'planner.saveChanges': { en: 'Save changes', hi: 'बदलाव सहेजें' },
  'planner.resetFields': { en: 'Reset fields to template', hi: 'फ़ील्ड टेम्पलेट पर लौटाएँ' },
  'planner.errorName': {
    en: 'Give the task a name (2–80 characters).',
    hi: 'काम को नाम दें (2–80 अक्षर)।',
  },
  'planner.errorDescription': {
    en: 'Keep the description under 400 characters.',
    hi: 'विवरण 400 अक्षरों से कम रखें।',
  },
  'planner.errorDescriptionRequired': {
    en: 'Add a short description so the task is clear.',
    hi: 'काम स्पष्ट रहे इसके लिए छोटा विवरण जोड़ें।',
  },
  'planner.errorWorkers': {
    en: 'Enter a whole number between 1 and 100, or leave it blank.',
    hi: '1 से 100 के बीच पूरी संख्या भरें, या खाली छोड़ें।',
  },
  'planner.errorDate': { en: 'Choose a valid date.', hi: 'सही तारीख चुनें।' },
  'planner.addTitle': { en: 'Add a custom task', hi: 'अपना काम जोड़ें' },
  'planner.addSub': {
    en: 'Add work that is specific to your farm. It sits alongside the crop template.',
    hi: 'अपने खेत का खास काम जोड़ें। यह फसल टेम्पलेट के साथ दिखेगा।',
  },
  'planner.addButton': { en: 'Add task', hi: 'काम जोड़ें' },
  'planner.customLimitTitle': {
    en: 'Custom task limit reached',
    hi: 'अपने कामों की सीमा पूरी',
  },
  'planner.customLimitBody': {
    en: 'This demo plan allows up to {max} custom tasks. Remove one before adding another.',
    hi: 'इस डेमो योजना में {max} तक अपने काम जोड़े जा सकते हैं। नया जोड़ने से पहले एक हटाएँ।',
  },
  'planner.namePlaceholder': {
    en: 'e.g. Repair the field channel',
    hi: 'उदा. खेत की नाली ठीक करें',
  },
  'planner.descriptionPlaceholder': {
    en: 'What needs to be done?',
    hi: 'क्या करना है?',
  },
  'planner.replaceTitle': {
    en: 'Replace the current plan?',
    hi: 'मौजूदा योजना बदलें?',
  },
  'planner.replaceBody': {
    en: 'A new plan resets task completion, edits and custom tasks. {done} completed tasks and {custom} custom tasks will be cleared.',
    hi: 'नई योजना से कामों की प्रगति, बदलाव और अपने काम रीसेट हो जाएँगे। {done} पूरे काम और {custom} अपने काम हट जाएँगे।',
  },
  'planner.replaceConfirm': { en: 'Replace plan', hi: 'योजना बदलें' },
  'planner.replaceKeep': { en: 'Keep current plan', hi: 'मौजूदा योजना रखें' },
  'planner.clearTitle': { en: 'Clear this crop plan?', hi: 'यह फसल योजना हटाएँ?' },
  'planner.clearBody': {
    en: 'The plan, its progress and custom tasks will be removed from this device. Jobs already posted in the marketplace are not affected.',
    hi: 'योजना, प्रगति और अपने काम इस डिवाइस से हट जाएँगे। मार्केटप्लेस में पोस्ट की गई नौकरियाँ प्रभावित नहीं होंगी।',
  },
  'planner.clearConfirm': { en: 'Clear plan', hi: 'योजना हटाएँ' },
  'planner.clearedToast': { en: 'Crop plan cleared', hi: 'फसल योजना हटाई गई' },
  'planner.clearedBody': {
    en: 'Posted jobs and other demo data are unchanged.',
    hi: 'पोस्ट की गई नौकरियाँ और बाकी डेमो डेटा वैसे ही हैं।',
  },
  'planner.createdToast': { en: 'Crop plan created', hi: 'फसल योजना बनी' },
  'planner.createdBody': {
    en: '{crop} · {area} acres · {count} stages. Verify dates with your local expert.',
    hi: '{crop} · {area} एकड़ · {count} चरण। तारीखों की स्थानीय विशेषज्ञ से पुष्टि करें।',
  },
  'planner.replacedToast': { en: 'Crop plan replaced', hi: 'फसल योजना बदली गई' },
  'planner.replacedBody': {
    en: 'The previous plan edits were reset; posted jobs are unchanged.',
    hi: 'पिछली योजना के बदलाव रीसेट हुए; पोस्ट की गई नौकरियाँ वैसी ही हैं।',
  },
  'planner.jobDraftTitle': { en: 'Create a job from this task', hi: 'इस काम से नौकरी बनाएँ' },
  'planner.jobDraftSub': {
    en: 'Review what will be carried into the existing job post form. Nothing is published here.',
    hi: 'देखें कि मौजूदा नौकरी फॉर्म में क्या जाएगा। यहाँ कुछ पोस्ट नहीं होता।',
  },
  'planner.jobTask': { en: 'Plan task', hi: 'योजना का काम' },
  'planner.jobPrefilled': { en: 'Prefilled from your plan', hi: 'आपकी योजना से भरा गया' },
  'planner.jobConfirmFields': {
    en: 'You set these in the form',
    hi: 'इन्हें आप फॉर्म में तय करेंगे',
  },
  'planner.jobWage': { en: 'Daily wage', hi: 'दिहाड़ी' },
  'planner.jobWageHint': {
    en: 'Not estimated - pay varies by place and season.',
    hi: 'अनुमान नहीं लगाया - दिहाड़ी जगह और मौसम से बदलती है।',
  },
  'planner.jobStartTime': { en: 'Start time', hi: 'शुरू का समय' },
  'planner.jobFacilities': {
    en: 'Facilities and description',
    hi: 'सुविधाएँ और विवरण',
  },
  'planner.jobDatePast': {
    en: 'This task date has passed. Choose a new work date in the form.',
    hi: 'इस काम की तारीख बीत चुकी है। फॉर्म में नई तारीख चुनें।',
  },
  'planner.jobOpenForm': { en: 'Continue to post form', hi: 'पोस्ट फॉर्म पर जाएँ' },
  'planner.jobDraftHint': {
    en: 'You still review and press Publish yourself.',
    hi: 'आप खुद जाँचकर पब्लिश दबाएँगे।',
  },
  'planner.viewJobs': { en: 'View posted jobs', hi: 'पोस्ट की नौकरियाँ देखें' },
  'planner.assumptionsTitle': {
    en: 'How this plan is calculated',
    hi: 'यह योजना कैसे बनती है',
  },
  'planner.assumptionsTiming': {
    en: 'Stage dates are rough day ranges from your start date. Variety, weather, soil and water can move them.',
    hi: 'चरणों की तारीखें शुरुआत से अनुमानित दिन हैं। किस्म, मौसम, मिट्टी और पानी इन्हें बदल सकते हैं।',
  },
  'planner.referencesTitle': { en: 'General references', hi: 'सामान्य स्रोत' },
  'planner.referenceVisit': { en: 'Open site', hi: 'साइट खोलें' },
  'planner.legendTitle': { en: 'Labels', hi: 'लेबल' },
  'planner.legendApprox': { en: 'Approximate dates', hi: 'अनुमानित तारीखें' },
  'planner.legendIllustrative': {
    en: 'Illustrative labour',
    hi: 'उदाहरण मज़दूर अनुमान',
  },
  'planner.legendJob': { en: 'Can become a job', hi: 'नौकरी बन सकती है' },
  'planner.legendDone': { en: 'Completed', hi: 'पूरा' },
  'planner.areaUnit': { en: 'acres', hi: 'एकड़' },
  'planner.workersUnit': { en: 'workers', hi: 'मज़दूर' },
  'planner.daysUnit': { en: 'days', hi: 'दिन' },
  'planner.taskCount': { en: '{count} tasks', hi: '{count} काम' },

  'profile.eyebrow': { en: 'Account', hi: 'खाता' },
  'profile.title': { en: 'Profile', hi: 'प्रोफ़ाइल' },
  'profile.description': {
    en: 'Manage your demo profile and reset the prototype state.',
    hi: 'अपनी डेमो प्रोफ़ाइल देखें और प्रोटोटाइप की स्थिति रीसेट करें।',
  },
  'profile.reset': { en: 'Reset demo data', hi: 'डेमो डेटा रीसेट करें' },
  'profile.demoBadge': { en: 'KisanSathi Demo', hi: 'किसानसाथी डेमो' },
  'profile.roleLabel': { en: 'Role: {role}', hi: 'भूमिका: {role}' },
  'profile.landHolding': { en: 'Land holding', hi: 'जोत' },
  'profile.preferredCrop': { en: 'Preferred crop', hi: 'पसंदीदा फसल' },
  'profile.languages': { en: 'Languages', hi: 'भाषाएँ' },
  'profile.phone': { en: 'Phone', hi: 'फ़ोन' },
  'profile.editTitle': { en: 'Edit profile', hi: 'प्रोफ़ाइल बदलें' },
  'profile.editSubtitle': {
    en: 'Changes are saved to your signed-in account.',
    hi: 'बदलाव आपके साइन-इन खाते में सेव होते हैं।',
  },
  'profile.fullName': { en: 'Full name', hi: 'पूरा नाम' },
  'profile.village': { en: 'Village', hi: 'गाँव' },
  'profile.district': { en: 'District', hi: 'ज़िला' },
  'profile.save': { en: 'Save profile', hi: 'प्रोफ़ाइल सेव करें' },
  'profile.savedToast': { en: 'Profile updated', hi: 'प्रोफ़ाइल अपडेट हो गई' },
  'profile.savedToastBody': {
    en: 'Your demo profile has been saved.',
    hi: 'आपकी डेमो प्रोफ़ाइल सेव हो गई है।',
  },
  'profile.aboutTitle': { en: 'About this prototype', hi: 'इस प्रोटोटाइप के बारे में' },
  'profile.aboutSubtitle': {
    en: 'KisanSathi is built for a hackathon demo - no live integrations.',
    hi: 'किसानसाथी एक हैकाथॉन डेमो के लिए बना है - कोई लाइव इंटीग्रेशन नहीं।',
  },
  'profile.featureHiring': { en: 'Farmer–Worker hiring', hi: 'किसान–मज़दूर भर्ती' },
  'profile.featureHiringBody': {
    en: 'Post jobs, track vacancies and let workers enroll in this local demo.',
    hi: 'इस लोकल डेमो में नौकरी दें, रिक्त पद देखें और मज़दूरों को शामिल करें।',
  },
  'profile.featureAi': { en: 'Kisan AI', hi: 'किसान AI' },
  'profile.featureAiBody': {
    en: 'Local rule-based assistant that answers crop questions and drafts job posts. No AI API is connected.',
    hi: 'लोकल नियम-आधारित सहायक जो फसलों के सवालों के जवाब देता है और नौकरी का ड्राफ्ट बनाता है। कोई AI API जुड़ा नहीं है।',
  },
  'profile.featurePlanner': { en: 'Crop-to-Work Planner', hi: 'फसल से काम तक योजना' },
  'profile.featurePlannerBody': {
    en: 'Maps crop stages to labour needs and converts tasks into job posts.',
    hi: 'फसल के चरणों को मज़दूरों की ज़रूरत से जोड़ता है और काम को नौकरी में बदलता है।',
  },
  'profile.resetTitle': { en: 'Reset demo data?', hi: 'डेमो डेटा रीसेट करें?' },
  'profile.resetBody': {
    en: 'Posted jobs, enrollments and the crop plan are cleared and the sample data is restored. Your role and language stay as they are.',
    hi: 'पोस्ट की गई नौकरियाँ, शामिली और फसल योजना हट जाएँगी और नमूना डेटा वापस आ जाएगा। आपकी भूमिका और भाषा वैसी ही रहेंगी।',
  },
  'profile.resetConfirm': { en: 'Reset demo data', hi: 'डेमो डेटा रीसेट करें' },
  'profile.resetItemJobs': {
    en: 'Posted jobs and their enrollments',
    hi: 'पोस्ट की गई नौकरियाँ और उनमें शामिली',
  },
  'profile.resetItemPlan': {
    en: 'The crop-to-work plan and its tasks',
    hi: 'फसल से काम तक की योजना और उसके काम',
  },
  'profile.resetKept': {
    en: 'Kept: your role, language and profile details.',
    hi: 'यह रहेगा: आपकी भूमिका, भाषा और प्रोफ़ाइल की जानकारी।',
  },
  'profile.resetToast': { en: 'Demo reset', hi: 'डेमो रीसेट हो गया' },
  'profile.resetToastBody': {
    en: 'Jobs, enrollments and state have been restored to sample data.',
    hi: 'नौकरियाँ, शामिली और स्थिति नमूना डेटा पर लौट आई है।',
  },
} as const satisfies Record<string, { en: string; hi: string }>

export type StringKey = keyof typeof STRINGS

export type StringParams = Record<string, string | number>

/** Resolves a string key for the active UI language, with optional `{token}` interpolation. */
export function useT(): (key: StringKey, params?: StringParams) => string {
  const { state } = useApp()
  const language: UiLanguage = state.language

  return useCallback(
    (key: StringKey, params?: StringParams) => {
      let value: string = STRINGS[key][language] ?? STRINGS[key].en
      if (params) {
        for (const [token, replacement] of Object.entries(params)) {
          value = value.replaceAll(`{${token}}`, String(replacement))
        }
      }
      return value
    },
    [language],
  )
}

/** Picks the matching field from a bilingual record. */
export function pick(language: UiLanguage, en: string, hi: string): string {
  return language === 'hi' ? hi : en
}
