import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Form'
import { LanguageToggle } from '@/components/layout/LanguageToggle'
import { Logo } from '@/components/layout/Logo'
import { ApiClientError, normalizePhoneInput, type OtpRequestResult } from '@/lib/api'
import { pick } from '@/lib/i18n'
import { useApp } from '@/store/AppContext'
import { useAuth } from '@/store/AuthContext'

function formatSeconds(value: number): string {
  const safe = Math.max(0, value)
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`
}

function errorMessage(error: unknown, language: 'en' | 'hi'): string {
  if (!(error instanceof ApiClientError)) {
    return pick(
      language,
      'Something went wrong. Please try again.',
      'कुछ गड़बड़ हुई। कृपया दोबारा कोशिश करें।',
    )
  }
  const messages: Record<string, { en: string; hi: string }> = {
    network_error: {
      en: 'The KisanSathi server is not reachable. Start the app server and try again.',
      hi: 'किसानसाथी सर्वर से संपर्क नहीं हो रहा। ऐप सर्वर शुरू करके दोबारा कोशिश करें।',
    },
    invalid_phone: {
      en: 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9.',
      hi: '6, 7, 8 या 9 से शुरू होने वाला सही 10 अंकों का भारतीय मोबाइल नंबर भरें।',
    },
    invalid_otp: {
      en: error.message,
      hi: 'OTP सही नहीं है। बचे प्रयास देखें और फिर कोशिश करें।',
    },
    otp_expired: {
      en: 'This OTP has expired. Request a new code.',
      hi: 'यह OTP समाप्त हो गया। नया कोड माँगें।',
    },
    otp_attempts: {
      en: 'Too many incorrect attempts. Request a new OTP.',
      hi: 'बहुत बार गलत कोशिश हुई। नया OTP माँगें।',
    },
    cooldown: {
      en: `Please wait ${error.retryAfter ?? 30} seconds before requesting another code.`,
      hi: `नया कोड माँगने से पहले ${error.retryAfter ?? 30} सेकंड रुकें।`,
    },
    rate_limited: {
      en: 'Too many attempts. Please wait a few minutes and try again.',
      hi: 'बहुत प्रयास हो गए। कुछ मिनट रुककर दोबारा कोशिश करें।',
    },
    otp_unconfigured: {
      en: 'OTP delivery is not configured on this server. Ask the operator to set up Twilio Verify.',
      hi: 'इस सर्वर पर OTP भेजने की सेवा कॉन्फ़िगर नहीं है। संचालक से Twilio Verify सेट करने को कहें।',
    },
    otp_delivery_failed: {
      en: 'The SMS could not be sent. Please try again in a moment.',
      hi: 'SMS नहीं भेजा जा सका। थोड़ी देर में दोबारा कोशिश करें।',
    },
  }
  const mapped = messages[error.code]
  return mapped ? mapped[language] : error.message
}

export function LoginPage() {
  const { state } = useApp()
  const { requestCode, verifyCode, initialError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const language = state.language

  const fromPath = useMemo(() => {
    const candidate = (location.state as { from?: unknown } | null)?.from
    return typeof candidate === 'string' && candidate.startsWith('/') ? candidate : '/'
  }, [location.state])

  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [challenge, setChallenge] = useState<OtpRequestResult | null>(null)
  const [sentAt, setSentAt] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const [busy, setBusy] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [codeError, setCodeError] = useState('')

  useEffect(() => {
    if (step !== 'otp') return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [step])

  const phoneValid = /^[6-9]\d{9}$/.test(phone)
  const resendIn = challenge
    ? Math.max(0, Math.ceil((sentAt + challenge.resendAfter * 1000 - now) / 1000))
    : 0
  const expiresIn = challenge
    ? Math.max(0, Math.ceil((sentAt + challenge.expiresIn * 1000 - now) / 1000))
    : 0

  const sendCode = async (event?: FormEvent) => {
    event?.preventDefault()
    setError('')
    setPhoneError('')
    if (!phoneValid) {
      setPhoneError(
        pick(
          language,
          'Enter a valid 10-digit mobile number starting with 6-9.',
          '6-9 से शुरू होने वाला सही 10 अंकों का मोबाइल नंबर भरें।',
        ),
      )
      return
    }
    setBusy(true)
    try {
      const result = await requestCode(phone, language)
      setChallenge(result)
      setSentAt(Date.now())
      setNow(Date.now())
      setCode('')
      setCodeError('')
      setStep('otp')
    } catch (requestError) {
      const message = errorMessage(requestError, language)
      setError(message)
      if (requestError instanceof ApiClientError && requestError.code === 'invalid_phone') {
        setPhoneError(message)
      }
    } finally {
      setBusy(false)
    }
  }

  const resendCode = async () => {
    if (resending || busy || resendIn > 0) return
    setResending(true)
    setError('')
    try {
      const result = await requestCode(phone, language)
      setChallenge(result)
      setSentAt(Date.now())
      setNow(Date.now())
      setCode('')
      setCodeError('')
    } catch (requestError) {
      setError(errorMessage(requestError, language))
    } finally {
      setResending(false)
    }
  }

  const submitCode = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setCodeError('')
    if (!/^\d{6}$/.test(code)) {
      setCodeError(pick(language, 'Enter the 6-digit OTP.', '6 अंकों का OTP भरें।'))
      return
    }
    setBusy(true)
    try {
      const result = await verifyCode(phone, code, language)
      navigate(result.user.profileComplete ? fromPath : '/onboarding', { replace: true })
    } catch (verifyError) {
      const message = errorMessage(verifyError, language)
      setError(message)
      if (verifyError instanceof ApiClientError && verifyError.code === 'invalid_otp') {
        setCodeError(message)
      }
    } finally {
      setBusy(false)
    }
  }

  const changeNumber = () => {
    setStep('phone')
    setChallenge(null)
    setCode('')
    setError('')
    setCodeError('')
    setPhoneError('')
  }

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-5 sm:px-6 lg:px-8">
        <Link to="/welcome" aria-label="KisanSathi welcome">
          <Logo size="lg" />
        </Link>
        <LanguageToggle />
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-12 pt-2 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-12 lg:px-8 lg:pt-8">
        <section className="order-2 lg:order-1">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-brand-100 bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white shadow-pop sm:p-8">
            <div className="field-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />
            <div className="relative z-10">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </span>
              <h1 className="mt-5 text-3xl font-bold tracking-tight">
                {pick(language, 'A private account, kept simple.', 'निजी खाता, आसान तरीके से।')}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-brand-50/90">
                {pick(
                  language,
                  'Your mobile number is verified with an OTP. A new number creates an account automatically after verification, then you choose your farm details.',
                  'आपका मोबाइल नंबर OTP से सत्यापित होता है। नया नंबर सत्यापन के बाद अपने आप खाता बनाता है, फिर आप खेत की जानकारी चुनते हैं।',
                )}
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  pick(language, 'No password to remember or share.', 'कोई पासवर्ड याद रखने या बाँटने की ज़रूरत नहीं।'),
                  pick(language, 'The session is held in an HttpOnly cookie with SameSite protection.', 'सेशन HttpOnly कुकी और SameSite सुरक्षा में रहता है।'),
                  pick(language, 'Your profile is saved on this app server, not in a third-party cloud.', 'आपकी प्रोफ़ाइल इस ऐप सर्वर पर सेव होती है, किसी तीसरे क्लाउड में नहीं।'),
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-200" aria-hidden="true" />
                    <span className="leading-relaxed text-brand-50/90">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl border border-white/15 bg-white/10 p-3 text-xs leading-relaxed text-brand-50/85">
                {pick(
                  language,
                  'This is a prototype. Job listings are sample records. OTP values are never faked: development mode shows the real test code on screen and says so clearly.',
                  'यह एक प्रोटोटाइप है। नौकरियाँ नमूना रिकॉर्ड हैं। OTP कभी नकली नहीं होता: विकास मोड असली टेस्ट कोड स्क्रीन पर दिखाता है और साफ बताता है।',
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="order-1 lg:order-2">
          <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">{pick(language, 'Farmer sign in', 'किसान साइन इन')}</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink-900">
                  {step === 'phone'
                    ? pick(language, 'Enter your mobile', 'अपना मोबाइल भरें')
                    : pick(language, 'Enter the OTP', 'OTP भरें')}
                </h2>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                {step === 'phone' ? (
                  <Smartphone className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <KeyRound className="h-5 w-5" aria-hidden="true" />
                )}
              </span>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              {step === 'phone'
                ? pick(
                    language,
                    'Use the number linked to your farm. We will send a one-time code.',
                    'अपने खेत से जुड़ा नंबर इस्तेमाल करें। हम एक बार इस्तेमाल होने वाला कोड भेजेंगे।',
                  )
                : pick(
                    language,
                    `A 6-digit code was sent to ${challenge?.phone ?? `+91 ${phone}`}. It expires in ${formatSeconds(expiresIn)}.`,
                    `${challenge?.phone ?? `+91 ${phone}`} पर 6 अंकों का कोड भेजा गया। यह ${formatSeconds(expiresIn)} में समाप्त होगा।`,
                  )}
            </p>

            {initialError ? (
              <p className="mt-4 rounded-lg border border-harvest-200 bg-harvest-50 px-3 py-2 text-xs text-harvest-900">
                {initialError}
              </p>
            ) : null}

            {step === 'phone' ? (
              <form onSubmit={sendCode} className="mt-5 space-y-4" noValidate>
                <div className="flex items-stretch overflow-hidden rounded-xl border border-ink-200 bg-white focus-within:border-brand-500">
                  <span className="flex items-center border-r border-ink-200 bg-surface-sunken px-3 text-sm font-semibold text-ink-600">
                    +91
                  </span>
                  <input
                    value={phone}
                    onChange={(event) => {
                      setPhone(normalizePhoneInput(event.target.value).slice(0, 10))
                      setPhoneError('')
                      setError('')
                    }}
                    inputMode="numeric"
                    autoComplete="tel-national"
                    aria-label={pick(language, '10-digit mobile number', '10 अंकों का मोबाइल नंबर')}
                    aria-invalid={phoneError ? true : undefined}
                    placeholder="98765 43210"
                    data-testid="phone-input"
                    className="h-11 w-full bg-transparent px-3 text-sm tracking-wide text-ink-900 outline-none placeholder:text-ink-400"
                  />
                </div>
                {phoneError ? (
                  <p className="text-xs font-medium text-danger-600" role="alert">
                    {phoneError}
                  </p>
                ) : null}
                {error ? (
                  <p className="rounded-lg border border-danger-100 bg-danger-50 px-3 py-2 text-xs font-medium text-danger-700" role="alert">
                    {error}
                  </p>
                ) : null}
                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  disabled={busy}
                  data-testid="send-otp"
                  leadingIcon={
                    busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />
                  }
                >
                  {busy
                    ? pick(language, 'Sending OTP...', 'OTP भेजा जा रहा है...')
                    : pick(language, 'Send OTP', 'OTP भेजें')}
                </Button>
                <p className="text-center text-xs leading-relaxed text-ink-500">
                  {pick(
                    language,
                    'By continuing you agree that this prototype may store your profile on its local app server.',
                    'आगे बढ़ने पर आप मानते हैं कि यह प्रोटोटाइप आपकी प्रोफ़ाइल अपने स्थानीय ऐप सर्वर पर सेव कर सकता है।',
                  )}
                </p>
              </form>
            ) : (
              <form onSubmit={submitCode} className="mt-5 space-y-4" noValidate>
                <Input
                  label={pick(language, '6-digit OTP', '6 अंकों का OTP')}
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                    setCodeError('')
                    setError('')
                  }}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  error={codeError}
                  leadingIcon={<KeyRound className="h-4 w-4" />}
                  data-testid="otp-input"
                  placeholder="••••••"
                  className="tracking-[0.35em]"
                />

                {challenge?.mode === 'development' && challenge.devCode ? (
                  <div
                    data-testid="dev-otp"
                    data-code={challenge.devCode}
                    className="rounded-xl border border-harvest-200 bg-harvest-50 p-3"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-harvest-800">
                      {pick(language, 'Development OTP - not an SMS', 'विकास OTP - SMS नहीं')}
                    </p>
                    <p className="mt-1 font-mono text-xl font-bold tracking-[0.25em] text-harvest-900">
                      {challenge.devCode}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-harvest-800">
                      {pick(
                        language,
                        'SMS is not configured on this server, so the real test code is shown here. Configure Twilio Verify to send a normal SMS.',
                        'इस सर्वर पर SMS कॉन्फ़िगर नहीं है, इसलिए असली टेस्ट कोड यहाँ दिख रहा है। सामान्य SMS के लिए Twilio Verify कॉन्फ़िगर करें।',
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="rounded-xl border border-brand-100 bg-brand-50 p-3 text-xs leading-relaxed text-brand-800">
                    {pick(
                      language,
                      'The SMS was requested from the configured provider. If it does not arrive, wait for the resend timer.',
                      'कॉन्फ़िगर किए गए प्रदाता से SMS माँगा गया है। न मिलने पर दोबारा भेजने का समय आने तक रुकें।',
                    )}
                  </p>
                )}

                {error ? (
                  <p className="rounded-lg border border-danger-100 bg-danger-50 px-3 py-2 text-xs font-medium text-danger-700" role="alert">
                    {error}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  disabled={busy || expiresIn <= 0}
                  data-testid="verify-otp"
                  leadingIcon={
                    busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />
                  }
                >
                  {busy
                    ? pick(language, 'Verifying...', 'सत्यापित हो रहा है...')
                    : pick(language, 'Verify and continue', 'सत्यापित करें और आगे बढ़ें')}
                </Button>

                <div className="flex items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={changeNumber}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-ink-600 hover:bg-ink-100"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    {pick(language, 'Change number', 'नंबर बदलें')}
                  </button>
                  <button
                    type="button"
                    onClick={resendCode}
                    disabled={resendIn > 0 || resending}
                    data-testid="resend-otp"
                    className="rounded-lg px-2 py-1 font-semibold text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:text-ink-400"
                  >
                    {resending
                      ? pick(language, 'Sending...', 'भेज रहे हैं...')
                      : resendIn > 0
                        ? pick(language, `Resend in ${resendIn}s`, `${resendIn} सेकंड में दोबारा`)
                        : pick(language, 'Resend OTP', 'OTP दोबारा भेजें')}
                  </button>
                </div>
              </form>
            )}

            <p className="mt-5 border-t border-ink-100 pt-4 text-center text-xs text-ink-500">
              <Link to="/welcome" className="font-semibold text-brand-700 hover:text-brand-800">
                {pick(language, 'Back to welcome', 'स्वागत स्क्रीन पर लौटें')}
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
