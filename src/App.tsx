import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { PublicOnly, RequireAuth, RequireCompleteProfile } from '@/components/auth/RouteGuards'
import { AppShell } from '@/components/layout/AppShell'
import { AppProvider } from '@/store/AppContext'
import { AuthProvider } from '@/store/AuthContext'
import { ToastProvider } from '@/components/ui/Toast'
import { WelcomePage } from '@/pages/WelcomePage'
import { LoginPage } from '@/pages/LoginPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { HomePage } from '@/pages/HomePage'
import { JobsPage } from '@/pages/JobsPage'
import { JobDetailPage } from '@/pages/JobDetailPage'
import { AiPage } from '@/pages/AiPage'
import { PlannerPage } from '@/pages/PlannerPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { NotFoundPage } from '@/pages/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppProvider>
            <Routes>
              <Route element={<PublicOnly />}>
                <Route path="welcome" element={<WelcomePage />} />
                <Route path="login" element={<LoginPage />} />
              </Route>

              <Route element={<RequireAuth />}>
                <Route path="onboarding" element={<OnboardingPage />} />

                <Route element={<RequireCompleteProfile />}>
                  <Route element={<AppShell />}>
                    <Route index element={<HomePage />} />
                    <Route path="jobs" element={<JobsPage />} />
                    <Route path="jobs/:id" element={<JobDetailPage />} />
                    <Route path="ai" element={<AiPage />} />
                    <Route path="planner" element={<PlannerPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </AppProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
