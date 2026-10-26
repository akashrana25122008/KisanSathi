type ClassValue = string | number | null | undefined | false | ClassValue[]

/**
 * Tiny className joiner.
 *
 * We deliberately avoid `clsx`/`tailwind-merge` - KisanSathi has a small,
 * predictable class surface, so a recursive join keeps the dependency list
 * short and the bundle small.
 */
export function cn(...values: ClassValue[]): string {
  const out: string[] = []

  for (const value of values) {
    if (!value) continue
    if (Array.isArray(value)) {
      const nested = cn(...value)
      if (nested) out.push(nested)
    } else {
      out.push(String(value))
    }
  }

  return out.join(' ')
}
