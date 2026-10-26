import { existsSync, readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createApiHandler } from './api.mjs'
import { assertProductionSecrets, loadServerEnv } from './env.mjs'
import { createStore } from './store.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
loadServerEnv(root)
try {
  assertProductionSecrets()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}

const dataDir = resolve(root, process.env.KS_DATA_DIR || 'server/data')
const distDir = resolve(root, 'dist')
const port = Number.parseInt(process.env.PORT || '4173', 10)
const store = createStore(dataDir)
const api = createApiHandler({ store, dataDir })

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
}

function sendFile(res, file, status = 200) {
  const ext = extname(file).toLowerCase()
  const isAsset = file.includes(`${join(distDir, 'assets')}`)
  res.statusCode = status
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
  res.setHeader(
    'Cache-Control',
    isAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
  )
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.end(readFileSync(file))
}

function serveStatic(req, res) {
  if (!existsSync(distDir)) {
    res.statusCode = 503
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('KisanSathi is not built yet. Run "npm run build" and start again.')
    return
  }

  const url = new URL(req.url || '/', 'http://localhost')
  let pathname
  try {
    pathname = decodeURIComponent(url.pathname)
  } catch {
    res.statusCode = 400
    res.end('Bad request')
    return
  }

  if (pathname.includes('\0') || pathname.split('/').includes('..')) {
    res.statusCode = 400
    res.end('Bad request')
    return
  }

  const requested = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')
  const file = resolve(distDir, requested)
  if (file !== distDir && !file.startsWith(`${distDir}${sep}`)) {
    res.statusCode = 400
    res.end('Bad request')
    return
  }
  if (existsSync(file) && statSync(file).isFile()) {
    sendFile(res, file)
    return
  }
  sendFile(res, join(distDir, 'index.html'))
}

const server = createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://localhost')
  if (url.pathname.startsWith('/api/')) {
    api(req, res)
    return
  }
  serveStatic(req, res)
})

server.listen(port, '0.0.0.0', () => {
  const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'
  console.log(`KisanSathi running at http://localhost:${port} (${mode})`)
  if (!process.env.GROQ_API_KEY) {
    console.log('Groq is not configured; local AI and labeled photo fallback are active.')
  }
})

function shutdown() {
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(0), 4000).unref()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
