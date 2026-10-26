import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_SECONDS,
  OTP_TTL_SECONDS,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  checkTwilioOtp,
  defaultUser,
  generateOtp,
  hashOtp,
  hashSessionToken,
  maskPhone,
  newId,
  newSessionToken,
  normalizePhone,
  otpMatches,
  otpMode,
  publicUser,
  sanitizeText,
  sendTwilioOtp,
  validateProfile,
} from './auth.mjs'
import {
  analyzePhotoWithGroq,
  askGroq,
  groqChatModel,
  groqConfigured,
  groqVisionModel,
} from './groq.mjs'
import { localPhotoFallback, localPhotoFallbackAfterError } from './localVisionFallback.mjs'

const MAX_BODY_BYTES = 8 * 1024 * 1024
const MAX_CROP_IMAGE_BYTES = 4 * 1024 * 1024
const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024
const IMAGE_MIMES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

function sendJson(res, status, payload, headers = {}) {
  const body = JSON.stringify(payload)
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  for (const [key, value] of Object.entries(headers)) res.setHeader(key, value)
  res.end(body)
}

function parseCookies(header) {
  const out = {}
  if (typeof header !== 'string') return out
  for (const part of header.split(';')) {
    const index = part.indexOf('=')
    if (index < 0) continue
    const key = part.slice(0, index).trim()
    const value = part.slice(index + 1).trim()
    if (!key) continue
    try {
      out[key] = decodeURIComponent(value)
    } catch {
      /* ignore malformed cookie values */
    }
  }
  return out
}

function sessionCookie(token, maxAge = SESSION_TTL_SECONDS) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`
}

function clearSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`
}

async function readJson(req, limit = MAX_BODY_BYTES) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) {
      throw new ApiError(413, 'payload_too_large', 'The uploaded data is too large.')
    }
    chunks.push(chunk)
  }
  if (chunks.length === 0) return {}
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('not an object')
    }
    return parsed
  } catch {
    throw new ApiError(400, 'invalid_json', 'The request body is not valid JSON.')
  }
}

function clientIp(req) {
  if (process.env.TRUST_PROXY === '1') {
    const forwarded = req.headers['x-forwarded-for']
    if (typeof forwarded === 'string' && forwarded.trim()) {
      return forwarded.split(',')[0].trim().slice(0, 64)
    }
  }
  return req.socket?.remoteAddress || 'local'
}

function createRateLimiter() {
  const buckets = new Map()

  return function check(key, limit, windowMs) {
    const now = Date.now()
    const existing = buckets.get(key)
    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
      return { allowed: true, retryAfter: 0 }
    }
    existing.count += 1
    if (existing.count > limit) {
      return {
        allowed: false,
        retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      }
    }
    return { allowed: true, retryAfter: 0 }
  }
}

function decodeImageDataUrl(value, maxBytes) {
  if (typeof value !== 'string') {
    throw new ApiError(400, 'missing_image', 'Please attach a crop photo.')
  }
  const match = value.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/)
  if (!match) {
    throw new ApiError(415, 'unsupported_image', 'Use a JPG, PNG or WebP image.')
  }
  const mime = match[1]
  const buffer = Buffer.from(match[2].replace(/\s/g, ''), 'base64')
  if (buffer.length === 0) {
    throw new ApiError(400, 'empty_image', 'The image file is empty.')
  }
  if (buffer.length > maxBytes) {
    throw new ApiError(413, 'image_too_large', 'The image is too large. Use a photo under the size limit.')
  }
  return { mime, buffer, extension: IMAGE_MIMES[mime], dataUrl: value }
}

function sanitizeConversation(value) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => item && typeof item === 'object')
    .slice(-8)
    .map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      text: sanitizeText(item.text, 500),
    }))
    .filter((item) => item.text)
}

function sanitizeContext(value) {
  if (!value || typeof value !== 'object') return {}
  return {
    crop: sanitizeText(value.crop, 30),
    symptom: sanitizeText(value.symptom, 30),
    water: sanitizeText(value.water, 30),
    age: sanitizeText(value.age, 30),
    village: sanitizeText(value.village, 60),
    district: sanitizeText(value.district, 60),
  }
}

function sanitizeProfileContext(value) {
  if (!value || typeof value !== 'object') return null
  return {
    village: sanitizeText(value.village, 60),
    district: sanitizeText(value.district, 60),
    primaryCrop: sanitizeText(value.primaryCrop, 30),
    landSize: sanitizeText(value.landSize, 30),
    language: value.language === 'hi' ? 'hi' : 'en',
  }
}

export function createApiHandler({ store, dataDir }) {
  const uploadsDir = join(dataDir, 'uploads')
  mkdirSync(uploadsDir, { recursive: true })
  const rateLimit = createRateLimiter()

  function authenticate(req) {
    const cookies = parseCookies(req.headers.cookie)
    const token = cookies[SESSION_COOKIE]
    if (!token) return null
    const tokenHash = hashSessionToken(token)
    const session = store.sessionByHash(tokenHash)
    if (!session) return null
    const user = store.userById(session.userId)
    if (!user) return null
    return { user, tokenHash, session }
  }

  function requireUser(req) {
    const auth = authenticate(req)
    if (!auth) throw new ApiError(401, 'unauthorized', 'Please sign in to continue.')
    return auth
  }

  function saveProfilePhoto(dataUrl, userId) {
    const image = decodeImageDataUrl(dataUrl, MAX_PROFILE_IMAGE_BYTES)
    const filename = `${userId.replace(/[^a-z0-9_-]/gi, '')}-${Date.now()}.${image.extension}`
    writeFileSync(join(uploadsDir, filename), image.buffer, { mode: 0o600 })
    return `/api/uploads/${filename}`
  }

  function removeUpload(url) {
    if (typeof url !== 'string') return
    const name = url.split('/').pop()
    if (!name || !/^[a-z0-9_-]+\.(jpg|png|webp)$/i.test(name)) return
    try {
      unlinkSync(join(uploadsDir, name))
    } catch {
      /* already gone */
    }
  }

  async function handleRequestOtp(req, res, body) {
    const phone = normalizePhone(body.phone)
    if (!phone) {
      throw new ApiError(
        422,
        'invalid_phone',
        'Enter a valid 10-digit Indian mobile number starting with 6-9.',
      )
    }

    const ipLimit = rateLimit(`otp-ip:${clientIp(req)}`, 12, 15 * 60 * 1000)
    if (!ipLimit.allowed) {
      throw new ApiError(429, 'rate_limited', 'Too many OTP requests. Please try again later.', {
        retryAfter: ipLimit.retryAfter,
      })
    }
    const phoneLimit = rateLimit(`otp-phone:${phone}`, 5, 15 * 60 * 1000)
    if (!phoneLimit.allowed) {
      throw new ApiError(429, 'rate_limited', 'Too many OTP requests for this number.', {
        retryAfter: phoneLimit.retryAfter,
      })
    }

    const existing = store.challengeByPhone(phone)
    if (existing && Date.now() - existing.createdAt < OTP_RESEND_SECONDS * 1000) {
      const retryAfter = Math.max(
        1,
        Math.ceil((existing.createdAt + OTP_RESEND_SECONDS * 1000 - Date.now()) / 1000),
      )
      throw new ApiError(429, 'cooldown', 'Please wait before requesting another OTP.', {
        retryAfter,
      })
    }

    const mode = otpMode()
    if (mode === 'unconfigured') {
      throw new ApiError(
        503,
        'otp_unconfigured',
        'OTP delivery is not configured. Set Twilio Verify credentials on the server.',
      )
    }

    const challenge = {
      id: newId('otp'),
      phone,
      provider: mode,
      codeHash: '',
      createdAt: Date.now(),
      expiresAt: Date.now() + OTP_TTL_SECONDS * 1000,
      attempts: 0,
      consumed: false,
    }

    let devCode
    if (mode === 'twilio') {
      try {
        await sendTwilioOtp(phone)
      } catch {
        throw new ApiError(502, 'otp_delivery_failed', 'Could not send the SMS OTP. Please try again.')
      }
    } else {
      devCode = generateOtp()
      challenge.codeHash = hashOtp(challenge.id, devCode)
    }

    store.createChallenge(challenge)
    await store.save()

    sendJson(res, 200, {
      ok: true,
      mode,
      phone: maskPhone(phone),
      expiresIn: OTP_TTL_SECONDS,
      resendAfter: OTP_RESEND_SECONDS,
      ...(mode === 'development' ? { devCode } : {}),
    })
  }

  async function handleVerifyOtp(req, res, body) {
    const phone = normalizePhone(body.phone)
    const code = typeof body.code === 'string' ? body.code.replace(/\D/g, '') : ''
    if (!phone) {
      throw new ApiError(422, 'invalid_phone', 'Enter a valid mobile number.')
    }
    if (!/^\d{6}$/.test(code)) {
      throw new ApiError(422, 'invalid_otp', 'Enter the 6-digit OTP.')
    }

    const limit = rateLimit(`verify:${clientIp(req)}:${phone}`, 12, 15 * 60 * 1000)
    if (!limit.allowed) {
      throw new ApiError(429, 'rate_limited', 'Too many verification attempts.', {
        retryAfter: limit.retryAfter,
      })
    }

    const challenge = store.challengeByPhone(phone)
    if (!challenge || challenge.consumed || challenge.expiresAt <= Date.now()) {
      throw new ApiError(400, 'otp_expired', 'This OTP has expired. Request a new one.')
    }
    if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
      throw new ApiError(429, 'otp_attempts', 'Too many incorrect attempts. Request a new OTP.')
    }

    let approved = false
    if (challenge.provider === 'twilio') {
      try {
        approved = await checkTwilioOtp(phone, code)
      } catch {
        approved = false
      }
    } else {
      approved = otpMatches(challenge.id, code, challenge.codeHash)
    }

    if (!approved) {
      challenge.attempts += 1
      await store.save()
      const remaining = Math.max(0, OTP_MAX_ATTEMPTS - challenge.attempts)
      throw new ApiError(401, 'invalid_otp', `That OTP is not correct. ${remaining} attempts left.`, {
        remaining,
      })
    }

    challenge.consumed = true
    store.deleteChallenge(challenge.id)

    let user = store.userByPhone(phone)
    let isNew = false
    if (!user) {
      user = defaultUser(phone, body.language)
      store.createUser(user)
      isNew = true
    }

    const token = newSessionToken()
    const tokenHash = hashSessionToken(token)
    store.createSession(tokenHash, {
      userId: user.id,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
    })
    await store.save()

    sendJson(
      res,
      200,
      { ok: true, isNew, user: publicUser(user) },
      { 'Set-Cookie': sessionCookie(token) },
    )
  }

  async function handleProfileUpdate(req, res, body) {
    const { user } = requireUser(req)
    const validation = validateProfile(body)

    let photoUrl = user.photoUrl
    let oldPhoto = ''
    if (body.removePhoto === true) {
      oldPhoto = photoUrl
      photoUrl = ''
    } else if (body.photoDataUrl) {
      try {
        const nextPhoto = saveProfilePhoto(body.photoDataUrl, user.id)
        oldPhoto = photoUrl
        photoUrl = nextPhoto
      } catch (error) {
        if (error instanceof ApiError) throw error
        throw new ApiError(400, 'invalid_photo', 'Could not save the profile photo.')
      }
    }

    if (Object.keys(validation.errors).length > 0) {
      if (photoUrl !== user.photoUrl) removeUpload(photoUrl)
      throw new ApiError(422, 'validation_failed', 'Please check the profile fields.', {
        fields: validation.errors,
      })
    }

    Object.assign(user, validation.value, {
      photoUrl,
      profileComplete: true,
      updatedAt: new Date().toISOString(),
    })
    await store.save()
    if (oldPhoto && oldPhoto !== photoUrl) removeUpload(oldPhoto)

    sendJson(res, 200, { ok: true, user: publicUser(user) })
  }

  async function handlePhotoAnalysis(req, res, body) {
    const { user } = requireUser(req)
    const limit = rateLimit(`photo:${user.id}`, 20, 15 * 60 * 1000)
    if (!limit.allowed) {
      throw new ApiError(429, 'rate_limited', 'Too many photo analyses. Please try again later.', {
        retryAfter: limit.retryAfter,
      })
    }

    const image = decodeImageDataUrl(body.imageDataUrl, MAX_CROP_IMAGE_BYTES)
    const description = sanitizeText(body.description, 800)
    const context = sanitizeContext(body.context)
    const language = body.language === 'hi' ? 'hi' : 'en'

    if (!groqConfigured()) {
      sendJson(res, 200, {
        ok: true,
        ...localPhotoFallback({ imageDataUrl: image.dataUrl, description, context, language }),
      })
      return
    }

    try {
      const result = await analyzePhotoWithGroq({
        imageDataUrl: image.dataUrl,
        description,
        context,
        language,
      })
      sendJson(res, 200, {
        ok: true,
        mode: 'groq',
        visionAnalyzed: true,
        ...result,
        notice:
          language === 'hi'
            ? 'यह फोटो-आधारित संभावना सूची है, पुष्टि किया गया निदान नहीं।'
            : 'This is a photo-based possibility list, not a confirmed diagnosis.',
        disclaimer:
          language === 'hi'
            ? 'कोई भी उपचार करने से पहले KVK या योग्य कृषि विशेषज्ञ से सलाह लें।'
            : 'Confirm with a KVK or qualified agricultural expert before treating the crop.',
      })
    } catch {
      sendJson(res, 200, {
        ok: true,
        ...localPhotoFallbackAfterError(
          { imageDataUrl: image.dataUrl, description, context, language },
          'vision-provider-unavailable',
        ),
      })
    }
  }

  async function handleChat(req, res, body) {
    const { user } = requireUser(req)
    const limit = rateLimit(`chat:${user.id}`, 30, 15 * 60 * 1000)
    if (!limit.allowed) {
      throw new ApiError(429, 'rate_limited', 'Too many AI questions. Please try again later.')
    }
    if (!groqConfigured()) {
      throw new ApiError(503, 'remote_unconfigured', 'The server AI is not configured.')
    }
    const question = sanitizeText(body.question, 2000)
    if (question.length < 2) {
      throw new ApiError(422, 'empty_question', 'Please type a question.')
    }
    try {
      const answer = await askGroq(question, {
        language: body.language === 'hi' ? 'hi' : 'en',
        profile: sanitizeProfileContext(body.profile),
        conversation: sanitizeConversation(body.conversation),
      })
      sendJson(res, 200, { ok: true, answer, origin: 'remote' })
    } catch {
      throw new ApiError(502, 'remote_failed', 'The server AI is unavailable. Use the local answer.')
    }
  }

  async function handleUpload(req, res, filename) {
    if (!/^[a-z0-9_-]+\.(jpg|png|webp)$/i.test(filename)) {
      throw new ApiError(404, 'not_found', 'Image not found.')
    }
    const path = join(uploadsDir, filename)
    if (!existsSync(path)) {
      throw new ApiError(404, 'not_found', 'Image not found.')
    }
    const ext = filename.split('.').pop().toLowerCase()
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
    const file = readFileSync(path)
    res.statusCode = 200
    res.setHeader('Content-Type', mime)
    res.setHeader('Cache-Control', 'private, max-age=86400')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.end(file)
  }

  async function route(req, res, url) {
    const path = url.pathname
    const method = req.method || 'GET'

    if (method === 'GET' && path === '/api/health') {
      sendJson(res, 200, {
        ok: true,
        service: 'kisansathi',
        otpMode: otpMode(),
        groqConfigured: groqConfigured(),
      })
      return
    }

    if (method === 'GET' && path === '/api/ai/status') {
      sendJson(res, 200, {
        ok: true,
        provider: 'groq',
        chatConfigured: groqConfigured(),
        visionConfigured: groqConfigured(),
        localFallback: true,
        chatModel: groqChatModel(),
        visionModel: groqVisionModel(),
      })
      return
    }

    if (method === 'POST' && path === '/api/auth/request-otp') {
      await handleRequestOtp(req, res, await readJson(req))
      return
    }

    if (method === 'POST' && path === '/api/auth/verify-otp') {
      await handleVerifyOtp(req, res, await readJson(req))
      return
    }

    if (method === 'POST' && path === '/api/auth/logout') {
      const auth = authenticate(req)
      if (auth) {
        store.deleteSession(auth.tokenHash)
        await store.save()
      }
      sendJson(res, 200, { ok: true }, { 'Set-Cookie': clearSessionCookie() })
      return
    }

    if (method === 'GET' && path === '/api/auth/me') {
      const auth = authenticate(req)
      if (!auth) throw new ApiError(401, 'unauthorized', 'Not signed in.')
      sendJson(res, 200, { ok: true, user: publicUser(auth.user) })
      return
    }

    if (method === 'PUT' && path === '/api/profile') {
      await handleProfileUpdate(req, res, await readJson(req))
      return
    }

    if (method === 'POST' && path === '/api/ai/analyze-photo') {
      await handlePhotoAnalysis(req, res, await readJson(req))
      return
    }

    if (method === 'POST' && path === '/api/ai/chat') {
      await handleChat(req, res, await readJson(req))
      return
    }

    if (method === 'GET' && path.startsWith('/api/uploads/')) {
      let filename
      try {
        filename = decodeURIComponent(path.slice('/api/uploads/'.length))
      } catch {
        throw new ApiError(400, 'invalid_path', 'Invalid image path.')
      }
      await handleUpload(req, res, filename)
      return
    }

    throw new ApiError(404, 'not_found', 'API route not found.')
  }

  return async function apiHandler(req, res, next) {
    const url = new URL(req.url || '/', 'http://localhost')
    if (!url.pathname.startsWith('/api/')) {
      if (next) return next()
      sendJson(res, 404, { error: 'Not found', code: 'not_found' })
      return
    }

    try {
      await route(req, res, url)
    } catch (error) {
      if (error instanceof ApiError) {
        sendJson(res, error.status, {
          error: error.message,
          code: error.code,
          ...(error.details ?? {}),
        })
        return
      }
      console.error('[kisansathi-api]', error?.message || error)
      sendJson(res, 500, {
        error: 'Something went wrong on the server.',
        code: 'internal_error',
      })
    }
  }
}
