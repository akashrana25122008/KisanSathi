const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const DEFAULT_CHAT_MODEL = 'openai/gpt-oss-120b'
const DEFAULT_VISION_MODEL = 'qwen/qwen3.8-27b'
const REQUEST_TIMEOUT_MS = 30000

function envValue(name) {
  const value = process.env[name]
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

export function groqConfigured() {
  return Boolean(envValue('GROQ_API_KEY'))
}

export function groqChatModel() {
  return envValue('GROQ_CHAT_MODEL') || DEFAULT_CHAT_MODEL
}

export function groqVisionModel() {
  return envValue('GROQ_VISION_MODEL') || DEFAULT_VISION_MODEL
}

async function callGroq(messages, { vision = false, json = false } = {}) {
  if (!groqConfigured()) throw new Error('Groq is not configured')

  const body = {
    model: vision ? groqVisionModel() : groqChatModel(),
    temperature: 0.2,
    max_completion_tokens: vision ? 2400 : 1200,
    messages,
  }
  if (json) body.response_format = { type: 'json_object' }

  let response
  try {
    response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${envValue('GROQ_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch {
    throw new Error('Groq request failed (network or timeout)')
  }

  if (!response.ok) {
    throw new Error(`Groq request failed (${response.status})`)
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new Error('Groq returned an invalid response')
  }

  const content = payload?.choices?.[0]?.message?.content
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Groq returned an empty answer')
  }
  return content.trim()
}

function systemPrompt(language) {
  return [
    'You are KisanSathi, a careful agricultural assistant for small farmers in India.',
    `Answer in ${language}.`,
    'Be practical and concise. Ask a short follow-up when the question is missing key local facts.',
    'Never invent pesticide product names, chemical doses, fertilizer quantities, mandi prices, weather forecasts, scheme amounts or guaranteed yields.',
    'For those topics, explain that the value must come from a KVK, extension officer, soil test report or official portal.',
    'Distinguish general guidance from confirmed facts. Never claim certainty about a crop disease.',
  ].join(' ')
}

function conversationMessages(context) {
  const conversation = Array.isArray(context.conversation) ? context.conversation : []
  const last = conversation[conversation.length - 1]
  const turns =
    last?.role === 'user' && last.text === context.question
      ? conversation.slice(0, -1)
      : conversation

  return turns
    .filter(
      (turn) =>
        turn &&
        (turn.role === 'user' || turn.role === 'assistant') &&
        typeof turn.text === 'string' &&
        turn.text.trim(),
    )
    .slice(-8)
    .map((turn) => ({ role: turn.role, content: turn.text.trim().slice(0, 500) }))
}

export async function askGroq(question, context = {}) {
  const language = context.language === 'hi' ? 'Hindi (Devanagari)' : 'English'
  const system = [
    systemPrompt(language),
    context.profile
      ? `Farmer context (no name or phone number): ${JSON.stringify(context.profile)}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  return callGroq([
    { role: 'system', content: system },
    ...conversationMessages({ ...context, question }),
    { role: 'user', content: question },
  ])
}

function parseJsonObject(text) {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1))
      } catch {
        return null
      }
    }
    return null
  }
}

function asStringList(value, fallback) {
  if (!Array.isArray(value)) return fallback
  const cleaned = value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6)
  return cleaned.length ? cleaned : fallback
}

export async function analyzePhotoWithGroq(input) {
  const language = input.language === 'hi' ? 'Hindi (Devanagari)' : 'English'
  const system = [
    'You are KisanSathi, a cautious crop-photo triage assistant for Indian farmers.',
    `Reply in ${language}.`,
    'Return ONLY a JSON object with these keys: possibleIssue (string), whyItMayFit (string), whatToInspect (array of short strings), safeNextSteps (array of short strings), whenToContactKvk (string), confidence ("low" | "medium" | "high").',
    'Describe possibilities, never a confirmed diagnosis.',
    'Do not name pesticide products or give chemical/fertilizer doses.',
    'If the photo is unclear or shows no crop, say so in possibleIssue and keep confidence low.',
    input.context ? `Conversation context: ${JSON.stringify(input.context)}.` : '',
    input.description ? `Farmer description: ${input.description}.` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const content = await callGroq(
    [
      { role: 'system', content: system },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text:
              'Look at this crop photo. Give a cautious possibility list, what to inspect, safe next steps, and when to contact a KVK.',
          },
          { type: 'image_url', image_url: { url: input.imageDataUrl } },
        ],
      },
    ],
    { vision: true, json: true },
  )

  const parsed = parseJsonObject(content)
  if (!parsed || typeof parsed.possibleIssue !== 'string') {
    throw new Error('Groq did not return the expected photo-analysis structure')
  }

  const confidence = ['low', 'medium', 'high'].includes(parsed.confidence)
    ? parsed.confidence
    : 'low'

  return {
    possibleIssue: parsed.possibleIssue.slice(0, 500),
    whyItMayFit:
      typeof parsed.whyItMayFit === 'string'
        ? parsed.whyItMayFit.slice(0, 900)
        : 'The visible symptoms in the photo are consistent with more than one cause.',
    whatToInspect: asStringList(parsed.whatToInspect, [
      'Inspect the lower and upper leaves in daylight.',
      'Check the soil around the roots and the watering pattern.',
    ]),
    safeNextSteps: asStringList(parsed.safeNextSteps, [
      'Take closer photos of affected leaves and the root zone.',
      'Remove clearly affected material where practical.',
    ]),
    whenToContactKvk:
      typeof parsed.whenToContactKvk === 'string'
        ? parsed.whenToContactKvk.slice(0, 600)
        : 'Contact your nearest KVK if the problem spreads or does not improve after the safe checks.',
    confidence,
  }
}
