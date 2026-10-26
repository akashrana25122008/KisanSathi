import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="eyebrow mb-2">404</p>
      <h1 className="text-3xl font-bold tracking-tight text-ink-900">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-ink-500">
        This route does not exist in the KisanSathi prototype. Head back to the dashboard to
        continue exploring.
      </p>
      <Button to="/" className="mt-6">
        Go to home
      </Button>
    </div>
  )
}

