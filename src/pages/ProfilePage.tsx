import { useState } from 'react'
import {
  CheckCircle2,
  LogOut,
  Phone,
  RotateCcw,
  ShieldCheck,
  Sprout,
  UserRound,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/layout/PageHeader'
import { ProfileForm, type ProfileFormValue } from '@/components/profile/ProfileForm'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { useApp } from '@/store/AppContext'
import { useAuth } from '@/store/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { useT, pick } from '@/lib/i18n'
import { CROP_MAP } from '@/data'
import { ApiClientError } from '@/lib/api'
import type { UiLanguage } from '@/store/types'

export function ProfilePage() {
  const { state, dispatch } = useApp()
  const { user, updateProfile, logout } = useAuth()
  const t = useT()
  const toast = useToast()
  const navigate = useNavigate()
  const language = state.language
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [resetOpen, setResetOpen] = useState(false)

  const displayName = state.profile.name || user?.name || 'Kisan'
  const crop = state.profile.preferredCrop ? CROP_MAP[state.profile.preferredCrop] : null
  const roleLabel = state.role === 'farmer' ? t('role.farmer') : t('role.worker')

  const handleSave = async (value: ProfileFormValue) => {
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
        pick(language, 'Profile saved', 'प्रोफ़ाइल सेव हो गई'),
        pick(
          language,
          'Your dashboard and assistant will use the updated details.',
          'डैशबोर्ड और सहायक अब नई जानकारी इस्तेमाल करेंगे।',
        ),
      )
    } catch (error) {
      if (error instanceof ApiClientError) {
        if (error.fields) setErrors(error.fields)
        setFormError(error.message)
      } else {
        setFormError(
          pick(
            language,
            'Could not save your profile. Please try again.',
            'प्रोफ़ाइल सेव नहीं हो सकी। कृपया दोबारा कोशिश करें।',
          ),
        )
      }
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    dispatch({ type: 'RESET_DEMO' })
    setResetOpen(false)
    toast.info(
      pick(language, 'Demo data reset', 'डेमो डेटा रीसेट'),
      pick(
        language,
        'Sample jobs, applications and the crop plan were restored. Your account is unchanged.',
        'नमूना नौकरियाँ, आवेदन और फसल योजना बहाल हो गई। आपका खाता वैसा ही है।',
      ),
    )
  }

  const handleLogout = async () => {
    await logout()
    navigate('/welcome', { replace: true })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('profile.eyebrow')}
        title={t('profile.title')}
        description={pick(
          language,
          'This profile is stored on your signed-in account and powers the dashboard, guidance and job suggestions.',
          'यह प्रोफ़ाइल आपके साइन-इन खाते में सेव है और डैशबोर्ड, सलाह और नौकरी सुझावों में इस्तेमाल होती है।',
        )}
        actions={
          <Button
            variant="secondary"
            onClick={handleLogout}
            leadingIcon={<LogOut className="h-4 w-4" />}
          >
            {pick(language, 'Sign out', 'साइन आउट')}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.25fr)]">
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-4">
              <Avatar
                name={displayName}
                src={state.profile.photoUrl || undefined}
                accent="bg-brand-600"
                size="lg"
                className="h-16 w-16"
              />
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-ink-900">{displayName}</h2>
                <p className="truncate text-sm text-ink-500">
                  {roleLabel}
                  {state.profile.village ? ` \u00b7 ${state.profile.village}` : ''}
                  {state.profile.district ? `, ${state.profile.district}` : ''}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone="brand">
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                      {pick(language, 'Mobile verified', 'मोबाइल सत्यापित')}
                    </span>
                  </Badge>
                  <Badge tone="neutral">{roleLabel}</Badge>
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-ink-100 bg-surface-sunken p-3">
                <p className="text-xs font-medium text-ink-500">{t('profile.landHolding')}</p>
                <p className="mt-1 text-sm font-semibold text-ink-900">
                  {state.profile.landHolding || '-'}
                </p>
              </div>
              <div className="rounded-xl border border-ink-100 bg-surface-sunken p-3">
                <p className="text-xs font-medium text-ink-500">{t('profile.preferredCrop')}</p>
                <p className="mt-1 text-sm font-semibold text-ink-900">
                  {crop
                    ? `${crop.glyph} ${language === 'hi' ? crop.labelHi : crop.label}`
                    : '-'}
                </p>
              </div>
              <div className="rounded-xl border border-ink-100 bg-surface-sunken p-3">
                <p className="text-xs font-medium text-ink-500">{t('profile.languages')}</p>
                <p className="mt-1 text-sm font-semibold text-ink-900">
                  {state.profile.languages.join(', ')}
                </p>
              </div>
              <div className="rounded-xl border border-ink-100 bg-surface-sunken p-3">
                <p className="text-xs font-medium text-ink-500">{t('profile.phone')}</p>
                <p className="mt-1 text-sm font-semibold text-ink-900">
                  {state.profile.phone || '-'}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title={pick(language, 'Account security', 'खाता सुरक्षा')}
              subtitle={pick(
                language,
                'How this prototype keeps the session',
                'यह प्रोटोटाइप सेशन कैसे रखता है',
              )}
            />
            <ul className="mt-4 space-y-3 text-sm text-ink-600">
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                <span className="leading-relaxed">
                  {pick(
                    language,
                    'The session lives in an HttpOnly cookie with SameSite protection, not in browser storage.',
                    'सेशन HttpOnly कुकी और SameSite सुरक्षा में रहता है, ब्राउज़र स्टोरेज में नहीं।',
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                <span className="leading-relaxed">
                  {pick(
                    language,
                    'Your mobile is verified with a one-time code that expires quickly.',
                    'आपका मोबाइल जल्दी समाप्त होने वाले वन-टाइम कोड से सत्यापित होता है।',
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                <span className="leading-relaxed">
                  {pick(
                    language,
                    'To use a different number, sign out and verify it from the login screen.',
                    'दूसरा नंबर इस्तेमाल करने के लिए साइन आउट करें और लॉगिन स्क्रीन से उसे सत्यापित करें।',
                  )}
                </span>
              </li>
            </ul>
            {user ? (
              <p className="mt-4 rounded-lg bg-surface-sunken px-3 py-2 text-xs text-ink-500">
                {pick(language, 'Account created', 'खाता बना')}{' '}
                {new Date(user.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            ) : null}
          </Card>

          <Card>
            <CardHeader
              title={pick(language, 'Demo data', 'डेमो डेटा')}
              subtitle={pick(
                language,
                'Jobs and the crop plan are sample records',
                'नौकरियाँ और फसल योजना नमूना रिकॉर्ड हैं',
              )}
            />
            <p className="mt-3 text-sm leading-relaxed text-ink-500">
              {pick(
                language,
                'Reset sample jobs, applications and the crop plan. Your verified account and farm profile are kept.',
                'नमूना नौकरियाँ, आवेदन और फसल योजना रीसेट करें। आपका सत्यापित खाता और खेत प्रोफ़ाइल बना रहेगा।',
              )}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => setResetOpen(true)}
              leadingIcon={<RotateCcw className="h-4 w-4" />}
            >
              {pick(language, 'Reset sample data', 'नमूना डेटा रीसेट करें')}
            </Button>
          </Card>
        </div>

        <Card>
          <CardHeader
            title={t('profile.editTitle')}
            subtitle={pick(
              language,
              'Changes are saved to your account when you press save.',
              'सेव दबाने पर बदलाव आपके खाते में सुरक्षित होते हैं।',
            )}
            action={
              <span className="hidden items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800 sm:inline-flex">
                <Sprout className="h-3.5 w-3.5" aria-hidden="true" />
                {pick(language, 'Farm profile', 'खेत प्रोफ़ाइल')}
              </span>
            }
          />
          {formError ? (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-danger-100 bg-danger-50 px-3 py-2 text-sm font-medium text-danger-700"
            >
              {formError}
            </p>
          ) : null}
          <div className="mt-5">
            <ProfileForm
              key={`${user?.id ?? 'user'}-${user?.updatedAt ?? ''}`}
              initial={{
                name: state.profile.name || user?.name || '',
                state: state.profile.state || user?.state || '',
                district: state.profile.district || user?.district || '',
                village: state.profile.village || user?.village || '',
                primaryCrop: state.profile.preferredCrop || user?.primaryCrop || '',
                landSize: state.profile.landHolding || user?.landSize || '',
                language: (user?.language ?? language) as UiLanguage,
                photoUrl: state.profile.photoUrl || user?.photoUrl || '',
              }}
              phone={user?.phoneDisplay}
              submitLabel={t('profile.save')}
              saving={saving}
              errors={errors}
              onSubmit={handleSave}
            />
          </div>
        </Card>
      </div>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title={pick(language, 'Reset sample data?', 'नमूना डेटा रीसेट करें?')}
        description={pick(
          language,
          'This only affects the demo jobs, applications and crop plan in this browser. Your account and profile stay intact.',
          'यह केवल इस ब्राउज़र की डेमो नौकरियों, आवेदनों और फसल योजना को बदलता है। आपका खाता और प्रोफ़ाइल सुरक्षित रहते हैं।',
        )}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setResetOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={handleReset} data-testid="reset-demo">
              {pick(language, 'Reset sample data', 'नमूना डेटा रीसेट करें')}
            </Button>
          </>
        }
      >
        <ul className="space-y-1.5 text-sm text-ink-600">
          <li className="flex items-start gap-2">
            <span aria-hidden="true">&bull;</span>
            <span>{pick(language, 'Posted jobs and worker applications', 'पोस्ट की नौकरियाँ और मज़दूर आवेदन')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden="true">&bull;</span>
            <span>{pick(language, 'Your crop plan and custom tasks', 'आपकी फसल योजना और कस्टम काम')}</span>
          </li>
        </ul>
        <p className="mt-3 text-sm text-ink-500">
          {pick(
            language,
            'Your sign-in, phone number and farm profile are kept.',
            'आपका साइन-इन, फोन नंबर और खेत प्रोफ़ाइल बना रहेगा।',
          )}
        </p>
      </Modal>
    </div>
  )
}
