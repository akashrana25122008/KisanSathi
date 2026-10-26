import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { MobileNav } from '@/components/layout/MobileNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { WorkspaceChromeContext } from '@/components/layout/WorkspaceChromeContext'
import { cn } from '@/lib/cn'

/**
 * The application shell: a fixed desktop sidebar, a sticky top bar and a
 * mobile bottom navigation bar. Route content renders inside <Outlet />.
 *
 * The AI route is a viewport workspace: it owns its own scrolling so the
 * conversation can fill the screen without creating a second page scrollbar.
 * Its full-screen mode removes the application chrome entirely, allowing the
 * same AI page instance to own the whole viewport without remounting.
 */
export function AppShell() {
  const { pathname } = useLocation()
  const [aiFullscreen, setAiFullscreen] = useState(false)
  const isAiWorkspace = pathname === '/ai'
  const isFullscreen = isAiWorkspace && aiFullscreen

  // Move focus to the top of the page on navigation so keyboard and screen
  // reader users are not left at the bottom of the previous screen.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return (
    <WorkspaceChromeContext.Provider
      value={{ fullscreen: isFullscreen, setFullscreen: setAiFullscreen }}
    >
      <div
        data-ai-fullscreen={isFullscreen ? 'true' : 'false'}
        className={cn(
          'min-h-dvh bg-canvas',
          isAiWorkspace && 'h-dvh overflow-hidden',
          isFullscreen && 'ai-fullscreen-viewport fixed inset-0 z-40 min-h-0',
        )}
      >
        {isFullscreen ? null : <Sidebar />}

        <div
          className={cn(
            !isFullscreen && 'lg:pl-[264px]',
            isAiWorkspace && 'flex h-dvh min-h-0 flex-col',
            isFullscreen && 'h-full',
          )}
        >
          {isFullscreen ? null : <TopBar />}
          <main
            id="main-content"
            className={cn(
              'mx-auto w-full',
              isAiWorkspace
                ? cn(
                    'flex min-h-0 max-w-none flex-1 flex-col overflow-hidden',
                    isFullscreen
                      ? 'h-full px-0 py-0'
                      : 'px-3 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-3 sm:px-5 lg:px-6 lg:pb-4 lg:pt-4',
                  )
                : 'max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-14 lg:pt-8',
            )}
          >
            <Outlet />
          </main>
        </div>

        {isFullscreen ? null : <MobileNav />}
      </div>
    </WorkspaceChromeContext.Provider>
  )
}
