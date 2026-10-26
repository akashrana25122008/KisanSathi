import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

function parseEnvFile(text) {
  const out = {}
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!match) continue
    let value = match[2].trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    value = value.replace(/\\n/g, '\n')
    out[match[1]] = value
  }
  return out
}

export function loadServerEnv(root) {
  const loaded = {}
  for (const name of ['.env.local', '.env']) {
    const file = join(root, name)
    if (!existsSync(file)) continue
    Object.assign(loaded, parseEnvFile(readFileSync(file, 'utf8')))
  }
  for (const [key, value] of Object.entries(loaded)) {
    if (process.env[key] === undefined) process.env[key] = value
  }
  return loaded
}

export function assertProductionSecrets() {
  if (process.env.NODE_ENV !== 'production') return

  const problems = []
  for (const key of ['SESSION_SECRET', 'OTP_PEPPER']) {
    const value = process.env[key]?.trim()
    if (!value) {
      problems.push(`${key} is missing`)
    } else if (value.length < 32) {
      problems.push(`${key} must be at least 32 characters`)
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `Refusing to start in production: ${problems.join('; ')}. ` +
        'Set strong random values in the server environment or .env.local.',
    )
  }
}
