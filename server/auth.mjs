import {
  createHmac,
  randomBytes,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto'

export const OTP_TTL_SECONDS = 300
export const OTP_RESEND_SECONDS = 30
export const OTP_MAX_ATTEMPTS = 5
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30
export const SESSION_COOKIE = 'ks_session'

export const CROP_KEYS = [
  'wheat',
  'paddy',
  'cotton',
  'sugarcane',
  'maize',
  'soybean',
  'mustard',
  'tomato',
  'onion',
  'chilli',
  'potato',
  'groundnut',
]

const CROP_LABELS = {
  wheat: { en: 'wheat', hi: 'गेहूँ' },
  paddy: { en: 'paddy', hi: 'धान' },
  cotton: { en: 'cotton', hi: 'कपास' },
  sugarcane: { en: 'sugarcane', hi: 'गन्ना' },
  maize: { en: 'maize', hi: 'मक्का' },
  soybean: { en: 'soybean', hi: 'सोयाबीन' },
  mustard: { en: 'mustard', hi: 'सरसों' },
  tomato: { en: 'tomato', hi: 'टमाटर' },
  onion: { en: 'onion', hi: 'प्याज' },
  chilli: { en: 'chilli', hi: 'मिर्च' },
  potato: { en: 'potato', hi: 'आलू' },
  groundnut: { en: 'groundnut', hi: 'मूंगफली' },
}

export function cropLabel(key, language = 'en') {
  return CROP_LABELS[key]?.[language] ?? CROP_LABELS[key]?.en ?? ''
}

export function normalizePhone(value) {
  if (typeof value !== 'string') return null
  let digits = value.replace(/[^\d]/g, '')
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  return /^[6-9]\d{9}$/.test(digits) ? digits : null
}

export function maskPhone(phone) {
  return `+91 ${phone.slice(0, 2)}••• ••${phone.slice(-3)}`
}

export function displayPhone(phone) {
  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`
}

export function hasTwilioConfig() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_VERIFY_SERVICE_SID,
  )
}

export function otpMode() {
  if (hasTwilioConfig()) return 'twilio'
  if (process.env.NODE_ENV === 'production') return 'unconfigured'
  return 'development'
}

function otpSecret() {
  return (
    process.env.OTP_PEPPER ||
    process.env.SESSION_SECRET ||
    'kisansathi-local-development-otp-pepper'
  )
}

export function generateOtp() {
  return String(randomInt(100000, 1000000))
}

export function hashOtp(challengeId, code) {
  return createHmac('sha256', otpSecret())
    .update(`${challengeId}:${code}`)
    .digest('hex')
}

export function otpMatches(challengeId, code, expectedHash) {
  const actual = Buffer.from(hashOtp(challengeId, code), 'hex')
  const expected = Buffer.from(expectedHash, 'hex')
  if (actual.length !== expected.length) return false
  return timingSafeEqual(actual, expected)
}

export function newSessionToken() {
  return randomBytes(32).toString('base64url')
}

export function hashSessionToken(token) {
  const secret =
    process.env.SESSION_SECRET ||
    process.env.OTP_PEPPER ||
    'kisansathi-local-development-session-secret'
  return createHmac('sha256', secret).update(token).digest('hex')
}

export function newId(prefix) {
  return `${prefix}_${randomUUID()}`
}

export function sanitizeText(value, maxLength = 80) {
  if (typeof value !== 'string') return ''
  return value
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

export function defaultUser(phone, language = 'en') {
  const now = new Date().toISOString()
  return {
    id: newId('usr'),
    phone,
    name: '',
    state: '',
    district: '',
    village: '',
    primaryCrop: '',
    landSize: '',
    language: language === 'hi' ? 'hi' : 'en',
    photoUrl: '',
    profileComplete: false,
    createdAt: now,
    updatedAt: now,
  }
}

export function publicUser(user) {
  if (!user) return null
  return {
    id: user.id,
    phone: user.phone,
    phoneDisplay: displayPhone(user.phone),
    name: user.name,
    state: user.state,
    district: user.district,
    village: user.village,
    primaryCrop: user.primaryCrop,
    landSize: user.landSize,
    language: user.language,
    photoUrl: user.photoUrl,
    profileComplete: Boolean(user.profileComplete),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export function validateProfile(input) {
  const errors = {}
  const name = sanitizeText(input?.name, 60)
  const state = sanitizeText(input?.state, 60)
  const district = sanitizeText(input?.district, 60)
  const village = sanitizeText(input?.village, 60)
  const landSize = sanitizeText(input?.landSize, 30)
  const primaryCrop = sanitizeText(input?.primaryCrop, 20)
  const language = input?.language === 'hi' ? 'hi' : 'en'

  if (name.length < 2) errors.name = 'Please enter your full name.'
  if (state.length < 2) errors.state = 'Please enter your state.'
  if (district.length < 2) errors.district = 'Please enter your district.'
  if (village.length < 2) errors.village = 'Please enter your village.'
  if (!CROP_KEYS.includes(primaryCrop)) errors.primaryCrop = 'Please choose your primary crop.'
  if (!landSize || !/^[\d.,]+\s*(acre|acres|hectare|hectares|bigha|bighas)?$/i.test(landSize)) {
    errors.landSize = 'Enter land size, for example 2.5 acres or 1 hectare.'
  }

  return {
    errors,
    value: {
      name,
      state,
      district,
      village,
      landSize,
      primaryCrop,
      language,
    },
  }
}

export async function sendTwilioOtp(phone) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const service = process.env.TWILIO_VERIFY_SERVICE_SID
  const body = new URLSearchParams({
    To: `+91${phone}`,
    Channel: 'sms',
  })
  const response = await fetch(
    `https://verify.twilio.com/v2/Services/${service}/Verifications`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
      signal: AbortSignal.timeout(15000),
    },
  )
  if (!response.ok) {
    throw new Error(`Twilio verification request failed (${response.status})`)
  }
  return true
}

export async function checkTwilioOtp(phone, code) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const service = process.env.TWILIO_VERIFY_SERVICE_SID
  const body = new URLSearchParams({
    To: `+91${phone}`,
    Code: code,
  })
  const response = await fetch(
    `https://verify.twilio.com/v2/Services/${service}/VerificationCheck`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
      signal: AbortSignal.timeout(15000),
    },
  )
  if (!response.ok) return false
  const result = await response.json()
  return result?.status === 'approved'
}
