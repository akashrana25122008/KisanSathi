# KisanSathi - Known limitations (honest status)

This page lists what the prototype can and cannot do today. It is written for
the people who will run and judge the project, so nothing here is dressed up
as "coming soon".

**Scope rules used here**

- *Fixable locally* means the change can be made in this repository without a
  new external service.
- *Necessary for the current demo* means the demo is still honest and complete
  without it.
- The assistant is **local-first**, not a general-purpose model. Known
  questions are answered deterministically from a curated knowledge base.
  GroqCloud is optional and server-side, and is used only when configured and
  the local engine has no confident answer.
- Accounts, profiles and sessions are real enough for the demo, but this is
  not a hardened production identity system.

---

## 1. Accounts, OTP and sessions

| Limitation | Fixable locally? | Proposed fix | Infrastructure or permissions needed | Necessary for the demo? |
| --- | --- | --- | --- | --- |
| Real SMS OTP needs a Twilio Verify account. Without Twilio the server runs in development OTP mode and shows the code on screen. Production mode without Twilio refuses to pretend an SMS was sent. | Yes, for the flow | Keep the development flow for demos; configure Twilio for a pilot. | Twilio account, sender/Verify service, SMS budget and Indian DLT/regulatory compliance where applicable. | No - the development code is explicitly labelled. |
| There is one phone number per account and no email, password, account recovery or account deletion flow. | Partly | Add an account settings page with a verified-number change and an export/delete flow. | Product and privacy review. | No - the profile page can sign out and reset demo data. |
| Accounts live in a JSON file store under `KS_DATA_DIR`, with in-memory rate limits. It is single-process and not suitable for multiple app servers. | Partly | Move users/sessions to SQLite or Postgres and rate limits to a shared store. | A database and a shared cache, or a managed platform. | No - one process is enough for the current demo. |
| `OTP_PEPPER` and `SESSION_SECRET` fall back to development defaults when unset. The standalone server refuses to start with `NODE_ENV=production` unless both are at least 32 characters. | Yes | Set strong random values through secret management before deployment. | Secret management. | No for local development; yes before any public deployment. |
| There is no CSRF token, audit log, device/session list or suspicious-login alert. Cookies are `HttpOnly`, `SameSite=Lax` and `Secure` in production, and the API accepts JSON only. | Partly | Add CSRF protection for cookie-authenticated mutations, plus session management and audit logging. | Security review. | No for the demo, but required before production. |
| The server does not verify that a person is a farmer or owns the phone number beyond the OTP. | No | Add optional self-declaration and a KVK/extension verification loop. | Moderation staff and an official verification process. | No. |

## 2. Data, privacy and storage

| Limitation | Fixable locally? | Proposed fix | Infrastructure or permissions needed | Necessary for the demo? |
| --- | --- | --- | --- | --- |
| Profiles, profile photos, hashed OTPs and hashed sessions are stored on the local server. Jobs, enrolments, planner tasks and UI preferences remain in browser `localStorage` under `kisansathi:v1`; the signed-in profile is not cached there. | Partly | Move jobs/plans behind the API with an offline cache, and document a backup/restore process. | Database, object storage if photos grow, and backup infrastructure. | No - the split is stated in the README. |
| Uploaded profile photos are served from `/api/uploads/` and are not encrypted at rest. The JSON store is not encrypted either. | Partly | Encrypt sensitive fields, add retention limits and an erase-my-data control. | Key management and a privacy review. | No, but a real pilot needs it. |
| Crop photos are sent to the server for a check and are not saved to the account. If GroqCloud vision is configured, the image and description go to GroqCloud for that request. Without a vision key, the image is not analysed. | No, by design | Keep the explicit consent/notice, minimise retention, and add a documented data-processing agreement. | GroqCloud account and a privacy/DPA review. | No - the local fallback is clearly labelled. |
| Chat transcripts are kept in `sessionStorage` per user for the browser session, excluding photo previews. They are not synced across devices. | Yes | Add optional server-side history with an explicit clear/export control. | Database and retention policy. | No - session-only memory is enough. |
| There is no live location lookup. Advice uses the district/village from the profile, and "nearby" jobs are filtered by district text. | Partly | Add an offline place-name dataset or a maps/geocoding provider with consent. | A maps API with a key, or a checked-in village dataset. | No. |

## 3. The Kisan AI assistant

| Limitation | Fixable locally? | Proposed fix | Infrastructure or permissions needed | Necessary for the demo? |
| --- | --- | --- | --- | --- |
| Answers come from a curated knowledge base with a weighted retrieval index, not from a model by default. Coverage is limited to what is written down. | Yes | Keep adding entries and Hindi/Hinglish synonyms; re-run the retrieval probe for new phrasing. | Content writing only. | No - the fallback is honest. |
| The ten covered categories are crop planning; sowing and seed choice; soil and compost; irrigation and drainage; pests and diseases; rotation, weeds and crop stage; harvest, drying and storage; livestock and poultry; government schemes and services; and farm costs and labour. Anything outside them gets an explicit "I don't have a reliable answer". | Yes | Add entries to the matching topic file. | None. | No. |
| The guided diagnostic understands a curated list of symptom, watering and condition words. Unusual phrasing causes it to repeat the pending question instead of guessing. | Yes | Add synonyms and a "did you mean" hint, while keeping the no-guess behaviour. | None. | No. |
| The diagnostic ranks *possible causes*; it cannot confirm a disease, deficiency or pest from text. | No, not fully | Keep the wording "possible causes" and hand over to a KVK. A real diagnosis needs a validated plant-doctor model and agronomic review. | A validated model, image/data agreement and expert review. | No - the prototype must stay non-committal. |
| Crop photo vision needs `GROQ_API_KEY`/`GROQ_VISION_MODEL`. Without it the photo is not read, and the UI says so before and after the check. | Partly | Keep the labelled fallback, or configure an approved vision model. | GroqCloud account and a privacy review. | No - the honest fallback is a feature, not a gap. |
| Photo results are possibilities, confidence can be low, and no pesticide product, dose or guaranteed cure is given. | No, by design | Keep it that way until official local recommendations can be integrated safely. | Official region-specific advisory data and review. | No - this is a safety requirement. |
| The assistant never quotes a live mandi price, weather forecast, scheme payment status or subsidy amount. Dedicated entries explain the limit and point to the official portal and KVK. | No, not without a backend | Add read-only public data feeds with a cached fallback and an "as of" timestamp. | Public/registered data APIs, a proxy and rate-limit handling. | No - inventing numbers would be dishonest. |
| External references come from 13 verified official Indian portals in `src/data/knowledge/sources.ts`. There is no deep link to a specific advisory package, and the KVK directory is not linked because its address did not resolve when checked. | Partly | Add a build-time link check and the official KVK directory once verified. | A link-check script and a verified URL. | No. |
| GroqCloud is optional and server-side. The browser receives only `chatConfigured`/`visionConfigured`, never the key. Known local answers do not call GroqCloud; only unmatched questions do. A remote failure falls back to the local answer. | Yes, already done | Keep the local-first routing and the compact status help in step with `/api/ai/status`. | GroqCloud account and billing if enabled. | No - the app works fully without it. |

## 4. Voice, jobs, marketplace and planner

| Limitation | Fixable locally? | Proposed fix | Infrastructure or permissions needed | Necessary for the demo? |
| --- | --- | --- | --- | --- |
| Speech recognition depends on the Web Speech API. Firefox does not implement it; Chromium browsers send audio to the browser vendor's speech service. KisanSathi never receives or stores the audio. | No - browser design | Keep the notice and offer "type instead". A local recogniser would be a new dependency. | A browser with speech support and, for Chromium, internet access. | No - text chat works without it. |
| Speech synthesis uses OS voices; Hindi may be missing or poor on some machines. | Yes | Add a voice check that lists available voices and warns when the language has none. | None. | No. |
| There is no wake word or hands-free mode; the farmer presses the microphone button. | Yes | Add push-to-talk shortcuts and, later, an optional wake word. | A local wake-word model if added. | No. |
| Job postings are not published to a shared server. They live in `localStorage`, so they exist only in that browser profile and are lost when demo data is reset. | Partly | Move jobs behind the API with a read-through cache. | Database and moderation. | No. |
| There is no real-time messaging between farmer and worker; contact is limited to what the job page shows. | No | Add a messaging service with delivery state and moderation. | Backend, messaging provider, push infrastructure and moderation. | No. |
| Payments, wage settlement and money movement are not implemented. Wages are numbers only. | No | Integrate a regulated payment provider with KYC, refunds and dispute handling. | Payment provider, KYC and compliance. | No - no payment flow is claimed. |
| Distance and travel time are not computed; jobs show district and village only. | Partly | Add an offline place-name dataset or a maps API. | Maps/geocoding key or a village coordinate dataset. | No. |

## 5. Engineering and testing

| Limitation | Fixable locally? | Proposed fix | Infrastructure or permissions needed | Necessary for the demo? |
| --- | --- | --- | --- | --- |
| There is no general unit-test runner. A dependency-free Node check covers server helpers (`npm run test:server`), and a Chrome DevTools Protocol harness drives the real UI and API. | Yes | Add Vitest for pure client logic (`diagnostics`, `aiEngine`, `retrieval`, `planner`) and keep the CDP journey test. | A dev dependency. | No - the server checks and CDP harness cover the main journeys. |
| The harness needs a dev server in development OTP mode. It signs in through the real login UI, completes onboarding with a temporary account, and drives the real API. | Yes | Add a dedicated test-only API token in a separate test environment if CI needs one. | CI secret management. | No. |
| The harness stubs nothing for speech hardware; microphone permissions and vendor speech services are not exercised. | No | Run the same journeys manually on a real device and record the result. | A real device and internet access. | No, but state it when demoing voice. |
| The build is a single large bundle (about 934 kB, about 261 kB gzipped) with no route-level code splitting. | Yes | Lazy-load `/ai` and other routes so the knowledge base is fetched on demand. | None. | No. |
| There is no migration runner for the JSON store beyond its schema version; old data files should be backed up before changing shapes. | Yes | Add an explicit migration script and a schema test. | None for the file store. | No. |

---

## What is deliberately *not* claimed

- The assistant is **not** a general-purpose live AI model. It is local-first,
  with an optional server-side GroqCloud path.
- There is **no API key in the browser bundle or in `localStorage`**. The key,
  when configured, lives only in the server environment.
- There is **no** confirmed crop diagnosis, pesticide prescription or
  fertilizer dose.
- There is **no** live agricultural, weather, mandi-price or scheme data.
- There is **no** real-time worker messaging and **no** payment flow.
- Voice input uses the browser's speech service; KisanSathi never receives
  the audio and says so where the microphone is used.
- The current data store and auth hardening are suitable for a demo, not for
  an unqualified public launch.

## How to check these claims yourself

1. Run the app and sign in with a development OTP. Open the AI page and expand
   the compact "Local AI" help. It names whether a remote model and vision
   model are configured, along with the offline and privacy limits.
2. Search the client source for `GROQ_API_KEY`, `apiKey`, `Authorization` and
   `Bearer`. The key is read only by `server/` code and is never returned by
   `/api/ai/status`.
3. Turn the network off after loading the page and ask a known farming
   question. The local answer still works; an unmatched question falls back
   honestly.
4. Ask for a mandi price, tomorrow's weather or a scheme payment amount. The
   assistant refuses to invent a number and points to the official portal and
   KVK.
5. Open the photo tab without a vision key. The UI states before and after
   the check that the photo was not analysed.
