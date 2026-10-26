import { useCallback, useEffect, useState } from 'react'

/**
 * Reads a value from localStorage with a safe fallback.
 * Storage can be unavailable (private mode, disabled cookies) so every
 * access is wrapped in try/catch.
 */
export function readStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** Writes a value to localStorage, silently ignoring quota/permission errors. */
export function writeStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* Storage unavailable - the app still works, it just will not persist. */
  }
}

/** Removes a key from localStorage. */
export function removeStored(key: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* no-op */
  }
}

/**
 * `useState` that mirrors into localStorage.
 *
 * KisanSathi uses this to remember the selected role, the language
 * preference, the farmer profile and any jobs posted during the session.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((previous: T) => T)) => void] {
  const [state, setState] = useState<T>(() => readStored(key, initialValue))

  useEffect(() => {
    writeStored(key, state)
  }, [key, state])

  const update = useCallback((value: T | ((previous: T) => T)) => {
    setState((previous) =>
      typeof value === 'function' ? (value as (previous: T) => T)(previous) : value,
    )
  }, [])

  return [state, update]
}
