import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ListChecks,
  ShieldCheck,
  Sparkles,
  Sprout,
  Users,
  WifiOff,
} from 'lucide-react'

import { LanguageToggle } from '@/components/layout/LanguageToggle'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/Button'
import { pick } from '@/lib/i18n'
import { useApp } from '@/store/AppContext'
import { useAuth } from '@/store/AuthContext'

export function WelcomePage() {
  const { state } = useApp()
  const { initialError } = useAuth()
  const language = state.language

  const features = [
    {
      icon: Sparkles,
      title: pick(language, 'Ask Kisan AI', 'किसान AI से पूछें'),
      body: pick(
        language,
        'A guided crop check, clear next steps and a local knowledge base that keeps working offline.',
        'फसल की चरण-दर-चरण जाँच, साफ अगले कदम और ऑफ़लाइन काम करने वाला स्थानीय ज्ञान भंडार।',
      ),
    },
    {
      icon: Camera,
      title: pick(language, 'Check a crop photo', 'फसल की फोटो जाँचें'),
      body: pick(
        language,
        'Upload a photo when a remote vision model is configured on the server; otherwise you get an honest, labeled local check.',
        'सर्वर पर रिमोट vision मॉडल होने पर फोटो जाँचें; वरना साफ लेबल वाली ईमानदार स्थानीय जाँच मिलेगी।',
      ),
    },
    {
      icon: Users,
      title: pick(language, 'Hire farm workers', 'खेती के मज़दूर खोजें'),
      body: pick(
        language,
        'Post work, track vacancies and find nearby opportunities using sample marketplace data.',
        'नमूना मार्केटप्लेस डेटा से काम पोस्ट करें, रिक्त पद देखें और आस-पास के अवसर खोजें।',
      ),
    },
    {
      icon: ListChecks,
      title: pick(language, 'Plan crop work', 'फसल का काम योजना बनाएं'),
      body: pick(
        language,
        'Turn crop stages into a practical work timeline and convert labour-heavy steps into job posts.',
        'फसल के चरणों को काम की समय-सारिणी में बदलें और ज़्यादा मज़दूर वाले कामों को नौकरी में बदलें।',
      ),
    },
  ]

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-5 sm:px-6 lg:px-8">
        <Logo size="lg" />
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Button to="/login" size="sm" className="hidden sm:inline-flex">
            {pick(language, 'Sign in', 'साइन इन')}
          </Button>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-8 px-4 pb-14 pt-2 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-12 lg:px-8 lg:pb-20 lg:pt-10">
        <section>
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
            <Sprout className="h-3.5 w-3.5" aria-hidden="true" />
            {pick(language, 'Built for Indian farmers', 'भारतीय किसानों के लिए बना')}
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
            {pick(
              language,
              'Your farm, one clear next step.',
              'आपका खेत, एक साफ अगला कदम।',
            )}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-600 sm:text-lg">
            {pick(
              language,
              'Sign in with your mobile number to get a personal dashboard, crop guidance in Hindi or English, photo-based triage and a simple way to organize farm work.',
              'अपने मोबाइल नंबर से साइन इन करें और पाएं निजी डैशबोर्ड, हिंदी या अंग्रेज़ी में फसल सलाह, फोटो से शुरुआती जाँच और खेती के काम को व्यवस्थित करने का आसान तरीका।',
            )}
          </p>

          <div className="mt-7 flex flex-col gap-2 sm:flex-row">
            <Button
              to="/login"
              size="lg"
              leadingIcon={<ArrowRight className="h-5 w-5" />}
              data-testid="welcome-cta"
            >
              {pick(language, 'Continue with mobile', 'मोबाइल से आगे बढ़ें')}
            </Button>
            <Button
              to="/login"
              variant="secondary"
              size="lg"
              leadingIcon={<ShieldCheck className="h-5 w-5" />}
            >
              {pick(language, 'Secure OTP sign in', 'सुरक्षित OTP साइन इन')}
            </Button>
          </div>

          <dl className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                label: pick(language, 'Private account', 'निजी खाता'),
                value: pick(language, 'Mobile OTP + secure cookie', 'मोबाइल OTP + सुरक्षित कुकी'),
              },
              {
                icon: WifiOff,
                label: pick(language, 'Local first', 'स्थानीय पहले'),
                value: pick(language, 'Core guidance works offline', 'मुख्य सलाह ऑफ़लाइन चलती है'),
              },
              {
                icon: CheckCircle2,
                label: pick(language, 'No fake claims', 'कोई झूठा दावा नहीं'),
                value: pick(language, 'Photo and AI limits are labeled', 'फोटो और AI की सीमाएं साफ'),
              },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-ink-200 bg-white p-3">
                <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                  <item.icon className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                  {item.label}
                </dt>
                <dd className="mt-1 text-xs font-medium leading-relaxed text-ink-800">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="relative overflow-hidden rounded-[1.5rem] border border-brand-100 bg-gradient-to-br from-brand-700 via-brand-700 to-brand-800 p-5 text-white shadow-pop sm:p-7">
          <div className="field-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-100">
              {pick(language, 'What you can do', 'आप क्या कर सकते हैं')}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              {pick(language, 'Start with one real problem.', 'एक असली समस्या से शुरू करें।')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-50/90">
              {pick(
                language,
                'No jargon, no invented prices, no pretend diagnosis. Just useful next steps you can check locally.',
                'कोई कठिन शब्द नहीं, कोई बनावटी भाव नहीं, कोई नकली निदान नहीं। सिर्फ़ उपयोगी अगले कदम जिन्हें आप स्थानीय रूप से जाँच सकें।',
              )}
            </p>
            <div className="mt-5 space-y-2.5">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex gap-3 rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <feature.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{feature.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-brand-50/85">{feature.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              to="/login"
              size="lg"
              fullWidth
              className="mt-5 bg-white text-brand-800 hover:bg-brand-50 active:bg-brand-100"
              trailingIcon={<ArrowRight className="h-4 w-4" />}
            >
              {pick(language, 'Create or open my account', 'मेरा खाता बनाएं या खोलें')}
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink-200/80 bg-white/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-xs leading-relaxed text-ink-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            {pick(
              language,
              'Prototype: job listings and activities are sample data. Guidance is not a confirmed diagnosis.',
              'प्रोटोटाइप: नौकरियाँ और गतिविधियाँ नमूना डेटा हैं। सलाह पुष्टि किया गया निदान नहीं है।',
            )}
          </p>
          <p>
            {pick(
              language,
              'Development OTP is shown on screen only when SMS is not configured.',
              'SMS कॉन्फ़िगर न होने पर विकास OTP स्क्रीन पर दिखता है।',
            )}
          </p>
        </div>
      </footer>

      {initialError ? (
        <div
          role="status"
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg rounded-xl border border-harvest-200 bg-harvest-50 px-4 py-3 text-sm text-harvest-900 shadow-pop"
        >
          {initialError}
        </div>
      ) : null}
    </div>
  )
}
