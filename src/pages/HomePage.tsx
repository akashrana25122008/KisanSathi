import { useMemo, useState } from 'react'
import {
  Briefcase,
  CalendarDays,
  Camera,
  ClipboardList,
  MapPin,
  Plus,
  ShieldCheck,
  Sparkles,
  Sprout,
  Users,
  Wallet,
} from 'lucide-react'

import { CROP_MAP } from '@/data'
import { useT, pick } from '@/lib/i18n'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { StatCard } from '@/components/dashboard/StatCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { JobCard } from '@/components/jobs/JobCard'
import { JobPostModal } from '@/components/jobs/JobPostModal'
import { UpcomingActivities } from '@/components/dashboard/UpcomingActivities'
import { useApp } from '@/store/AppContext'
import { useAuth } from '@/store/AuthContext'
import { vacanciesOf } from '@/store/appReducer'
import { useJobActions } from '@/hooks/useJobActions'
import { useToast } from '@/components/ui/Toast'
import type { CropKey } from '@/store/types'

const CROP_NOTES: Record<CropKey, { en: string; hi: string }> = {
  wheat: {
    en: 'Check lower leaves and soil moisture before the next irrigation. Avoid a late, heavy watering near maturity.',
    hi: 'अगली सिंचाई से पहले निचली पत्तियाँ और मिट्टी की नमी देखें। पकने के समय देर से भारी सिंचाई से बचें।',
  },
  paddy: {
    en: 'Keep standing water shallow and watch the field edges for pest damage. Drain before any planned spray.',
    hi: 'खेत में पानी उथला रखें और किनारों पर कीट नुकसान देखें। छिड़काव से पहले पानी निकालें।',
  },
  cotton: {
    en: 'Inspect the underside of leaves for sucking pests. Avoid spraying during peak flowering without local advice.',
    hi: 'पत्तियों की निचली सतह पर रस चूसने वाले कीट देखें। फूल के समय स्थानीय सलाह के बिना छिड़काव न करें।',
  },
  sugarcane: {
    en: 'Check for gaps after germination and keep trash mulching away from the base during humid spells.',
    hi: 'अंकुरण के बाद खाली जगह देखें और नमी के दिनों में गन्ने के आधार से कचरा-मल्च हटाएँ।',
  },
  maize: {
    en: 'Look for whorl damage and yellowing between veins. Record the stage before choosing any treatment.',
    hi: 'पत्ती के भीतर नुकसान और नसों के बीच पीलापन देखें। कोई उपचार चुनने से पहले अवस्था लिखें।',
  },
  soybean: {
    en: 'Check nodules and lower-leaf yellowing. Avoid waterlogging because it can quickly damage the roots.',
    hi: 'जड़ों की गाँठें और निचली पत्तियों का पीलापन देखें। जलभराव से बचें, इससे जड़ें जल्दी खराब होती हैं।',
  },
  mustard: {
    en: 'Watch for aphids on tender shoots and keep a gap from flowering when planning any spray.',
    hi: 'कोमल टहनियों पर माहू देखें और छिड़काव की योजना में फूल आने का समय ध्यान रखें।',
  },
  tomato: {
    en: 'Inspect the underside of leaves and remove badly affected plants. Keep foliage dry where possible.',
    hi: 'पत्तियों की निचली सतह देखें और बहुत प्रभावित पौधे हटाएँ। जहाँ संभव हो पत्तियाँ सूखी रखें।',
  },
  onion: {
    en: 'Check for leaf-tip drying and purple blotches. Stop excess nitrogen before bulb maturity.',
    hi: 'पत्तियों की नोक सूखना और बैंगनी धब्बे देखें। कंद पकने से पहले अधिक नाइट्रोजन रोकें।',
  },
  chilli: {
    en: 'Look under leaves for thrips and mites. Do not mix sprays without checking local label advice.',
    hi: 'पत्तियों के नीचे थ्रिप्स और मकड़ी देखें। स्थानीय लेबल सलाह के बिना छिड़काव न मिलाएँ।',
  },
  potato: {
    en: 'Check for dark leaf spots and waterlogging. Earth up rows and keep seed tubers dry between irrigations.',
    hi: 'पत्तियों पर गहरे धब्बे और जलभराव देखें। मेड़ बनाएँ और सिंचाई के बीच बीज कंद सूखे रखें।',
  },
  groundnut: {
    en: 'Check pegging-zone moisture and leaf yellowing. Avoid disturbing the soil around developing pods.',
    hi: 'फली बनने वाली ज़मीन की नमी और पत्तियों का पीलापन देखें। बनती फलियों के आसपास मिट्टी न खोदें।',
  },
}

function greetingFor(language: 'en' | 'hi', hour: number): string {
  if (language === 'hi') {
    if (hour < 12) return 'सुप्रभात'
    if (hour < 17) return 'नमस्कार'
    return 'शुभ संध्या'
  }
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function HomePage() {
  const { state } = useApp()
  const { user } = useAuth()
  const t = useT()
  const toast = useToast()
  const { enroll, withdraw } = useJobActions()
  const [postOpen, setPostOpen] = useState(false)
  const [hour] = useState(() => new Date().getHours())

  const isFarmer = state.role === 'farmer'
  const language = state.language
  const profileName = state.profile.name || user?.name || ''
  const firstName = profileName.trim().split(/\s+/)[0] || profileName
  const crop = state.profile.preferredCrop ? CROP_MAP[state.profile.preferredCrop] : null
  const cropNote = state.profile.preferredCrop ? CROP_NOTES[state.profile.preferredCrop] : null
  const greeting = greetingFor(language, hour)

  const myJobs = useMemo(
    () => state.jobs.filter((job) => job.postedBy === profileName),
    [state.jobs, profileName],
  )

  const stats = useMemo(() => {
    if (isFarmer) {
      const openJobs = myJobs.filter((job) => vacanciesOf(job) > 0).length
      const totalVacancies = myJobs.reduce((sum, job) => sum + vacanciesOf(job), 0)
      const enrolled = myJobs.reduce((sum, job) => sum + job.enrolledWorkerIds.length, 0)

      return [
        {
          key: 'open',
          label: t('home.statOpenJobs'),
          value: String(openJobs),
          hint: pick(
            language,
            `${totalVacancies} open positions across your posts`,
            `आपकी नौकरियों में ${totalVacancies} खाली पद`,
          ),
          icon: <ClipboardList className="h-5 w-5" />,
          tone: 'brand' as const,
        },
        {
          key: 'workers',
          label: t('home.statWorkersHired'),
          value: String(enrolled),
          hint: pick(
            language,
            'Workers enrolled on your jobs',
            'आपकी नौकरियों से जुड़े मज़दूर',
          ),
          icon: <Users className="h-5 w-5" />,
          tone: 'harvest' as const,
        },
        {
          key: 'activities',
          label: t('home.statActivities'),
          value: String(state.activities.length),
          hint: pick(language, 'Sample activity reminders', 'नमूना काम की यादें'),
          icon: <CalendarDays className="h-5 w-5" />,
          tone: 'info' as const,
        },
      ]
    }

    const openJobs = state.jobs.filter((job) => vacanciesOf(job) > 0).length
    const totalVacancies = state.jobs.reduce((sum, job) => sum + vacanciesOf(job), 0)
    const expected = state.jobs
      .filter((job) => state.myEnrollments.includes(job.id))
      .reduce((sum, job) => sum + job.wagePerDay * job.durationDays, 0)

    return [
      {
        key: 'vacancies',
        label: t('home.statVacancies'),
        value: String(totalVacancies),
        hint: pick(
          language,
          `${openJobs} sample jobs still hiring`,
          `${openJobs} नमूना नौकरियों में भर्ती चल रही है`,
        ),
        icon: <ClipboardList className="h-5 w-5" />,
        tone: 'brand' as const,
      },
      {
        key: 'myjobs',
        label: t('home.statMyJobs'),
        value: String(state.myEnrollments.length),
        hint: pick(language, 'Jobs you joined', 'आपकी जुड़ी नौकरियाँ'),
        icon: <Briefcase className="h-5 w-5" />,
        tone: 'harvest' as const,
      },
      {
        key: 'earnings',
        label: t('home.statEarnings'),
        value: `₹${expected.toLocaleString('en-IN')}`,
        hint: pick(
          language,
          'Wage x days for your joined jobs',
          'जुड़ी नौकरियों का मज़दूरी x दिन',
        ),
        icon: <Wallet className="h-5 w-5" />,
        tone: 'info' as const,
      },
    ]
  }, [isFarmer, language, myJobs, state.activities.length, state.jobs, state.myEnrollments, t])

  const quickActions = useMemo(
    () => [
      {
        key: 'ai',
        label: pick(language, 'Check a crop problem', 'फसल की समस्या जाँचें'),
        description: pick(
          language,
          'Answer a few questions for a guided first check.',
          'कुछ सवालों के जवाब देकर पहली जाँच करें।',
        ),
        icon: Sparkles,
        to: '/ai',
        tone: 'brand' as const,
      },
      {
        key: 'photo',
        label: pick(language, 'Check a crop photo', 'फसल की फोटो जाँचें'),
        description: pick(
          language,
          'Upload a leaf or plant photo with a short note.',
          'पत्ती या पौधे की फोटो और छोटी जानकारी दें।',
        ),
        icon: Camera,
        to: '/ai?mode=photo',
        tone: 'info' as const,
      },
      {
        key: 'find',
        label: t('job.find'),
        description: pick(
          language,
          'Browse sample work near your district.',
          'अपने ज़िले के पास नमूना काम देखें।',
        ),
        icon: ClipboardList,
        to: '/jobs',
        tone: 'harvest' as const,
      },
      {
        key: 'post',
        label: t('job.post'),
        description: isFarmer
          ? pick(language, 'Describe work and the crew you need.', 'काम और ज़रूरी मज़दूर बताएं।')
          : pick(
              language,
              'Switch to Farmer view to post work.',
              'काम पोस्ट करने के लिए किसान व्यू चुनें।',
            ),
        icon: Plus,
        onClick: () => {
          if (isFarmer) setPostOpen(true)
          else
            toast.info(
              pick(language, 'Farmer view is needed', 'किसान व्यू ज़रूरी है'),
              pick(
                language,
                'Use the role switcher at the top to post a job.',
                'नौकरी पोस्ट करने के लिए ऊपर दिए व्यू बदलें।',
              ),
            )
        },
        tone: 'brand' as const,
      },
      {
        key: 'plan',
        label: t('job.createPlan'),
        description: pick(
          language,
          'Map crop stages to dates and workers.',
          'फसल के चरणों को तारीख और मज़दूरों से जोड़ें।',
        ),
        icon: Sprout,
        to: '/planner',
        tone: 'harvest' as const,
      },
    ],
    [isFarmer, language, t, toast],
  )

  const latestJobs = useMemo(() => {
    const source = isFarmer ? myJobs : state.jobs
    return [...source]
      .sort((a, b) => (a.postedAt < b.postedAt ? 1 : -1))
      .slice(0, 3)
  }, [isFarmer, myJobs, state.jobs])

  const nearbyJobs = useMemo(() => {
    if (!isFarmer) return []
    const district = state.profile.district.trim().toLowerCase()
    return [...state.jobs]
      .filter((job) => job.postedBy !== profileName)
      .filter((job) => !district || job.district.toLowerCase() === district)
      .sort((a, b) => (a.postedAt < b.postedAt ? 1 : -1))
      .slice(0, 3)
  }, [isFarmer, profileName, state.jobs, state.profile.district])

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[1.25rem] border border-ink-200 bg-gradient-to-br from-white via-white to-brand-50/70 p-6 shadow-card sm:p-8 lg:p-10">
        <div className="field-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar
              name={profileName || 'Kisan'}
              src={state.profile.photoUrl || undefined}
              size="lg"
              accent="bg-brand-600"
              className="hidden h-16 w-16 sm:inline-flex"
            />
            <div className="min-w-0 max-w-2xl">
              <p className="eyebrow mb-2">
                {isFarmer ? t('role.farmer') : t('role.worker')} &middot;{' '}
                {state.profile.village || user?.village}, {state.profile.district || user?.district}
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
                {greeting}
                {firstName ? `, ${firstName}` : ''}
              </h1>
              <p className="mt-2 text-base leading-relaxed text-ink-600">
                {isFarmer
                  ? pick(
                      language,
                      `Here is a clear view of your farm work${crop ? `, with ${language === 'hi' ? crop.labelHi : crop.label} as your focus crop` : ''}.`,
                      `यहाँ आपके खेत के काम की साफ तस्वीर है${crop ? `, मुख्य फसल ${crop.labelHi}` : ''}।`,
                    )
                  : pick(
                      language,
                      'Here are open sample jobs and the work you have joined.',
                      'यहाँ खुली नमूना नौकरियाँ और आपके जुड़े काम हैं।',
                    )}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink-600 ring-1 ring-ink-200">
                  <MapPin className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                  {state.profile.village || user?.village || pick(language, 'Village not set', 'गाँव सेट नहीं')}
                  {state.profile.district ? `, ${state.profile.district}` : ''}
                </span>
                {crop ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink-600 ring-1 ring-ink-200">
                    <Sprout className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                    {language === 'hi' ? crop.labelHi : crop.label} &middot; {crop.season}
                    {state.profile.landHolding ? ` &middot; ${state.profile.landHolding}` : ''}
                  </span>
                ) : null}
                {user ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-800 ring-1 ring-brand-100">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    {pick(language, 'Mobile verified', 'मोबाइल सत्यापित')}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {isFarmer ? (
              <Button
                onClick={() => setPostOpen(true)}
                size="lg"
                leadingIcon={<Plus className="h-5 w-5" />}
              >
                {t('job.post')}
              </Button>
            ) : (
              <Button to="/jobs" size="lg" leadingIcon={<ClipboardList className="h-5 w-5" />}>
                {t('job.find')}
              </Button>
            )}
            <Button
              to="/ai?mode=photo"
              variant="secondary"
              size="lg"
              leadingIcon={<Camera className="h-5 w-5" />}
            >
              {pick(language, 'Check photo', 'फोटो जाँचें')}
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <StatCard
              key={stat.key}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              hint={stat.hint}
              tone={stat.tone}
            />
          ))}
        </div>
        <div className="surface flex flex-col justify-between gap-3 border-brand-100 bg-brand-50/60 p-4 sm:p-5">
          <div>
            <p className="eyebrow flex items-center gap-1.5">
              <Sprout className="h-3.5 w-3.5" aria-hidden="true" />
              {pick(language, 'General field note', 'आम खेत टिप')}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              {cropNote
                ? language === 'hi'
                  ? cropNote.hi
                  : cropNote.en
                : pick(
                    language,
                    'Add your main crop in the profile to see a crop-specific field note.',
                    'फसल-विशेष टिप देखने के लिए प्रोफ़ाइल में मुख्य फसल जोड़ें।',
                  )}
            </p>
          </div>
          <p className="text-[11px] leading-relaxed text-ink-500">
            {pick(
              language,
              'General guidance only. Confirm locally before spraying or changing irrigation.',
              'सिर्फ़ सामान्य सलाह। छिड़काव या सिंचाई बदलने से पहले स्थानीय पुष्टि करें।',
            )}
          </p>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="eyebrow mb-1">{pick(language, 'Get started', 'शुरू करें')}</p>
          <h2 className="text-xl font-semibold text-ink-900">{t('home.quickActions')}</h2>
        </div>
        <QuickActions actions={quickActions} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="space-y-4">
          <Card>
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  {isFarmer ? t('home.myJobs') : t('home.recentJobs')}
                  <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-600">
                    {latestJobs.length}
                  </span>
                </span>
              }
              subtitle={isFarmer ? t('home.myJobsSub') : t('home.recentJobsSub')}
              action={
                <Button variant="ghost" size="sm" to="/jobs">
                  {t('common.viewAll')}
                </Button>
              }
            />
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {latestJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onEnroll={!isFarmer ? (target) => enroll(target) : undefined}
                  onWithdraw={!isFarmer ? (target) => withdraw(target) : undefined}
                />
              ))}
              {latestJobs.length === 0 ? (
                <div className="col-span-full rounded-xl border border-dashed border-ink-200 bg-surface-sunken px-4 py-8 text-center">
                  <p className="text-sm font-medium text-ink-700">
                    {isFarmer
                      ? pick(
                          language,
                          'You have not posted any jobs yet.',
                          'आपने अभी कोई नौकरी पोस्ट नहीं की है।',
                        )
                      : pick(
                          language,
                          'No jobs match the current sample set.',
                          'मौजूदा नमूना सेट में कोई नौकरी नहीं मिली।',
                        )}
                  </p>
                  {isFarmer ? (
                    <Button
                      className="mt-3"
                      size="sm"
                      onClick={() => setPostOpen(true)}
                      leadingIcon={<Plus className="h-4 w-4" />}
                    >
                      {t('job.post')}
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Card>

          {isFarmer ? (
            <Card>
              <CardHeader
                title={
                  <span className="flex items-center gap-2">
                    {pick(language, 'Jobs around your district', 'आपके ज़िले के आसपास नौकरियाँ')}
                    <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-600">
                      {nearbyJobs.length}
                    </span>
                  </span>
                }
                subtitle={
                  state.profile.district
                    ? pick(
                        language,
                        `Sample posts in ${state.profile.district}.`,
                        `${state.profile.district} की नमूना नौकरियाँ।`,
                      )
                    : t('home.nearbyJobsSub')
                }
                action={
                  <Button variant="ghost" size="sm" to="/jobs">
                    {t('common.viewAll')}
                  </Button>
                }
              />
              {nearbyJobs.length > 0 ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {nearbyJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-ink-200 bg-surface-sunken px-4 py-6 text-center">
                  <p className="text-sm font-medium text-ink-700">
                    {pick(
                      language,
                      'No sample jobs are listed in your district right now.',
                      'अभी आपके ज़िले में कोई नमूना नौकरी सूचीबद्ध नहीं है।',
                    )}
                  </p>
                  <Button variant="ghost" size="sm" to="/jobs" className="mt-2">
                    {pick(language, 'Browse all sample jobs', 'सभी नमूना नौकरियाँ देखें')}
                  </Button>
                </div>
              )}
            </Card>
          ) : null}
        </section>

        <section className="space-y-4">
          <Card>
            <CardHeader title={t('home.upcoming')} subtitle={t('home.upcomingSub')} />
            <div className="mt-5">
              <UpcomingActivities activities={state.activities} language={language} />
            </div>
          </Card>

          <Card>
            <CardHeader
              title={pick(language, 'Your farm', 'आपका खेत')}
              subtitle={pick(
                language,
                'Saved to your signed-in profile',
                'आपकी साइन-इन प्रोफ़ाइल में सेव',
              )}
            />
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-ink-100 bg-surface-sunken p-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">
                    {state.profile.village}, {state.profile.district}
                  </p>
                  <p className="text-xs text-ink-500">{state.profile.state}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-ink-100 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                    {pick(language, 'Land', 'जोत')}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-900">
                    {state.profile.landHolding || '-'}
                  </p>
                </div>
                <div className="rounded-xl border border-ink-100 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                    {pick(language, 'Crop', 'फसल')}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-900">
                    {crop ? (language === 'hi' ? crop.labelHi : crop.label) : '-'}
                  </p>
                </div>
              </div>
              <Button variant="secondary" fullWidth to="/profile" size="sm">
                {pick(language, 'Manage profile', 'प्रोफ़ाइल संभालें')}
              </Button>
            </div>
          </Card>
        </section>
      </div>

      <JobPostModal open={postOpen} onClose={() => setPostOpen(false)} />
    </div>
  )
}
