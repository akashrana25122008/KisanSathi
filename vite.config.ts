import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

import { createApiHandler } from './server/api.mjs'
import { createStore } from './server/store.mjs'

function applyServerEnv(loaded: Record<string, string>) {
  for (const [key, value] of Object.entries(loaded)) {
    if (process.env[key] === undefined) process.env[key] = value
  }
}

function kisansathiApi(dataDir: string): Plugin {
  const store = createStore(dataDir)
  const handler = createApiHandler({ store, dataDir })

  return {
    name: 'kisansathi-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        void handler(req, res, next)
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        void handler(req, res, next)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const loaded = loadEnv(mode, process.cwd(), '')
  applyServerEnv(loaded)
  const dataDir = resolve(process.cwd(), process.env.KS_DATA_DIR || 'server/data')

  return {
    plugins: [react(), tailwindcss(), kisansathiApi(dataDir)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
