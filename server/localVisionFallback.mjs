import { cropLabel } from './auth.mjs'

const SYMPTOM_LABELS = {
  yellowing: { en: 'yellowing leaves', hi: 'पत्तों का पीला होना' },
  wilting: { en: 'wilting plants', hi: 'पौधों का मुरझाना' },
  rotting: { en: 'rotting at the base or roots', hi: 'जड़ या तने के पास सड़न' },
  pests: { en: 'insects or worm damage', hi: 'कीट या सुंडी का नुकसान' },
  spots: { en: 'spots or lesions on leaves', hi: 'पत्तों पर धब्बे' },
  stunted: { en: 'poor or uneven growth', hi: 'बढ़वार कम या असमान' },
  unclear: { en: 'unclear visible symptoms', hi: 'लक्षण स्पष्ट नहीं' },
}

const ISSUE_BY_SYMPTOM = {
  yellowing: {
    en: 'Water stress, root-zone problems or a nutrient imbalance are possibilities.',
    hi: 'पानी की कमी या अधिकता, जड़ की समस्या या पोषक तत्वों का असंतुलन संभावित कारण हो सकते हैं।',
  },
  wilting: {
    en: 'Water stress, root damage or a vascular problem is possible.',
    hi: 'पानी की कमी, जड़ को नुकसान या तने की रोग-संबंधी समस्या संभावित है।',
  },
  rotting: {
    en: 'Excess water, poor drainage or a root/collar rot is possible.',
    hi: 'अधिक पानी, जल निकास की कमी या जड़/तना सड़न संभावित है।',
  },
  pests: {
    en: 'Chewing or sucking insect damage is possible.',
    hi: 'कीट या चूसने वाले कीटों का नुकसान संभावित है।',
  },
  spots: {
    en: 'A fungal or bacterial leaf problem is possible, along with spray or sun damage.',
    hi: 'फफूंद या जीवाणु से पत्तों की समस्या, या छिड़काव/धूप से नुकसान संभावित है।',
  },
  stunted: {
    en: 'Seed quality, planting depth, soil condition or early water stress may be limiting growth.',
    hi: 'बीज की गुणवत्ता, बुवाई की गहराई, मिट्टी की स्थिति या शुरुआती पानी की कमी बढ़वार रोक सकती है।',
  },
  unclear: {
    en: 'There is not enough information to name a likely cause.',
    hi: 'संभावित कारण बताने के लिए पर्याप्त जानकारी नहीं है।',
  },
}

export function localPhotoFallback(input) {
  const language = input.language === 'hi' ? 'hi' : 'en'
  const crop = cropLabel(input.context?.crop, language)
  const symptomKey = SYMPTOM_LABELS[input.context?.symptom]
    ? input.context?.symptom
    : 'unclear'
  const symptom = SYMPTOM_LABELS[symptomKey][language]
  const issue = ISSUE_BY_SYMPTOM[symptomKey][language]
  const description = input.description
    ? language === 'hi'
      ? ` आपने लिखा: "${input.description}".`
      : ` You described it as: "${input.description}".`
    : ''

  return {
    mode: 'local',
    visionAnalyzed: false,
    possibleIssue:
      language === 'hi'
        ? `${crop || 'फसल'} में ${symptom}। ${issue}`
        : `${crop ? `${crop[0].toUpperCase()}${crop.slice(1)}` : 'The crop'} shows ${symptom}. ${issue}`,
    whyItMayFit:
      language === 'hi'
        ? `यह केवल आपकी बातचीत और विवरण (${symptom}) पर आधारित है।${description} फोटो की असली जाँच नहीं हुई है, इसलिए इसे संभावना ही मानें।`
        : `This is based only on your conversation and description (${symptom}).${description} The photo itself was not analysed, so treat this as a possibility list, not a diagnosis.`,
    whatToInspect:
      language === 'hi'
        ? [
            'प्रभावित और स्वस्थ पौधे की तुलना करें - पत्ते, तना और जड़ का हिस्सा देखें।',
            'मिट्टी की नमी और खेत में पानी खड़ा है या नहीं, यह जाँचें।',
            'कीट पत्तों के नीचे या तने के पास हैं या नहीं, सुबह के समय देखें।',
            'समस्या पूरे खेत में है या धब्बों में, यह लिखें।',
          ]
        : [
            'Compare an affected plant with a healthy one - leaves, stem and root zone.',
            'Check soil moisture and whether water is standing anywhere in the field.',
            'Look under the leaves and near the stem in the morning for insects.',
            'Note whether the problem is patchy or spread across the whole field.',
          ],
    safeNextSteps:
      language === 'hi'
        ? [
            'बिना दवा छिड़काव किए पहले पानी, जल निकास और मिट्टी की स्थिति सुधारें।',
            'साफ दिन में पत्ते, तना और जड़ क्षेत्र की नज़दीकी तस्वीरें लें।',
            'स्पष्ट रूप से प्रभावित पौधे की सामग्री, जहाँ व्यावहारिक हो, हटा दें।',
            'कीटनाशक या उर्वरक की मात्रा का अनुमान न लगाएं - स्थानीय सिफारिश लें।',
          ]
        : [
            'Correct watering, drainage and soil condition first, without spraying a chemical.',
            'Take close-up photos of leaves, stem and the root zone in daylight.',
            'Remove clearly affected plant material where practical.',
            'Do not guess a pesticide or fertilizer dose - get a local recommendation.',
          ],
    whenToContactKvk:
      language === 'hi'
        ? 'अगर समस्या 2-3 दिन में फैलती है, कई पौधे मरते हैं, या जड़/तना सड़ता दिखे तो नज़दीकी KVK या कृषि विस्तार अधिकारी से मिलें। फोटो और प्रभावित पौधे का नमूना साथ ले जाएं।'
        : 'Contact your nearest KVK or extension officer if the problem spreads within 2-3 days, several plants die, or you see rotting at the root or stem. Take the photos and a plant sample with you.',
    confidence: 'low',
    notice:
      language === 'hi'
        ? 'कोई vision मॉडल कॉन्फ़िगर नहीं है, इसलिए फोटो का विश्लेषण नहीं हुआ। यह मार्गदर्शन केवल बातचीत और विवरण पर आधारित है।'
        : 'No vision model is configured, so the photo itself was not analysed. This guidance is based only on your conversation and description.',
    disclaimer:
      language === 'hi'
        ? 'यह पुष्टि किया गया निदान नहीं है। कोई भी उपचार करने से पहले KVK या योग्य कृषि विशेषज्ञ से सलाह लें।'
        : 'This is not a confirmed diagnosis. Confirm with a KVK or qualified agricultural expert before treating the crop.',
  }
}

export function localPhotoFallbackAfterError(input, reason) {
  const result = localPhotoFallback(input)
  return {
    ...result,
    notice:
      input.language === 'hi'
        ? 'vision सेवा उपलब्ध नहीं थी, इसलिए फोटो का विश्लेषण नहीं हुआ। नीचे केवल बातचीत और विवरण पर आधारित मार्गदर्शन है।'
        : 'The vision service was unavailable, so the photo itself was not analysed. The guidance below is based only on your conversation and description.',
    fallbackReason: reason,
  }
}
