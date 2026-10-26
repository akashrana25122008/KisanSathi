import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'

const SCHEMA_VERSION = 1

function emptyData() {
  return {
    version: SCHEMA_VERSION,
    users: {},
    otpChallenges: {},
    sessions: {},
  }
}

function normalizeLoaded(raw) {
  if (!raw || typeof raw !== 'object') return emptyData()
  return {
    version: SCHEMA_VERSION,
    users: raw.users && typeof raw.users === 'object' ? raw.users : {},
    otpChallenges:
      raw.otpChallenges && typeof raw.otpChallenges === 'object' ? raw.otpChallenges : {},
    sessions: raw.sessions && typeof raw.sessions === 'object' ? raw.sessions : {},
  }
}

export function createStore(dataDir) {
  mkdirSync(dataDir, { recursive: true })
  const file = join(dataDir, 'store.json')
  let data = emptyData()

  if (existsSync(file)) {
    try {
      data = normalizeLoaded(JSON.parse(readFileSync(file, 'utf8')))
    } catch {
      const backup = `${file}.corrupt-${Date.now()}`
      try {
        renameSync(file, backup)
      } catch {
        /* keep the unreadable file in place */
      }
      data = emptyData()
    }
  }

  let writeQueue = Promise.resolve()

  function prune(now = Date.now()) {
    for (const [id, challenge] of Object.entries(data.otpChallenges)) {
      if (!challenge || challenge.expiresAt <= now) delete data.otpChallenges[id]
    }
    for (const [hash, session] of Object.entries(data.sessions)) {
      if (!session || session.expiresAt <= now) delete data.sessions[hash]
    }
  }

  function persist() {
    prune()
    const snapshot = JSON.stringify(data, null, 2)
    writeQueue = writeQueue.then(() => {
      const temp = `${file}.tmp`
      writeFileSync(temp, snapshot, { encoding: 'utf8', mode: 0o600 })
      renameSync(temp, file)
    })
    return writeQueue
  }

  prune()

  return {
    data,

    async save() {
      await persist()
    },

    userById(id) {
      return data.users[id] ?? null
    },

    userByPhone(phone) {
      return Object.values(data.users).find((user) => user.phone === phone) ?? null
    },

    createUser(user) {
      data.users[user.id] = user
      return user
    },

    challengeByPhone(phone) {
      return (
        Object.values(data.otpChallenges)
          .filter((challenge) => challenge.phone === phone)
          .sort((a, b) => b.createdAt - a.createdAt)[0] ?? null
      )
    },

    createChallenge(challenge) {
      for (const [id, existing] of Object.entries(data.otpChallenges)) {
        if (existing.phone === challenge.phone) delete data.otpChallenges[id]
      }
      data.otpChallenges[challenge.id] = challenge
      return challenge
    },

    deleteChallenge(id) {
      delete data.otpChallenges[id]
    },

    createSession(hash, session) {
      data.sessions[hash] = session
      return session
    },

    sessionByHash(hash) {
      const session = data.sessions[hash]
      if (!session) return null
      if (session.expiresAt <= Date.now()) {
        delete data.sessions[hash]
        return null
      }
      return session
    },

    deleteSession(hash) {
      delete data.sessions[hash]
    },
  }
}
