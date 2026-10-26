export interface AuthUser {
  id: string
  phone: string
  phoneDisplay: string
  name: string
  state: string
  district: string
  village: string
  primaryCrop: string
  landSize: string
  language: 'en' | 'hi'
  photoUrl: string
  profileComplete: boolean
  createdAt: string
  updatedAt: string
}

export interface OtpRequestResult {
  ok: true
  mode: 'development' | 'twilio'
  phone: string
  expiresIn: number
  resendAfter: number
  devCode?: string
}

export interface VerifyOtpResult {
  ok: true
  isNew: boolean
  user: AuthUser
}

export interface ProfileInput {
  name: string
  state: string
  district: string
  village: string
  primaryCrop: string
  landSize: string
  language: 'en' | 'hi'
  photoDataUrl?: string
  removePhoto?: boolean
}

export interface AiStatusResult {
  ok: true
  provider: 'groq'
  chatConfigured: boolean
  visionConfigured: boolean
  localFallback: boolean
  chatModel: string
  visionModel: string
}

export interface PhotoAnalysis {
  mode: 'local' | 'groq'
  visionAnalyzed: boolean
  possibleIssue: string
  whyItMayFit: string
  whatToInspect: string[]
  safeNextSteps: string[]
  whenToContactKvk: string
  confidence: 'low' | 'medium' | 'high'
  notice: string
  disclaimer: string
  fallbackReason?: string
}

export interface ChatContextMessage {
  role: 'user' | 'assistant'
  text: string
}

export interface FarmerContext {
  village?: string
  district?: string
  primaryCrop?: string
  landSize?: string
  language?: 'en' | 'hi'
}

export class ApiClientError extends Error {
  status: number
  code: string
  fields?: Record<string, string>
  retryAfter?: number
  remaining?: number

  constructor(
    message: string,
    options: {
      status: number
      code: string
      fields?: Record<string, string>
      retryAfter?: number
      remaining?: number
    },
  ) {
    super(message)
    this.name = 'ApiClientError'
    this.status = options.status
    this.code = options.code
    this.fields = options.fields
    this.retryAfter = options.retryAfter
    this.remaining = options.remaining
  }
}

interface ErrorPayload {
  error?: string
  code?: string
  fields?: Record<string, string>
  retryAfter?: number
  remaining?: number
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  timeoutMs = 20000,
): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, {
      ...init,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init.headers ?? {}),
      },
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch {
    throw new ApiClientError(
      'The KisanSathi server could not be reached. Check that it is running.',
      { status: 0, code: 'network_error' },
    )
  }

  const contentType = response.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json')
    ? ((await response.json().catch(() => null)) as ErrorPayload | null)
    : null

  if (!response.ok) {
    throw new ApiClientError(
      payload?.error || `Request failed (${response.status}).`,
      {
        status: response.status,
        code: payload?.code || 'request_failed',
        fields: payload?.fields,
        retryAfter: payload?.retryAfter,
        remaining: payload?.remaining,
      },
    )
  }

  return payload as T
}

export function normalizePhoneInput(value: string): string {
  return value.replace(/[^\d]/g, '').replace(/^91(?=\d{10}$)/, '').replace(/^0/, '')
}

export function requestOtp(phone: string, language: 'en' | 'hi') {
  return request<OtpRequestResult>('/api/auth/request-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, language }),
  })
}

export function verifyOtp(phone: string, code: string, language: 'en' | 'hi') {
  return request<VerifyOtpResult>('/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, code, language }),
  })
}

export function fetchSession() {
  return request<{ ok: true; user: AuthUser }>('/api/auth/me')
}

export function logoutSession() {
  return request<{ ok: true }>('/api/auth/logout', { method: 'POST' })
}

export function saveProfile(input: ProfileInput) {
  return request<{ ok: true; user: AuthUser }>('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function fetchAiStatus() {
  return request<AiStatusResult>('/api/ai/status')
}

export function askRemoteAi(
  question: string,
  context: {
    language: 'en' | 'hi'
    profile: FarmerContext
    conversation: ChatContextMessage[]
  },
) {
  return request<{ ok: true; answer: string; origin: 'remote' }>(
    '/api/ai/chat',
    {
      method: 'POST',
      body: JSON.stringify({ question, ...context }),
    },
    40000,
  )
}

export function analyzeCropPhoto(input: {
  imageDataUrl: string
  description: string
  context: {
    crop?: string
    symptom?: string
    water?: string
    age?: string
  }
  language: 'en' | 'hi'
}) {
  return request<{ ok: true } & PhotoAnalysis>(
    '/api/ai/analyze-photo',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    50000,
  )
}
