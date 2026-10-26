import type { IncomingMessage, ServerResponse } from 'node:http'

export interface ApiStore {
  [key: string]: unknown
}

export function createApiHandler(options: {
  store: ApiStore
  dataDir: string
}): (
  req: IncomingMessage,
  res: ServerResponse,
  next?: (error?: unknown) => void,
) => Promise<void>
