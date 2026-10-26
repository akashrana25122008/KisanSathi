import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'

import { cn } from '@/lib/cn'

export type ToastTone = 'success' | 'info' | 'warning' | 'error'

export interface ToastItem {
  id: string
  title: string
  description?: string
  tone: ToastTone
}

interface ToastContextValue {
  push: (toast: Omit<ToastItem, 'id'>) => void
  success: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TONE_STYLES: Record<ToastTone, { icon: ReactNode; ring: string; iconColor: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    ring: 'ring-brand-200',
    iconColor: 'text-brand-600',
  },
  info: {
    icon: <Info className="h-5 w-5" />,
    ring: 'ring-info-100',
    iconColor: 'text-info-600',
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5" />,
    ring: 'ring-harvest-200',
    iconColor: 'text-harvest-600',
  },
  error: {
    icon: <XCircle className="h-5 w-5" />,
    ring: 'ring-danger-100',
    iconColor: 'text-danger-600',
  },
}

let counter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      counter += 1
      const id = `toast-${counter}`
      setToasts((current) => [...current.slice(-2), { ...toast, id }])
      window.setTimeout(() => dismiss(id), 4200)
    },
    [dismiss],
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      push,
      dismiss,
      success: (title, description) => push({ title, description, tone: 'success' }),
      info: (title, description) => push({ title, description, tone: 'info' }),
      warning: (title, description) => push({ title, description, tone: 'warning' }),
      error: (title, description) => push({ title, description, tone: 'error' }),
    }),
    [push, dismiss],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:items-end sm:px-0"
      >
        {toasts.map((toast) => {
          const tone = TONE_STYLES[toast.tone]
          return (
            <div
              key={toast.id}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl bg-white px-4 py-3 shadow-pop ring-1 animate-fade-up',
                tone.ring,
              )}
            >
              <span className={cn('mt-0.5 shrink-0', tone.iconColor)}>{tone.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-500">
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="-mr-1 -mt-1 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used inside <ToastProvider>')
  }
  return context
}
