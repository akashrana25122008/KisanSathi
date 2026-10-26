# KisanSathi

A bilingual farming assistant and work-bridge for small Indian farmers. The
assistant answers known questions offline from a curated knowledge base, uses
an optional server-side GroqCloud model only when a question is outside that
base, and adds a clearly labelled crop-photo check. Farmer accounts use mobile
OTP, profiles are stored on the local server, and jobs and crop plans persist.

## What it does

- **Farmer accounts** - mobile-number OTP login, HttpOnly session cookie,
  server-backed profile with name, village, district, primary crop and land
  size. The first sign-in continues to a profile setup step.
- **Personalised dashboard** - greeting, verified phone, profile crop/land
  summary, crop-season field note and nearby jobs filtered by district.
- **KisanSathi AI** - local-first answers in English, Hindi and Hinglish
  across ten farming categories. The optional GroqCloud provider is called
  only for questions the local retrieval engine cannot answer; known answers
  never leave the phone.
- **Guided crop diagnostic** - asks up to five short questions and ranks
  *possible causes*, with quick replies and an edit-last-answer control. It
  never claims a confirmed diagnosis.
- **Crop photo check** - resizes the image in the browser, sends it only for
  the current check, and labels whether a server vision model was used. With
  no vision key it returns an honest local checklist based on the farmer's
  description, not a pretend analysis.
- **Jobs marketplace** - farmers post work, workers enrol, wages and
  vacancies are tracked.
- **Crop planner** - turns a crop plan into dated tasks and job posts.

UI copy is bilingual; language is stored with the account and can be switched
from the header or auth screens.

## Run it locally

Requires Node.js 24+.

```powershell
Set-Location D:\KisanSathi
npm install
npm run dev
```

Open **http://localhost:5173**. In development OTP mode the six-digit code is
shown on the login screen, so no SMS provider is needed. It is intentionally
not filled in automatically.

Other scripts:

```powershell
npm run build     # type-check and build to dist/
npm start         # standalone API + static server on PORT (default 4173)
npm run preview   # Vite preview with the API middleware
npm run lint      # oxlint
npm run test:server # dependency-free checks for server helpers and secrets
npx tsc -b        # type-check only
```

`npm start` expects `npm run build` to have produced `dist/`. When
`NODE_ENV=production`, the standalone server refuses to start unless
`SESSION_SECRET` and `OTP_PEPPER` are each at least 32 characters.

## Configuration

Copy `.env.example` to `.env.local` if you need server-side AI or real SMS.
The Vite dev/preview server and the standalone server both load `.env.local`,
then `.env`.

| Variable | Purpose |
| --- | --- |
| `PORT` | Standalone server port (default `4173`). |
| `KS_DATA_DIR` | JSON store and upload directory (default `server/data`). Use a throwaway directory for tests. |
| `OTP_PEPPER` | Secret mixed into hashed development OTPs. Required (32+ characters) when `NODE_ENV=production`. |
| `SESSION_SECRET` | Secret used to HMAC session tokens. Required (32+ characters) when `NODE_ENV=production`. |
| `TRUST_PROXY` | Set to `1` only behind a trusted reverse proxy that overwrites `X-Forwarded-For`; otherwise the socket address is used for rate limiting. |
| `TWILIO_ACCOUNT_SID` | Twilio account SID for real SMS OTP. |
| `TWILIO_AUTH_TOKEN` | Twilio auth token. |
| `TWILIO_VERIFY_SERVICE_SID` | Twilio Verify service SID. |
| `GROQ_API_KEY` | Optional GroqCloud API key. Server-side only; never sent to the browser. |
| `GROQ_CHAT_MODEL` | Optional GroqCloud chat model override (default `openai/gpt-oss-120b`). |
| `GROQ_VISION_MODEL` | Optional GroqCloud vision model override (default `qwen/qwen3.8-27b`). |

OTP mode is `twilio` when all three Twilio values are present, `development`
when they are not, and `production` when `NODE_ENV=production` without
Twilio. Development OTPs are returned only in development mode; production
refuses to pretend an SMS was sent.

If `GROQ_API_KEY` is absent, `/api/ai/status` reports
`chatConfigured: false` and `visionConfigured: false`, local answers continue
to work, and the chat status panel says no remote model is connected. The
browser never receives the key. When configured, requests go to
`https://api.groq.com/openai/v1/chat/completions` from the server only.

## Data and privacy

- Accounts, OTP challenges, sessions, profiles, uploaded photos and server
  sessions live under `KS_DATA_DIR` (default `server/data`).
- OTPs are HMAC-hashed, session tokens are HMAC-hashed before storage and sent
  in an `HttpOnly`, `SameSite=Lax` cookie. In production the cookie is also
  `Secure`.
- OTP and chat/photo endpoints are rate-limited. Clients cannot spoof
  `X-Forwarded-For` unless the operator explicitly enables `TRUST_PROXY=1` for
  a trusted proxy. Uploads accept JPG, PNG or WebP only, with size limits
  enforced server-side.
- The local knowledge base remains the default answer path. A remote question
  or photo is sent only when the server reports that the corresponding model
  is configured, and the UI states which path was used.
- Jobs, enrolments and planner data remain in browser storage. The profile
  itself is server-backed and is deliberately not cached in `localStorage`, so
  the phone number is not left in browser storage. Chat transcripts stay in
  `sessionStorage` for the current browser session. The profile page can sign
  out or reset demo jobs/plans without deleting the account.
- Profile photos are stored as files and served from `/api/uploads/`; crop
  photos used for a check are not saved to the account.

## The assistant is local-first

Answers are computed on the device from a curated knowledge base
(`src/data/knowledge/`) matched by a weighted retrieval index
(`src/lib/retrieval.ts`). The assistant never invents a live mandi price, a
weather forecast, a subsidy amount, a fertilizer dose, a pesticide product or
a guaranteed yield. For those it says plainly that it has no reliable answer
and points at the official portal and the nearest Krishi Vigyan Kendra (KVK).

Every external link comes from the 13 verified official Indian portals listed
in `src/data/knowledge/sources.ts`.

The optional remote path lives behind `setRemoteProvider` /
`askQuestionAsync` in `src/lib/aiEngine.ts`. The AI page registers a provider
only when `/api/ai/status` reports the GroqCloud chat model configured, and the
provider returns `null` for any question the local engine answered
confidently. A remote failure falls back to the local answer instead of
showing the farmer an error.

## Honest limitations

Photo vision needs a server GroqCloud key. Without it, photos are not read and
the UI says so. The crop check is a possibility list, not a diagnosis. Live
mandi prices, weather and scheme payment status still require a live data
feed. The full status is in [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md).

## Automated checks

The end-to-end checks drive the real UI in real headless Chrome over the
Chrome DevTools Protocol. They use a throwaway Chrome profile, sign in through
the development OTP login screen, complete first-time onboarding, reload the
session and create their own temporary farmer account.

```powershell
# terminal 1
$env:KS_DATA_DIR = "$env:TEMP\kisansathi-e2e-data"
npm run dev -- --host 127.0.0.1 --port 5174

# terminal 2
node tests\kisansathi-phase8-e2e.mjs http://127.0.0.1:5174
```

The harness runs 115 checks over the protected-route redirect, login and
development OTP label, onboarding and session reload, the compact AI status
and collapsible help, full-screen chat enter/exit and mobile fit, the growing
composer and rich-answer scrolling, local answers for all ten farming
categories, unknown questions, safety handling, per-user chat memory, the
optional remote-provider failure path, the crop photo fallback, adaptive
diagnostic follow-ups, edit-last-answer and browser-storage privacy. Set
`CHROME_PATH` if Chrome is not at the default Windows location.

The dependency-free server checks cover GroqCloud endpoint, model selection,
conversation context, image payloads and fallback behaviour, plus session and
OTP hashing, production secret refusal, phone normalisation and the honest
provider-failure fallback:

```powershell
npm run test:server
```

## Stack

React 19, TypeScript 6, Vite 8, Tailwind CSS 4, React Router 7 and oxlint.
The API is raw Node HTTP with a JSON file store; no database or framework is
required.
