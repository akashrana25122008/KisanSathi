import { useState } from 'react'
import { ArrowRight, LoaderCircle, LogOut, Sprout } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'

import { LanguageToggle } from '@/components/layout/LanguageToggle'
import { Logo } from '@/components/layout/Logo'
import { ProfileForm, type ProfileFormValue } from '@/components/profile/ProfileForm'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { ApiClientError } from '@/lib/api'
import { pick } from '@/lib/i18n'
import { useApp } from '@/store/AppContext'
import { useAuth } from '@/store/AuthContext'

export function OnboardingPage() {
  const { state } = useApp()
  const { user, updateProfile, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const language = state.language
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')

  if (!user) return null
  if (user.profileComplete) return <Navigate to="/" replace />

  const handleSubmit = async (value: ProfileFormValue) => {
    setSaving(true)
    setErrors({})
    setFormError('')
    try {
      await updateProfile({
        name: value.name,
        state: value.state,
        district: value.district,
        village: value.village,
        primaryCrop: value.primaryCrop,
        landSize: value.landSize,
        language: value.language,
        photoDataUrl: value.photoDataUrl,
        removePhoto: value.removePhoto,
      })
      toast.success(
        pick(language, 'Your farm profile is ready', 'आपकी खेत प्रोफ़ाइल तैयार है'),
        pick(
          language,
          'The dashboard and assistant will now use these details.',
          'डैशबोर्ड और सहायक अब इन जानकारियों का इस्तेमाल करेंगे।',
        ),
      )
      navigate('/', { replace: true })
    } catch (error) {
      if (error instanceof ApiClientError) {
        if (error.fields) setErrors(error.fields)
        setFormError(error.message)
      } else {
        setFormError(
          pick(
            language,
            'Could not save your profile. Please try again.',
            'आपकी प्रोफ़ाइल सेव नहीं हो सकी। कृपया दोबारा कोशिश करें।',
          ),
        )
      }
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/welcome', { replace: true })
  }

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-5 sm:px-6 lg:px-8">
        <Logo size="lg" />
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            leadingIcon={<LogOut className="h-4 w-4" />}
          >
            {pick(language, 'Sign out', 'साइन आउट')}
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pb-12 pt-1 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center gap-2 text-xs font-medium text-ink-500">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1 text-white">
            <Sprout className="h-3.5 w-3.5" aria-hidden="true" />
            {pick(language, 'Step 2 of 2', 'चरण 2 / 2')}
          </span>
          <span className="h-px flex-1 bg-ink-200" />
          <span>{pick(language, 'Farm profile', 'खेत प्रोफ़ाइल')}</span>
        </div>

        <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card sm:p-7">
          <p className="eyebrow">{pick(language, 'Welcome to KisanSathi', 'किसानसाथी में स्वागत')}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            {pick(language, 'Tell us about your farm', 'अपने खेत के बारे में बताएं')}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
            {pick(
              language,
              'These details personalize your dashboard, crop tips and job suggestions. You can change or remove them later from your profile.',
              'ये जानकारियाँ आपका डैशबोर्ड, फसल सलाह और नौकरी सुझाव निजी बनाती हैं। आप इन्हें बाद में प्रोफ़ाइल से बदल या हटा सकते हैं।',
            )}
          </p>

          <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-xs leading-relaxed text-brand-800">
            {pick(
              language,
              `${user.phoneDisplay} is verified. Only someone with access to this phone can open this account again.`,
              `${user.phoneDisplay} सत्यापित है। इस फोन तक पहुँच रखने वाला व्यक्ति ही यह खाता दोबारा खोल सकता है।`,
            )}
          </div>

          {formError ? (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-danger-100 bg-danger-50 px-3 py-2 text-sm font-medium text-danger-700"
            >
              {formError}
            </p>
          ) : null}

          <div className="mt-6">
            <ProfileForm
              initial={{
                name: user.name,
                state: user.state,
                district: user.district,
                village: user.village,
                primaryCrop: user.primaryCrop,
                landSize: user.landSize,
                language: user.language ?? language,
                photoUrl: user.photoUrl,
              }}
              phone={user.phoneDisplay}
              submitLabel={pick(language, 'Finish setup', 'सेटअप पूरा करें')}
              saving={saving}
              errors={errors}
              onSubmit={handleSubmit}
              secondaryAction={{
                label: pick(language, 'Sign out instead', 'इसके बजाय साइन आउट'),
                onClick: handleLogout,
              }}
            />
          </div>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-500">
          {saving ? (
            <>
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              {pick(language, 'Saving to your account...', 'आपके खाते में सेव हो रहा है...')}
            </>
          ) : (
            <>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              {pick(
                language,
                'Your profile is stored on this app server. Photos are optional.',
                'आपकी प्रोफ़ाइल इस ऐप सर्वर पर सेव होती है। फोटो वैकल्पिक है।',
              )}
            </>
          )}
        </p>
      </main>
    </div>
  )
}
