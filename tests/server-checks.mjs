import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'

import { assertProductionSecrets } from '../server/env.mjs'
import {
  hashOtp,
  hashSessionToken,
  normalizePhone,
  otpMatches,
} from '../server/auth.mjs'
import {
  analyzePhotoWithGroq,
  askGroq,
  groqConfigured,
} from '../server/groq.mjs'
import { localPhotoFallbackAfterError } from '../server/localVisionFallback.mjs'

let passed = 0
let failed = 0

async function check(name, fn) {
  try {
    await fn()
    passed += 1
    console.log('PASS  ' + name)
  } catch (error) {
    failed += 1
    console.error('FAIL  ' + name + ' :: ' + error.message)
  }
}

process.env.NODE_ENV = 'development'
delete process.env.SESSION_SECRET
delete process.env.OTP_PEPPER
process.env.GROQ_API_KEY = 'test-key'
process.env.GROQ_CHAT_MODEL = 'chat-model-test'
process.env.GROQ_VISION_MODEL = 'vision-model-test'

const requests = []
globalThis.fetch = async (url, options) => {
  const body = JSON.parse(options.body)
  requests.push({ url, headers: options.headers, body })
  return {
    ok: true,
    json: async () => ({
      choices: [
        {
          message: {
            content: body.response_format
              ? '{"possibleIssue":"test","whyItMayFit":"test","confidence":"low"}'
              : 'test answer',
          },
        },
      ],
    }),
  }
}

await check('Groq chat and vision use the documented endpoint and model vars', async () => {
  await askGroq('test question', {
    language: 'en',
    profile: { district: 'Patna' },
    conversation: [
      { role: 'user', text: 'earlier question' },
      { role: 'assistant', text: 'earlier answer' },
      { role: 'user', text: 'test question' },
    ],
  })
  await analyzePhotoWithGroq({
    imageDataUrl: 'data:image/png;base64,AA==',
    description: 'test',
    language: 'en',
  })

  assert.deepEqual(
    requests.map((request) => request.body.model),
    ['chat-model-test', 'vision-model-test'],
  )
  assert.equal(requests[0].url, 'https://api.groq.com/openai/v1/chat/completions')
  assert.equal(requests[0].headers.Authorization, 'Bearer test-key')
  assert.equal(requests[1].headers.Authorization, 'Bearer test-key')
  assert.equal(requests[0].body.max_completion_tokens, 1200)
  assert.equal(requests[1].body.max_completion_tokens, 2400)
})

await check('Groq chat keeps context and does not duplicate the current question', async () => {
  const messages = requests[0].body.messages
  assert.deepEqual(
    messages.map((message) => message.role),
    ['system', 'user', 'assistant', 'user'],
  )
  assert.equal(messages[1].content, 'earlier question')
  assert.equal(messages[2].content, 'earlier answer')
  assert.equal(messages[3].content, 'test question')
  assert.match(messages[0].content, /no name or phone number/i)
})

await check('Groq vision sends an image payload and requests JSON', async () => {
  const body = requests[1].body
  assert.deepEqual(body.response_format, { type: 'json_object' })
  const content = body.messages[1].content
  assert.equal(content[0].type, 'text')
  assert.equal(content[1].type, 'image_url')
  assert.equal(content[1].image_url.url, 'data:image/png;base64,AA==')
})

await check('missing Groq key disables chat and vision before any request', async () => {
  delete process.env.GROQ_API_KEY
  assert.equal(groqConfigured(), false)
  await assert.rejects(() => askGroq('test question'), /not configured/i)
  await assert.rejects(
    () =>
      analyzePhotoWithGroq({
        imageDataUrl: 'data:image/png;base64,AA==',
        description: 'test',
        language: 'en',
      }),
    /not configured/i,
  )
  process.env.GROQ_API_KEY = 'test-key'
})

await check('Groq failures do not expose the key or response body', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => ({ ok: false, status: 401 })
  await assert.rejects(
    () => askGroq('test question'),
    (error) => {
      assert.match(error.message, /401/)
      assert.doesNotMatch(error.message, /test-key/)
      assert.doesNotMatch(error.message, /Bearer/)
      return true
    },
  )
  globalThis.fetch = originalFetch
})

await check('session tokens are HMAC-hashed with SESSION_SECRET', () => {
  process.env.SESSION_SECRET = 'a'.repeat(32)
  const first = hashSessionToken('fixed-token')
  process.env.SESSION_SECRET = 'b'.repeat(32)
  const second = hashSessionToken('fixed-token')
  const expected = createHmac('sha256', 'b'.repeat(32))
    .update('fixed-token')
    .digest('hex')
  assert.equal(first.length, 64)
  assert.notEqual(first, second)
  assert.equal(second, expected)
})

await check('development OTP hashes use the configured pepper', () => {
  process.env.OTP_PEPPER = 'p'.repeat(32)
  const first = hashOtp('challenge', '123456')
  process.env.OTP_PEPPER = 'q'.repeat(32)
  const second = hashOtp('challenge', '123456')
  assert.notEqual(first, second)
  assert.equal(otpMatches('challenge', '123456', second), true)
  assert.equal(otpMatches('challenge', '654321', second), false)
})

await check('production refuses missing or short secrets', () => {
  process.env.NODE_ENV = 'production'
  delete process.env.SESSION_SECRET
  delete process.env.OTP_PEPPER
  assert.throws(() => assertProductionSecrets(), /SESSION_SECRET is missing/i)
  process.env.SESSION_SECRET = 'short'
  process.env.OTP_PEPPER = 'p'.repeat(32)
  assert.throws(() => assertProductionSecrets(), /at least 32 characters/i)
  process.env.SESSION_SECRET = 's'.repeat(32)
  assert.doesNotThrow(() => assertProductionSecrets())
  process.env.NODE_ENV = 'development'
})

await check('phone normalisation accepts Indian mobile forms', () => {
  assert.equal(normalizePhone('98765 43210'), '9876543210')
  assert.equal(normalizePhone('+91 98765 43210'), '9876543210')
  assert.equal(normalizePhone('098765 43210'), '9876543210')
  assert.equal(normalizePhone('12345'), null)
  assert.equal(normalizePhone('5876543210'), null)
})

await check('provider failure fallback reports the real reason', () => {
  const result = localPhotoFallbackAfterError(
    {
      imageDataUrl: 'data:image/png;base64,AA==',
      description: 'yellow leaves',
      context: {},
      language: 'en',
    },
    'vision-provider-unavailable',
  )
  assert.equal(result.fallbackReason, 'vision-provider-unavailable')
  assert.match(result.notice, /vision service was unavailable/i)
  assert.doesNotMatch(result.notice, /No vision model is configured/i)
})

console.log('\nServer checks: ' + passed + '/' + (passed + failed) + ' passed')
if (failed) process.exitCode = 1
