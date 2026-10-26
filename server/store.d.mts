export interface KisanStore {
  [key: string]: unknown
}

export function createStore(dataDir: string): KisanStore
