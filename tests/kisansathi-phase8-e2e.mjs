/**
 * KisanSathi Phase 8 - the free-first AI farming upgrade.
 *
 * Real headless Chrome over CDP against the Vite dev server. It uses its own
 * throwaway Chrome profile, so the demo data in the judge's browser (and in
 * the user's own browser) is never read, written or cleared. It signs in
 * through the real development OTP flow so protected routes can be opened.
 *
 * Sections
 *   0. Protected route, login, development OTP, onboarding and session reload
 *   A. Compact status, full-screen chat, growing composer and rich replies
 *   B. Compact status and help in Hindi
 *   C. Nothing leaves the device - no external request while answering
 *   D. The ten farming categories are answered from the local knowledge base
 *   E. Unknown questions get an honest fallback
 *   F. Safety - no invented dose, price, eligibility or diagnosis
 *   G. The optional remote provider - a remote failure falls back to local
 *   H. Crop photo check - concise honest fallback
 *   I. Adaptive diagnostic follow-ups and edit-last-answer
 *   J. Final sweep - console, network and stored data
 *
 * Usage: node kisansathi-phase8-e2e.mjs http://localhost:5173
 */
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.argv[2] || 'http://localhost:5173'
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9405

/* Every external address the app is allowed to link to. */
const VERIFIED_HOSTS = [
  'https://icar.org.in/',
  'https://agriwelfare.gov.in/',
  'https://www.india.gov.in/',
  'https://soilhealth.dac.gov.in/',
  'https://mausam.imd.gov.in/',
  'https://enam.gov.in/',
  'https://agmarknet.gov.in/',
  'https://pmkisan.gov.in/',
  'https://dbtbharat.gov.in/',
  'https://dahd.gov.in/',
  'https://www.nddb.coop/',
  'https://midh.gov.in/',
  'https://agritech.tnau.ac.in/',
]

/* Wording that would mean the app is asking for a key or showing an alarm. */
const ALARM_PATTERNS = [
  /missing\s+(your\s+|the\s+)?(api\s+)?key/i,
  /api\s+key\s+(is\s+)?(missing|required|invalid|not\s+found|expired)/i,
  /configure\s+(your\s+|the\s+)?(api\s+)?key/i,
  /enter\s+(your\s+|the\s+)?(api\s+)?key/i,
  /without\s+(an?\s+)?(api\s+)?key\s+(you\s+)?cannot/i,
  /key\s+not\s+configured/i,
  /credential/i,
  /sign\s+in\s+to\s+continue/i,
]

/* A dose, a product name or a price that must never be invented. */
const UNSAFE_ANSWER = [
  /\b\d+(\.\d+)?\s*(kg|g|ml|litre|liter|gram)\s*(per|\/|a)\s*(acre|hectare|plant|plot)/i,
  /\b\d+(\.\d+)?\s*(ml|litre|liter|g|kg)\s*(of|per)\s*(water|spray|solution)/i,
  /\b(mancozeb|chlorothalonil|copper\s+oxychloride|imidacloprid|thiamethoxam|carbendazim|maneb|captan)\b/i,
  /^\s*[-•]\s*(spray|mix|dilute)\s+.*\d/i,
  /₹\s*\d/,
  /\b\d{2,}\s*(rupees|rs\.?)\s*(per|\/)\s*(quintal|tonne|kg|acre)/i,
]

let passed = 0
let failed = 0
const failures = []

function head(title) {
  console.log('\n=== ' + title + ' ===')
}

function check(name, ok, detail = '') {
  if (ok) {
    passed += 1
    console.log('PASS  ' + name + (detail ? ' :: ' + detail : ''))
  } else {
    failed += 1
    failures.push(name + (detail ? ' :: ' + detail : ''))
    console.log('FAIL  ' + name + (detail ? ' :: ' + detail : ''))
  }
}

/* ------------------------------------------------------------------ */
/* CDP plumbing                                                       */
/* ------------------------------------------------------------------ */

let ws
let msgId = 0
const pending = new Map()
const consoleErrors = []
const pageExceptions = []
const externalRequests = []
const failedRequests = []

function send(method, params = {}) {
  const id = ++msgId
  ws.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id)
        reject(new Error('CDP timeout: ' + method))
      }
    }, 30000)
  })
}

async function evaluate(expression) {
  const res = await send('Runtime.evaluate', {
    expression: `(async function(){${expression}})()`,
    awaitPromise: true,
    returnByValue: true,
  })
  if (res.exceptionDetails) {
    throw new Error(
      res.exceptionDetails.exception?.description || res.exceptionDetails.text,
    )
  }
  return res.result.value
}

async function waitFor(expression, label) {
  const start = Date.now()
  while (Date.now() - start < 15000) {
    let value = null
    try {
      value = await evaluate(`return (${expression});`)
    } catch {
      value = null
    }
    if (value) return value
    await sleep(120)
  }
  throw new Error('Timed out waiting for: ' + label)
}

const HELPERS = `
  window.__k = {
    set: (el, v) => {
      if (!el) throw new Error('set: element not found');
      const proto = el.tagName === 'TEXTAREA'
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    },
    dump: () => {
      const out = {};
      for (let i = 0; i < localStorage.length; i += 1) {
        const k = localStorage.key(i);
        out[k] = localStorage.getItem(k);
      }
      return out;
    },
  };
`

async function goto(url) {
  try {
    await send('Page.bringToFront')
  } catch {
    /* ignore */
  }
  await send('Page.navigate', { url })
  await waitFor(
    `document.readyState === 'complete' && !!document.querySelector('#root')`,
    'navigation to ' + url,
  )
  await evaluate(HELPERS + ' return true;')
  await waitFor(`document.querySelector('#root').children.length > 0`, 'react mount')
  await evaluate(HELPERS + ' return true;')
  await sleep(300)
}

/**
 * Sign in through the real login and onboarding screens, so the protected
 * /ai route, the development OTP label and first-time profile setup are all
 * exercised. The session lives in an HttpOnly cookie.
 */
async function ensureSignedIn() {
  await goto(`${BASE}/ai`)
  await waitFor(
    `location.pathname === '/welcome'`,
    'an anonymous protected visit to redirect to the welcome page',
  )
  check(
    '0.1 an anonymous visit to /ai is redirected to the welcome page',
    (await evaluate(`return location.pathname;`)) === '/welcome',
  )

  await goto(`${BASE}/login`)
  const phone = '9' + String(Date.now()).slice(-9)
  await evaluate(`
    const input = document.querySelector('[data-testid="phone-input"]');
    if (!input) throw new Error('phone input missing');
    window.__k.set(input, ${JSON.stringify(phone)});
    return true;
  `)
  await sleep(180)
  await evaluate(`
    const button = document.querySelector('[data-testid="send-otp"]');
    if (!button) throw new Error('send OTP button missing');
    button.click();
    return true;
  `)
  await waitFor(
    `!!document.querySelector('[data-testid="dev-otp"]')`,
    'the labelled development OTP panel',
  )
  const otpInfo = await evaluate(`
    const panel = document.querySelector('[data-testid="dev-otp"]');
    const input = document.querySelector('[data-testid="otp-input"]');
    return {
      code: panel.getAttribute('data-code') || '',
      text: panel.innerText || '',
      autoFilled: Boolean(input && input.value),
    };
  `)
  check(
    '0.2 login labels the development OTP and does not auto-fill it',
    /^\d{6}$/.test(otpInfo.code) &&
      /development OTP - not an SMS/i.test(otpInfo.text) &&
      otpInfo.autoFilled === false,
    otpInfo.autoFilled ? 'code was auto-filled' : '',
  )

  await evaluate(`
    const input = document.querySelector('[data-testid="otp-input"]');
    if (!input) throw new Error('OTP input missing');
    window.__k.set(input, ${JSON.stringify(otpInfo.code)});
    return true;
  `)
  await sleep(180)
  await evaluate(`
    const button = document.querySelector('[data-testid="verify-otp"]');
    if (!button) throw new Error('verify OTP button missing');
    button.click();
    return true;
  `)
  await waitFor(
    `location.pathname === '/onboarding'`,
    'a new account to open the onboarding screen',
  )
  check(
    '0.3 a real development OTP opens first-time onboarding',
    (await evaluate(`return location.pathname;`)) === '/onboarding',
  )

  await waitFor(
    `!!document.querySelector('[data-testid="profile-form"]')`,
    'the onboarding profile form',
  )
  await evaluate(`
    const form = document.querySelector('[data-testid="profile-form"]');
    const fields = [...form.querySelectorAll('input:not([type="file"])')];
    const values = ['E2E Farmer', 'Bihar', 'Patna', 'Test Village', '2 acres'];
    if (fields.length < values.length) throw new Error('profile inputs missing');
    fields.slice(0, values.length).forEach((field, index) => {
      window.__k.set(field, values[index]);
    });
    const select = form.querySelector('select');
    if (!select) throw new Error('crop select missing');
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(
      select,
      'potato',
    );
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  `)
  await sleep(180)
  await evaluate(`
    const form = document.querySelector('[data-testid="profile-form"]');
    const submit = form.querySelector('button[type="submit"]');
    if (!submit) throw new Error('profile submit missing');
    submit.click();
    return true;
  `)
  await waitFor(
    `location.pathname === '/' && document.body.innerText.includes('Test Village')`,
    'onboarding to save the profile and open the dashboard',
  )
  check(
    '0.4 onboarding saves the profile and opens the dashboard',
    /Test Village/i.test(await bodyText()),
  )

  const me = await evaluate(`
    const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
    const data = await res.json();
    return data.user || null;
  `)
  check(
    '0.5 the saved profile is complete on the server',
    Boolean(me?.profileComplete) &&
      me?.name === 'E2E Farmer' &&
      me?.phone === phone &&
      me?.primaryCrop === 'potato',
    me?.name || '',
  )

  await goto(`${BASE}/`)
  const afterReload = await bodyText()
  check(
    '0.6 a full page load keeps the session and the server profile',
    /E2E/i.test(afterReload) && /Test Village/i.test(afterReload),
    afterReload.slice(0, 90).replace(/\n/g, ' '),
  )

  return {
    phone,
    userId: me?.id || '',
    complete: Boolean(me?.profileComplete),
    isNew: true,
  }
}

const bodyText = () => evaluate(`return document.body.innerText;`)

const statusText = () =>
  evaluate(`
    const el = document.querySelector('[data-testid="ai-status"]');
    return el ? el.innerText : '';
  `)

const ask = async (text) => {
  await evaluate(`
    const input = document.querySelector('#kisan-ai-input');
    if (!input) throw new Error('chat input missing');
    window.__k.set(input, ${JSON.stringify(text)});
    return true;
  `)
  await sleep(180)
  await evaluate(`
    const input = document.querySelector('#kisan-ai-input');
    const form = input.closest('form');
    const btn = form.querySelector('button[type="submit"]');
    if (btn.disabled) throw new Error('send button still disabled');
    btn.click();
    return true;
  `)
  await sleep(1500)
}

const lastAssistant = () =>
  evaluate(`
    const nodes = [...document.querySelectorAll('[data-testid="chat-assistant"]')];
    return nodes.length ? nodes[nodes.length - 1].innerText : '';
  `)

const lastLinks = () =>
  evaluate(`
    const nodes = [...document.querySelectorAll('[data-testid="chat-assistant"]')];
    const last = nodes[nodes.length - 1];
    return last ? [...last.querySelectorAll('a')].map((a) => a.getAttribute('href')) : [];
  `)

const userDataDir = mkdtempSync(join(tmpdir(), 'ks-p8-'))
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--window-size=1280,900',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
)

async function getWsUrl() {
  const start = Date.now()
  while (Date.now() - start < 20000) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const list = await res.json()
      const page = list.find((t) => t.type === 'page')
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl
    } catch {
      /* not up yet */
    }
    await sleep(250)
  }
  throw new Error('Chrome DevTools endpoint did not come up')
}

try {
  ws = new WebSocket(await getWsUrl())
  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = () => reject(new Error('websocket error'))
  })
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      if (msg.error) reject(new Error(msg.error.message))
      else resolve(msg.result)
      return
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      pageExceptions.push(
        msg.params?.exceptionDetails?.exception?.description ||
          msg.params?.exceptionDetails?.text ||
          'exception',
      )
    }
    if (msg.method === 'Runtime.consoleAPICalled') {
      const type = msg.params?.type
      if (type === 'error' || type === 'warning') {
        const text = (msg.params?.args || [])
          .map((a) => a.value ?? a.description ?? a.type)
          .join(' ')
        consoleErrors.push('[' + type + '] ' + text)
      }
    }
    if (msg.method === 'Network.requestWillBeSent') {
      const url = msg.params?.request?.url || ''
      if (
        !url.startsWith(BASE) &&
        !url.startsWith('data:') &&
        !url.startsWith('blob:') &&
        !url.startsWith('about:')
      ) {
        externalRequests.push(url)
      }
    }
    if (msg.method === 'Network.loadingFailed') {
      const { errorText, type, blockedReason } = msg.params || {}
      if (type !== 'Image' || errorText !== 'net::ERR_ABORTED') {
        failedRequests.push(
          (errorText || 'failed') + (blockedReason ? ' (' + blockedReason + ')' : ''),
        )
      }
    }
  }

  await send('Page.enable')
  await send('Runtime.enable')
  await send('Network.enable')

  const account = await ensureSignedIn()
  console.log('Signed in test farmer ' + account.phone + ' (new: ' + account.isNew + ')')

  /* ================================================================ */
  /* A. Compact status and collapsible help                           */
  /* ================================================================ */
  head('A. Compact status, spacious chat layout and growing composer')

  await goto(`${BASE}/ai`)

  const compactStatus = await evaluate(`
    const el = document.querySelector('[data-testid="ai-status"]');
    if (!el) return null;
    return {
      open: el.open,
      text: el.innerText,
      height: Math.round(el.getBoundingClientRect().height),
      cls: String(el.className || ''),
      color: getComputedStyle(el).color,
      bg: getComputedStyle(el).backgroundColor,
    };
  `)
  check(
    'A1 a compact status indicator is present above the chat',
    Boolean(compactStatus) && compactStatus.height < 80,
    compactStatus ? `${compactStatus.height}px` : 'missing',
  )
  check(
    'A2 it shows a Local AI label and a help affordance',
    Boolean(compactStatus) &&
      /Local AI/i.test(compactStatus.text) &&
      /How it works/i.test(compactStatus.text),
    compactStatus ? compactStatus.text.replace(/\n/g, ' ') : '',
  )
  check(
    'A3 detailed offline, remote and vision help is collapsed by default',
    Boolean(compactStatus) && compactStatus.open === false,
    compactStatus ? `open=${compactStatus.open}` : 'missing',
  )

  const pageBodyBeforeHelp = await bodyText()
  check(
    'A4 the full explanation is not repeated on the main page',
    !/No remote model is connected/i.test(pageBodyBeforeHelp) &&
      !/Image analysis is not available/i.test(pageBodyBeforeHelp) &&
      !/KisanSathi AI is ready/i.test(pageBodyBeforeHelp),
    pageBodyBeforeHelp.slice(0, 120).replace(/\n/g, ' '),
  )

  await evaluate(`
    const el = document.querySelector('[data-testid="ai-status"]');
    if (!el) throw new Error('AI status disclosure missing');
    el.open = true;
    return el.open;
  `)
  await sleep(250)

  const panel = await statusText()
  check(
    'A5 expanding help shows the offline and no-remote explanation',
    /KisanSathi AI is ready/i.test(panel) &&
      /offline/i.test(panel) &&
      /no API key needed/i.test(panel) &&
      /no remote model is connected/i.test(panel),
    panel.slice(0, 180).replace(/\n/g, ' '),
  )
  check(
    'A6 expanded help lists free use and the farming topics',
    /free to use/i.test(panel) &&
      /no running cost/i.test(panel) &&
      /crop planning/i.test(panel) &&
      /sowing/i.test(panel) &&
      /compost/i.test(panel) &&
      /irrigation/i.test(panel) &&
      /rotation/i.test(panel) &&
      /poultry/i.test(panel) &&
      /schemes/i.test(panel),
    '',
  )

  const pageBody = await bodyText()
  const alarmHits = ALARM_PATTERNS.filter((p) => p.test(pageBody)).map(
    (p) => String(p),
  )
  check(
    'A7 the page shows no missing-key, configure-key or credential alarm',
    alarmHits.length === 0,
    alarmHits.join(', '),
  )

  const alertText = await evaluate(`
    const nodes = [...document.querySelectorAll('[role="alert"], [aria-live="assertive"]')];
    return nodes.map((n) => (n.innerText || '').trim()).filter(Boolean).join(' | ');
  `)
  check(
    'A8 no alert region mentions a key or a credential',
    !/key|credential|token/i.test(alertText),
    alertText.slice(0, 120),
  )

  check(
    'A9 the compact status is a calm neutral indicator, not a red warning',
    compactStatus &&
      !/red|rose|destructive|danger/i.test(compactStatus.cls) &&
      !/rgb\(\s*2\d\d,\s*\d{1,2},\s*\d{1,2}\s*\)/.test(compactStatus.color),
    compactStatus ? compactStatus.cls : 'no indicator',
  )

  const layout = await evaluate(`
    const panel = document.querySelector('[data-testid="chat-panel"]');
    const conversation = document.querySelector('[data-testid="chat-scroll"]');
    const toolbar = document.querySelector('[data-testid="ai-toolbar"]');
    const composer = document.querySelector('[data-testid="chat-composer"]');
    const input = document.querySelector('#kisan-ai-input');
    const mic = document.querySelector('[data-testid="voice-mic"]');
    const sendButton = composer ? composer.querySelector('button[type="submit"]') : null;
    if (!panel || !conversation || !toolbar || !composer || !input || !mic || !sendButton) {
      return null;
    }
    const visible = (element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && element.getClientRects().length > 0;
    };
    const inside = (element, parent) => {
      const rect = element.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();
      return (
        rect.top >= parentRect.top - 1 &&
        rect.right <= parentRect.right + 1 &&
        rect.bottom <= parentRect.bottom + 1 &&
        rect.left >= parentRect.left - 1
      );
    };
    const panelRect = panel.getBoundingClientRect();
    const conversationRect = conversation.getBoundingClientRect();
    const toolbarRect = toolbar.getBoundingClientRect();
    const initialRect = input.getBoundingClientRect();
    const initial = Math.round(initialRect.height);
    const initialControlsVisible = visible(mic) && visible(sendButton);
    const initialControlsInside = inside(mic, composer) && inside(sendButton, composer);
    const initialMicLabel = (mic.getAttribute('aria-label') || '').trim();
    const initialSendLabel = (sendButton.getAttribute('aria-label') || '').trim();
    const initialGap = parseFloat(getComputedStyle(input).paddingRight);
    input.focus();
    await new Promise((resolve) => setTimeout(resolve, 90));
    const focused = Math.round(input.getBoundingClientRect().height);
    window.__k.set(
      input,
      Array.from({ length: 12 }, (_, i) => 'line ' + (i + 1)).join('\\n'),
    );
    await new Promise((resolve) => setTimeout(resolve, 220));
    const expanded = input.getBoundingClientRect().height;
    const expandedMicVisible = visible(mic);
    const expandedSendVisible = visible(sendButton);
    const expandedSendEnabled = !sendButton.disabled;
    const expandedControlsInside = inside(mic, composer) && inside(sendButton, composer);
    window.__k.set(input, '');
    await new Promise((resolve) => setTimeout(resolve, 140));
    const resetRect = input.getBoundingClientRect();
    const reset = Math.round(resetRect.height);
    const resetControlsVisible = visible(mic) && visible(sendButton);
    const resetControlsInside = inside(mic, composer) && inside(sendButton, composer);
    const result = {
      panelHeight: Math.round(panelRect.height),
      toolbarHeight: Math.round(toolbarRect.height),
      conversationHeight: Math.round(conversationRect.height),
      conversationScrolls:
        getComputedStyle(conversation).overflowY === 'auto' ||
        getComputedStyle(conversation).overflowY === 'scroll',
      panelBottom: Math.round(panelRect.bottom),
      viewportHeight: window.innerHeight,
      pageScrolls: document.documentElement.scrollHeight > window.innerHeight + 1,
      rows: input.rows,
      initial,
      initialBottom: Math.round(initialRect.bottom),
      focused,
      expanded: Math.round(expanded),
      scrollHeight: input.scrollHeight,
      clientHeight: input.clientHeight,
      overflowY: getComputedStyle(input).overflowY,
      initialControlsVisible,
      initialControlsInside,
      initialMicLabel,
      initialSendLabel,
      initialGap,
      expandedMicVisible,
      expandedSendVisible,
      expandedSendEnabled,
      expandedControlsInside,
      reset,
      resetBottom: Math.round(resetRect.bottom),
      resetControlsVisible,
      resetControlsInside,
    };
    return result;
  `)

  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  })
  await sleep(300)
  const mobileLayout = await evaluate(`
    const panel = document.querySelector('[data-testid="chat-panel"]');
    const conversation = document.querySelector('[data-testid="chat-scroll"]');
    const input = document.querySelector('#kisan-ai-input');
    const toolbar = document.querySelector('[data-testid="ai-toolbar"]');
    const nav = document.querySelector('nav[aria-label="Primary"]');
    if (!panel || !conversation || !toolbar || !input || !nav) return null;
    const panelRect = panel.getBoundingClientRect();
    const conversationRect = conversation.getBoundingClientRect();
    const toolbarRect = toolbar.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    return {
      viewportHeight: window.innerHeight,
      panelHeight: Math.round(panelRect.height),
      toolbarHeight: Math.round(toolbarRect.height),
      panelBottom: Math.round(panelRect.bottom),
      inputBottom: Math.round(inputRect.bottom),
      navTop: Math.round(navRect.top),
      conversationHeight: Math.round(conversationRect.height),
      conversationScrolls:
        getComputedStyle(conversation).overflowY === 'auto' ||
        getComputedStyle(conversation).overflowY === 'scroll',
      pageScrolls: document.documentElement.scrollHeight > window.innerHeight + 1,
    };
  `)
  await send('Emulation.clearDeviceMetricsOverride')
  await sleep(200)

  check(
    'A10 the chat panel fills the viewport on desktop and mobile without page scrolling',
    Boolean(layout) &&
      layout.panelHeight >= layout.viewportHeight * 0.7 &&
      layout.conversationHeight >= 360 &&
      layout.conversationScrolls &&
      layout.panelBottom <= layout.viewportHeight + 1 &&
      !layout.pageScrolls &&
      Boolean(mobileLayout) &&
      mobileLayout.panelBottom <= mobileLayout.navTop + 1 &&
      mobileLayout.inputBottom <= mobileLayout.navTop + 1 &&
      mobileLayout.conversationHeight >= 140 &&
      mobileLayout.conversationScrolls &&
      !mobileLayout.pageScrolls,
    layout && mobileLayout
      ? `desktop ${layout.panelHeight}/${layout.viewportHeight}px, conversation=${layout.conversationHeight}px, bottom=${layout.panelBottom}; mobile ${mobileLayout.panelHeight}/${mobileLayout.viewportHeight}px, toolbar=${mobileLayout.toolbarHeight}px, conversation=${mobileLayout.conversationHeight}px, bottom=${mobileLayout.panelBottom}, nav=${mobileLayout.navTop}`
      : 'missing',
  )
  check(
    'A11 the empty composer is compact, does not grow on focus, and keeps its controls',
    Boolean(layout) &&
      layout.rows === 1 &&
      layout.initial >= 48 &&
      layout.initial <= 64 &&
      layout.focused === layout.initial &&
      layout.reset >= 48 &&
      layout.reset <= 64 &&
      layout.initialBottom <= layout.viewportHeight + 1 &&
      layout.resetBottom <= layout.viewportHeight + 1 &&
      layout.initialControlsVisible &&
      layout.initialControlsInside &&
      layout.resetControlsVisible &&
      layout.resetControlsInside &&
      layout.initialMicLabel.length > 0 &&
      layout.initialSendLabel.length > 0 &&
      layout.initialGap >= 84,
    layout
      ? `rows=${layout.rows}, empty=${layout.initial}px, focus=${layout.focused}px, reset=${layout.reset}px, gap=${layout.initialGap}px, mic="${layout.initialMicLabel}", send="${layout.initialSendLabel}"`
      : 'missing',
  )
  check(
    'A12 a long message grows the composer, then stops and scrolls at the cap',
    Boolean(layout) &&
      layout.expanded > layout.initial + 20 &&
      layout.expanded >= 180 &&
      layout.expanded <= 220 &&
      layout.scrollHeight > layout.clientHeight &&
      layout.overflowY === 'auto' &&
      layout.expandedMicVisible &&
      layout.expandedSendVisible &&
      layout.expandedSendEnabled &&
      layout.expandedControlsInside,
    layout
      ? `${layout.initial}px -> ${layout.expanded}px, scroll=${layout.scrollHeight}/${layout.clientHeight}, ${layout.overflowY}, controls=${layout.expandedMicVisible && layout.expandedSendVisible}`
      : 'missing',
  )

  await evaluate(`
    const status = document.querySelector('[data-testid="ai-status"]');
    if (status) status.open = false;
    const button = document.querySelector('[data-testid="ai-enter-fullscreen"]');
    if (!button) throw new Error('Full screen button is missing');
    button.click();
    return true;
  `)
  await sleep(350)

  const fullscreenDesktop = await evaluate(`
    const shell = document.querySelector('[data-ai-fullscreen="true"]');
    const workspace = document.querySelector('[data-testid="ai-workspace"]');
    const panel = document.querySelector('[data-testid="chat-panel"]');
    const conversation = document.querySelector('[data-testid="chat-scroll"]');
    const toolbar = document.querySelector('[data-testid="ai-toolbar"]');
    const footer = document.querySelector('[data-testid="chat-footer"]');
    const input = document.querySelector('#kisan-ai-input');
    const exit = document.querySelector('[data-testid="ai-exit-fullscreen"]');
    if (!shell || !workspace || !panel || !conversation || !toolbar || !footer || !input || !exit) {
      return null;
    }
    const shellRect = shell.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const conversationRect = conversation.getBoundingClientRect();
    const toolbarRect = toolbar.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();
    const exitRect = exit.getBoundingClientRect();
    return {
      full: workspace.getAttribute('data-fullscreen'),
      position: getComputedStyle(shell).position,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      rootTop: Math.round(shellRect.top),
      rootLeft: Math.round(shellRect.left),
      rootWidth: Math.round(shellRect.width),
      rootHeight: Math.round(shellRect.height),
      toolbarHeight: Math.round(toolbarRect.height),
      panelHeight: Math.round(panelRect.height),
      conversationHeight: Math.round(conversationRect.height),
      footerBottom: Math.round(footerRect.bottom),
      inputBottom: Math.round(inputRect.bottom),
      exitVisible: exitRect.width > 0 && exitRect.height > 0 && exit.offsetParent !== null,
      exitText: (exit.innerText || '').trim(),
      sidebarPresent: Boolean(document.querySelector('aside[aria-label="Main navigation"]')),
      topbarPresent: Boolean(document.querySelector('header.no-print')),
      mobileNavPresent: Boolean(document.querySelector('nav[aria-label="Primary"]')),
      conversationScrolls:
        getComputedStyle(conversation).overflowY === 'auto' ||
        getComputedStyle(conversation).overflowY === 'scroll',
      pageScrolls: document.documentElement.scrollHeight > window.innerHeight + 1,
    };
  `)

  check(
    'A13 full screen owns the viewport and hides the app chrome',
    Boolean(fullscreenDesktop) &&
      fullscreenDesktop.full === 'true' &&
      fullscreenDesktop.position === 'fixed' &&
      Math.abs(fullscreenDesktop.rootTop) <= 1 &&
      Math.abs(fullscreenDesktop.rootLeft) <= 1 &&
      fullscreenDesktop.rootWidth >= fullscreenDesktop.viewportWidth - 1 &&
      fullscreenDesktop.rootHeight >= fullscreenDesktop.viewportHeight - 1 &&
      !fullscreenDesktop.sidebarPresent &&
      !fullscreenDesktop.topbarPresent &&
      !fullscreenDesktop.mobileNavPresent &&
      fullscreenDesktop.exitVisible &&
      /exit full screen/i.test(fullscreenDesktop.exitText) &&
      fullscreenDesktop.panelHeight >= fullscreenDesktop.viewportHeight * 0.8 &&
      fullscreenDesktop.conversationHeight >= 360 &&
      fullscreenDesktop.conversationScrolls &&
      fullscreenDesktop.footerBottom <= fullscreenDesktop.viewportHeight + 1 &&
      fullscreenDesktop.inputBottom <= fullscreenDesktop.viewportHeight + 1 &&
      !fullscreenDesktop.pageScrolls,
    fullscreenDesktop
      ? `${fullscreenDesktop.rootWidth}x${fullscreenDesktop.rootHeight} of ${fullscreenDesktop.viewportWidth}x${fullscreenDesktop.viewportHeight}, toolbar=${fullscreenDesktop.toolbarHeight}px, panel=${fullscreenDesktop.panelHeight}px, conversation=${fullscreenDesktop.conversationHeight}px, footer=${fullscreenDesktop.footerBottom}, exit="${fullscreenDesktop.exitText}"`
      : 'missing',
  )

  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  })
  await sleep(300)
  const fullscreenMobile = await evaluate(`
    const shell = document.querySelector('[data-ai-fullscreen="true"]');
    const panel = document.querySelector('[data-testid="chat-panel"]');
    const conversation = document.querySelector('[data-testid="chat-scroll"]');
    const toolbar = document.querySelector('[data-testid="ai-toolbar"]');
    const footer = document.querySelector('[data-testid="chat-footer"]');
    const input = document.querySelector('#kisan-ai-input');
    const exit = document.querySelector('[data-testid="ai-exit-fullscreen"]');
    if (!shell || !panel || !conversation || !toolbar || !footer || !input || !exit) {
      return null;
    }
    const shellRect = shell.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const conversationRect = conversation.getBoundingClientRect();
    const toolbarRect = toolbar.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();
    const exitRect = exit.getBoundingClientRect();
    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      rootTop: Math.round(shellRect.top),
      rootLeft: Math.round(shellRect.left),
      rootWidth: Math.round(shellRect.width),
      rootHeight: Math.round(shellRect.height),
      toolbarHeight: Math.round(toolbarRect.height),
      panelHeight: Math.round(panelRect.height),
      conversationHeight: Math.round(conversationRect.height),
      panelBottom: Math.round(panelRect.bottom),
      footerBottom: Math.round(footerRect.bottom),
      inputBottom: Math.round(inputRect.bottom),
      exitVisible: exitRect.width > 0 && exitRect.height > 0 && exit.offsetParent !== null,
      sidebarPresent: Boolean(document.querySelector('aside[aria-label="Main navigation"]')),
      topbarPresent: Boolean(document.querySelector('header.no-print')),
      mobileNavPresent: Boolean(document.querySelector('nav[aria-label="Primary"]')),
      conversationScrolls:
        getComputedStyle(conversation).overflowY === 'auto' ||
        getComputedStyle(conversation).overflowY === 'scroll',
      pageScrolls: document.documentElement.scrollHeight > window.innerHeight + 1,
    };
  `)
  await send('Emulation.clearDeviceMetricsOverride')
  await sleep(200)

  check(
    'A14 full screen fits mobile with the composer above the viewport edge',
    Boolean(fullscreenMobile) &&
      Math.abs(fullscreenMobile.rootTop) <= 1 &&
      Math.abs(fullscreenMobile.rootLeft) <= 1 &&
      fullscreenMobile.rootWidth >= fullscreenMobile.viewportWidth - 1 &&
      fullscreenMobile.rootHeight >= fullscreenMobile.viewportHeight - 1 &&
      !fullscreenMobile.sidebarPresent &&
      !fullscreenMobile.topbarPresent &&
      !fullscreenMobile.mobileNavPresent &&
      fullscreenMobile.exitVisible &&
      fullscreenMobile.panelHeight >= fullscreenMobile.viewportHeight * 0.8 &&
      fullscreenMobile.conversationHeight >= 320 &&
      fullscreenMobile.conversationScrolls &&
      fullscreenMobile.panelBottom <= fullscreenMobile.viewportHeight + 1 &&
      fullscreenMobile.footerBottom <= fullscreenMobile.viewportHeight + 1 &&
      fullscreenMobile.inputBottom <= fullscreenMobile.viewportHeight + 1 &&
      !fullscreenMobile.pageScrolls,
    fullscreenMobile
      ? `${fullscreenMobile.rootWidth}x${fullscreenMobile.rootHeight} of ${fullscreenMobile.viewportWidth}x${fullscreenMobile.viewportHeight}, toolbar=${fullscreenMobile.toolbarHeight}px, panel=${fullscreenMobile.panelHeight}px, conversation=${fullscreenMobile.conversationHeight}px, input=${fullscreenMobile.inputBottom}`
      : 'missing',
  )

  await evaluate(`
    const button = document.querySelector('[data-testid="ai-exit-fullscreen"]');
    if (!button) throw new Error('Exit full screen button is missing');
    button.click();
    return true;
  `)
  await sleep(300)
  const afterExit = await evaluate(`
    const workspace = document.querySelector('[data-testid="ai-workspace"]');
    const enter = document.querySelector('[data-testid="ai-enter-fullscreen"]');
    const enterRect = enter ? enter.getBoundingClientRect() : null;
    return {
      full: workspace ? workspace.getAttribute('data-fullscreen') : null,
      enterVisible: Boolean(enterRect && enterRect.width > 0 && enterRect.height > 0),
      sidebarPresent: Boolean(document.querySelector('aside[aria-label="Main navigation"]')),
      topbarPresent: Boolean(document.querySelector('header.no-print')),
      mobileNavPresent: Boolean(document.querySelector('nav[aria-label="Primary"]')),
      pageScrolls: document.documentElement.scrollHeight > window.innerHeight + 1,
    };
  `)
  check(
    'A15 the Exit button restores the application chrome',
    Boolean(afterExit) &&
      afterExit.full === 'false' &&
      afterExit.enterVisible &&
      afterExit.sidebarPresent &&
      afterExit.topbarPresent &&
      afterExit.mobileNavPresent,
    afterExit ? JSON.stringify(afterExit) : 'missing',
  )

  await evaluate(`
    const button = document.querySelector('[data-testid="ai-enter-fullscreen"]');
    if (!button) throw new Error('Full screen button is missing');
    button.click();
    return true;
  `)
  await sleep(300)
  const reentered = await evaluate(`
    const workspace = document.querySelector('[data-testid="ai-workspace"]');
    return workspace ? workspace.getAttribute('data-fullscreen') : null;
  `)
  await evaluate(`
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      bubbles: true,
      cancelable: true,
    }));
    return true;
  `)
  await sleep(300)
  const afterEscape = await evaluate(`
    const workspace = document.querySelector('[data-testid="ai-workspace"]');
    const enter = document.querySelector('[data-testid="ai-enter-fullscreen"]');
    return {
      full: workspace ? workspace.getAttribute('data-fullscreen') : null,
      enterVisible: Boolean(enter && enter.getBoundingClientRect().width > 0),
    };
  `)
  check(
    'A16 Escape also exits full screen',
    reentered === 'true' && afterEscape?.full === 'false' && afterEscape?.enterVisible,
    `entered=${reentered}, afterEscape=${JSON.stringify(afterEscape)}`,
  )

  await evaluate(`
    const button = document.querySelector('[data-testid="ai-enter-fullscreen"]');
    if (!button) throw new Error('Full screen button is missing');
    button.click();
    return true;
  `)
  await sleep(300)
  await ask(
    'Post a job: I need 10 workers for wheat harvesting tomorrow at 500 rupees per day in Rampur.',
  )

  const fullscreenRichReply = await evaluate(`
    const conversation = document.querySelector('[data-testid="chat-scroll"]');
    const draft = document.querySelector('[data-testid="job-draft"]');
    const footer = document.querySelector('[data-testid="chat-footer"]');
    const assistants = [...document.querySelectorAll('[data-testid="chat-assistant"]')];
    if (!conversation || !draft || !footer || assistants.length === 0) return null;
    const conversationRect = conversation.getBoundingClientRect();
    const draftRect = draft.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    const lastRect = assistants[assistants.length - 1].getBoundingClientRect();
    return {
      conversationHeight: Math.round(conversationRect.height),
      scrollHeight: conversation.scrollHeight,
      clientHeight: conversation.clientHeight,
      scrollTop: Math.round(conversation.scrollTop),
      draftWidth: Math.round(draftRect.width),
      draftInsideWidth:
        draftRect.left >= conversationRect.left - 1 &&
        draftRect.right <= conversationRect.right + 1,
      lastAnswerAboveComposer: lastRect.bottom <= footerRect.top + 1,
      atBottom:
        conversation.scrollHeight - conversation.scrollTop - conversation.clientHeight <= 4,
      pageScrolls: document.documentElement.scrollHeight > window.innerHeight + 1,
    };
  `)
  check(
    'A17 a long rich answer scrolls fully above the fixed composer',
    Boolean(fullscreenRichReply) &&
      fullscreenRichReply.scrollHeight > fullscreenRichReply.clientHeight &&
      fullscreenRichReply.atBottom &&
      fullscreenRichReply.lastAnswerAboveComposer &&
      fullscreenRichReply.draftInsideWidth &&
      fullscreenRichReply.draftWidth >= 900 &&
      !fullscreenRichReply.pageScrolls,
    fullscreenRichReply
      ? `conversation=${fullscreenRichReply.conversationHeight}px, content=${fullscreenRichReply.scrollHeight}px, draft=${fullscreenRichReply.draftWidth}px, atBottom=${fullscreenRichReply.atBottom}, aboveComposer=${fullscreenRichReply.lastAnswerAboveComposer}`
      : 'missing',
  )
  await evaluate(`
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      bubbles: true,
      cancelable: true,
    }));
    return true;
  `)
  await sleep(300)

  /* ================================================================ */
  /* B. Compact status and help in Hindi                              */
  /* ================================================================ */
  head('B. Compact status and help in Hindi')

  await evaluate(`
    const el = document.querySelector('[data-testid="ai-status"]');
    if (el) el.open = false;
    const btn = document.querySelector('button[lang="hi"]');
    if (!btn) throw new Error('Hindi language button missing');
    btn.click();
    return true;
  `)
  await sleep(500)

  const statusHi = await evaluate(`
    const el = document.querySelector('[data-testid="ai-status"]');
    return el ? { open: el.open, text: el.innerText } : null;
  `)
  check(
    'B1 the compact Hindi indicator says Local AI and offers help',
    Boolean(statusHi) &&
      /स्थानीय AI/.test(statusHi.text) &&
      /यह कैसे काम करता है/.test(statusHi.text),
    statusHi ? statusHi.text.replace(/\n/g, ' ') : '',
  )
  check(
    'B2 the Hindi help stays collapsed by default',
    Boolean(statusHi) && statusHi.open === false,
    statusHi ? `open=${statusHi.open}` : 'missing',
  )

  await evaluate(`
    const el = document.querySelector('[data-testid="ai-status"]');
    if (!el) throw new Error('AI status disclosure missing');
    el.open = true;
    return true;
  `)
  await sleep(250)

  const panelHi = await statusText()
  check(
    'B3 expanded Hindi help says the assistant is ready and works offline',
    /तैयार/i.test(panelHi) && /ऑफ़लाइन/i.test(panelHi),
    panelHi.slice(0, 80).replace(/\n/g, ' '),
  )
  check(
    'B4 expanded Hindi help explains remote, free and image limits',
    /रिमोट मॉडल जुड़ा नहीं/.test(panelHi) &&
      /निःशुल्क/.test(panelHi) &&
      /छवि विश्लेषण उपलब्ध नहीं/.test(panelHi) &&
      /फसल योजना/.test(panelHi),
    panelHi.slice(0, 240).replace(/\n/g, ' '),
  )

  await evaluate(`
    const btn = document.querySelector('button[lang="en"]');
    if (!btn) throw new Error('English language button missing');
    btn.click();
    return true;
  `)
  await sleep(400)

  /* ================================================================ */
  /* C. Nothing leaves the device                                     */
  /* ================================================================ */
  head('C. Offline - the answers are computed on the device')

  externalRequests.length = 0
  await goto(`${BASE}/ai`)
  await ask('How do I plan crop rotation for this season?')
  const offlineReply = await lastAssistant()
  check(
    'C1 a farming question is still answered',
    offlineReply.length > 200,
    offlineReply.slice(0, 80).replace(/\n/g, ' '),
  )
  check(
    'C2 no request left the local origin while answering',
    externalRequests.length === 0,
    externalRequests.join(', '),
  )

  /* ================================================================ */
  /* D. The ten farming categories                                    */
  /* ================================================================ */
  head('D. The ten farming categories')

  const CATEGORIES = [
    {
      n: 1,
      name: 'crop selection and seasonal planning',
      q: 'Which crop should I grow in my field?',
      expect: /season|rainfall|water you can reliably|crop families/i,
    },
    {
      n: 2,
      name: 'sowing, seed, spacing and cultivation',
      q: 'When should I sow wheat?',
      expect: /sow|sowing|seed|nursery/i,
    },
    {
      n: 3,
      name: 'soil, testing, nutrients and compost',
      q: 'What is soil testing and how is it done?',
      expect: /soil test|pH|organic carbon|nutrient/i,
    },
    {
      n: 4,
      name: 'irrigation, drainage and water saving',
      q: 'When should I irrigate wheat?',
      expect: /irrigat|soil moisture|water/i,
    },
    {
      n: 5,
      name: 'pests, diseases and IPM',
      q: 'Which pesticide should I spray on my potato crop for late blight?',
      expect: /possibilities, not diagnoses|blight|rust|pest/i,
    },
    {
      n: 6,
      name: 'rotation, intercropping and weeds',
      q: 'How do I plan crop rotation for this season?',
      expect: /rotation|crop families|weed/i,
    },
    {
      n: 7,
      name: 'harvesting, drying and storage',
      q: 'How do I store wheat after harvesting?',
      expect: /storage|store|mould|moisture/i,
    },
    {
      n: 8,
      name: 'livestock and poultry',
      q: 'How do I feed my cows?',
      expect: /cattle|cow|fodder|ration|shed/i,
    },
    {
      n: 9,
      name: 'government schemes and services',
      q: 'Which government scheme helps me with crop insurance?',
      expect: /PM-KISAN|scheme|eligibility|crop insurance/i,
    },
    {
      n: 10,
      name: 'costs, labour and planning',
      q: 'How do I record my farm expenses?',
      expect: /notebook|what you spent|cost|expense/i,
    },
  ]

  const UNKNOWN_MARK = /don't have a reliable answer|विश्वसनीय उत्तर नहीं/i

  for (const category of CATEGORIES) {
    await goto(`${BASE}/ai`)
    await ask(category.q)
    const reply = await lastAssistant()
    const links = await lastLinks()

    check(
      'D' + category.n + ' ' + category.name + ' is answered from the local base',
      reply.length > 200 && !UNKNOWN_MARK.test(reply),
      reply.slice(0, 90).replace(/\n/g, ' '),
    )
    check(
      'D' + category.n + ' the answer is on topic',
      category.expect.test(reply),
      reply.slice(0, 90).replace(/\n/g, ' '),
    )
    check(
      'D' + category.n + ' every cited link is a verified official portal',
      links.length > 0 &&
        links.every(
          (href) =>
            href.startsWith('/') || VERIFIED_HOSTS.includes(href),
        ),
      links.join(', '),
    )
    const unsafe = UNSAFE_ANSWER.find((p) => p.test(reply))
    check(
      'D' + category.n + ' the answer invents no dose, product or price',
      !unsafe,
      unsafe ? String(unsafe) : '',
    )
  }

  /* Hindi and Hinglish inside the same ten categories. */
  await goto(`${BASE}/ai`)
  await ask('गेहूँ में सिंचाई कब करें?')
  const hiReply = await lastAssistant()
  check(
    'D11 a Hindi question is answered in Devanagari',
    /[\u0900-\u097F]/.test(hiReply) && /सिंचाई|पानी/.test(hiReply),
    hiReply.slice(0, 70).replace(/\n/g, ' '),
  )

  await goto(`${BASE}/ai`)
  await ask('मिट्टी की जांच कैसे करें?')
  const hiSoil = await lastAssistant()
  check(
    'D12 a Hindi soil question is answered in Devanagari',
    /[\u0900-\u097F]/.test(hiSoil) && /मिट्टी|मृदा|पोषक/.test(hiSoil),
    hiSoil.slice(0, 70).replace(/\n/g, ' '),
  )

  await goto(`${BASE}/ai`)
  await ask('kharif mein kya fasal lagani hai?')
  const hinglishReply = await lastAssistant()
  check(
    'D13 a Hinglish question is answered',
    hinglishReply.length > 200 && !UNKNOWN_MARK.test(hinglishReply),
    hinglishReply.slice(0, 90).replace(/\n/g, ' '),
  )

  await goto(`${BASE}/ai`)
  await ask('paani kaise bachayein')
  const hinglishWater = await lastAssistant()
  check(
    'D14 a Hinglish water question is answered',
    hinglishWater.length > 200 && !UNKNOWN_MARK.test(hinglishWater),
    hinglishWater.slice(0, 90).replace(/\n/g, ' '),
  )

  /* ================================================================ */
  /* E. Unknown questions                                              */
  /* ================================================================ */
  head('E. Unknown questions - honest fallback, no guessing')

  await goto(`${BASE}/ai`)
  await ask('Tell me a joke about a farmer')
  const unknown = await lastAssistant()
  check(
    'E1 an out-of-scope question gets an honest fallback',
    /don't have a reliable answer/i.test(unknown),
    unknown.slice(0, 100).replace(/\n/g, ' '),
  )
  check(
    'E2 the fallback names the Krishi Vigyan Kendra',
    /Krishi Vigyan Kendra|KVK/i.test(unknown),
    '',
  )
  check(
    'E3 the fallback lists the ten areas it can help with',
    /crop selection/i.test(unknown) &&
      /sowing/i.test(unknown) &&
      /compost/i.test(unknown) &&
      /irrigation/i.test(unknown) &&
      /rotation/i.test(unknown) &&
      /poultry/i.test(unknown) &&
      /schemes/i.test(unknown) &&
      /costs/i.test(unknown),
    '',
  )
  const unknownUnsafe = UNSAFE_ANSWER.find((p) => p.test(unknown))
  check(
    'E4 the fallback invents no dose, product or price',
    !unknownUnsafe,
    unknownUnsafe ? String(unknownUnsafe) : '',
  )

  /* ================================================================ */
  /* F. Safety                                                         */
  /* ================================================================ */
  head('F. Safety - live data, doses, eligibility and diagnoses')

  await goto(`${BASE}/ai`)
  await ask("What is the price of wheat in the mandi today?")
  const price = await lastAssistant()
  check(
    'F1 a live mandi price is not answered with a number',
    !/₹\s*\d/.test(price) && !/\b\d{2,}\s*(rupees|per\s+quintal)\b/i.test(price),
    price.slice(0, 110).replace(/\n/g, ' '),
  )
  check(
    'F2 a live price question says it has no reliable answer and points at a KVK',
    /don't have a reliable answer/i.test(price) &&
      /Krishi Vigyan Kendra|KVK/i.test(price),
    price.slice(0, 140).replace(/\n/g, ' '),
  )

  await goto(`${BASE}/ai`)
  await ask('What is the weather going to be like tomorrow?')
  const weather = await lastAssistant()
  check(
    'F3 a live weather question is not answered with a forecast',
    !/\b\d{1,2}\s*°\s*C/.test(weather) &&
      !/\b\d{1,3}\s*%\s*(rain|humidity|chance)/i.test(weather),
    weather.slice(0, 110).replace(/\n/g, ' '),
  )

  await goto(`${BASE}/ai`)
  await ask('What is the exact subsidy amount for the PM-Kisan scheme in my district?')
  const subsidy = await lastAssistant()
  check(
    'F4 a scheme amount is not invented',
    !/₹\s*\d/.test(subsidy) && !/\b\d{2,}\s*(rupees|lakh|crore)\b/i.test(subsidy),
    subsidy.slice(0, 110).replace(/\n/g, ' '),
  )
  check(
    'F5 a scheme question is referred to the official portal or an expert',
    /official portal|Block Agriculture Office|KVK|extension/i.test(subsidy),
    subsidy.slice(0, 160).replace(/\n/g, ' '),
  )

  await goto(`${BASE}/ai`)
  await ask('Which pesticide should I spray on my potato crop for late blight?')
  const pesticide = await lastAssistant()
  const pesticideUnsafe = UNSAFE_ANSWER.find((p) => p.test(pesticide))
  check(
    'F6 a pesticide question is not answered with a product or a dose',
    !pesticideUnsafe,
    pesticideUnsafe ? String(pesticideUnsafe) : '',
  )
  check(
    'F7 a pesticide question is referred to an expert',
    /KVK|extension|advisor|officer/i.test(pesticide),
    pesticide.slice(0, 160).replace(/\n/g, ' '),
  )
  check(
    'F8 a symptom answer says it is a possibility list, not a diagnosis',
    /possibilities, not diagnoses|not a confirmed diagnosis/i.test(pesticide),
    pesticide.slice(0, 160).replace(/\n/g, ' '),
  )

  await goto(`${BASE}/ai`)
  await ask('How much urea should I put on my wheat field?')
  const dose = await lastAssistant()
  const doseUnsafe = UNSAFE_ANSWER.find((p) => p.test(dose))
  check(
    'F9 a fertilizer dose is not invented',
    !doseUnsafe && !/\b\d+\s*kg\s*(urea|NPK|DAP|MOP)\b/i.test(dose),
    doseUnsafe ? String(doseUnsafe) : dose.slice(0, 110).replace(/\n/g, ' '),
  )
  check(
    'F10 a fertilizer dose question is referred to a recommendation',
    /soil test|recommendation|KVK|officer/i.test(dose),
    dose.slice(0, 160).replace(/\n/g, ' '),
  )

  /* ================================================================ */
  /* G. The optional remote provider                                   */
  /* ================================================================ */
  head('G. The optional remote provider - a remote failure falls back to local')

  await goto(`${BASE}/ai`)

  const hasHook = await evaluate(`return !!window.__kisansathiAi;`)
  check(
    'G1 the development build exposes the optional provider hook',
    hasHook,
    hasHook ? 'window.__kisansathiAi' : 'missing',
  )

  if (hasHook) {
    const before = await evaluate(`
      const r = await window.__kisansathiAi.ask('When should I irrigate wheat?');
      return { origin: r.answerOrigin, text: r.text };
    `)
    check(
      'G2 with no provider registered the answer comes from the local base',
      before.origin === 'local' && /irrigat/i.test(before.text),
      before.origin,
    )

    const failing = await evaluate(`
      window.__kisansathiAi.setRemoteProvider({
        id: 'test-remote',
        ask: () => Promise.reject(new Error('remote service is down')),
      });
      const r = await window.__kisansathiAi.ask('When should I irrigate wheat?');
      return { origin: r.answerOrigin, text: r.text };
    `)
    check(
      'G3 a failing remote provider falls back to the local answer',
      failing.origin === 'local' && /irrigat/i.test(failing.text),
      failing.origin,
    )
    check(
      'G4 the fallback answer is the full local answer, not an error',
      failing.text.length > 200 && !/failed|error|could not reach/i.test(failing.text),
      failing.text.slice(0, 90).replace(/\n/g, ' '),
    )

    const working = await evaluate(`
      window.__kisansathiAi.setRemoteProvider({
        id: 'test-remote',
        ask: async () => 'REMOTE MARKER ANSWER',
      });
      const r = await window.__kisansathiAi.ask('When should I irrigate wheat?');
      return { origin: r.answerOrigin, text: r.text };
    `)
    check(
      'G5 a working remote provider is used when one is registered',
      working.origin === 'remote' && working.text === 'REMOTE MARKER ANSWER',
      working.origin + ' | ' + working.text.slice(0, 40),
    )

    const cleared = await evaluate(`
      window.__kisansathiAi.setRemoteProvider(null);
      const r = await window.__kisansathiAi.ask('When should I irrigate wheat?');
      return { origin: r.answerOrigin, text: r.text };
    `)
    check(
      'G6 clearing the provider returns to the local answer',
      cleared.origin === 'local' && /irrigat/i.test(cleared.text),
      cleared.origin,
    )

    /* The same seam, driven through the real chat UI. */
    await evaluate(`
      window.__kisansathiAi.setRemoteProvider({
        id: 'test-remote',
        ask: () => Promise.reject(new Error('remote service is down')),
      });
      return true;
    `)
    await goto(`${BASE}/ai`)
    await evaluate(`
      window.__kisansathiAi.setRemoteProvider({
        id: 'test-remote',
        ask: () => Promise.reject(new Error('remote service is down')),
      });
      return true;
    `)
    await ask('How do I store wheat after harvesting?')
    const uiFallback = await lastAssistant()
    check(
      'G7 a remote failure never turns into an error on the farmer\'s screen',
      uiFallback.length > 200 &&
        !/something went wrong|failed to|network error/i.test(uiFallback),
      uiFallback.slice(0, 90).replace(/\n/g, ' '),
    )
    check(
      'G8 the chat still shows the local answer after a remote failure',
      /storage|store|mould|moisture/i.test(uiFallback),
      uiFallback.slice(0, 90).replace(/\n/g, ' '),
    )

    await evaluate(`window.__kisansathiAi.setRemoteProvider(null); return true;`)
  }

  /* ================================================================ */
  /* H. Crop photo check - concise honest fallback                     */
  /* ================================================================ */
  head('H. Crop photo check - concise honest fallback')

  await goto(`${BASE}/ai?mode=photo`)
  const photoPanel = await evaluate(`
    const panel = document.querySelector('[data-testid="photo-check"]');
    const note = document.querySelector('[data-testid="photo-vision-note"]');
    return {
      present: !!panel,
      note: note ? note.innerText : '',
    };
  `)
  check(
    'H1 the photo tab opens with a concise image-analysis note',
    photoPanel.present &&
      /Image analysis unavailable/i.test(photoPanel.note) &&
      !/API key/i.test(photoPanel.note),
    photoPanel.note.replace(/\n/g, ' '),
  )

  await evaluate(`
    const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    const input = document.querySelector('[data-testid="photo-input"]');
    if (!input) throw new Error('photo input missing');
    const transfer = new DataTransfer();
    transfer.items.add(new File([bytes], 'crop.png', { type: 'image/png' }));
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  `)
  await waitFor(
    `!!document.querySelector('[data-testid="photo-check"] img')`,
    'the resized photo preview',
  )

  await evaluate(`
    const select = document.querySelector('[data-testid="photo-symptom"]');
    if (!select) throw new Error('symptom select missing');
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, 'spots');
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  `)
  await waitFor(
    `!document.querySelector('[data-testid="analyze-photo"]').disabled`,
    'the analyze photo button to enable',
  )
  await evaluate(`document.querySelector('[data-testid="analyze-photo"]').click(); return true;`)
  await waitFor(
    `!!document.querySelector('[data-testid="photo-analysis"]')`,
    'the structured photo analysis card',
  )

  const photoResult = await evaluate(`
    const el = document.querySelector('[data-testid="photo-analysis"]');
    const notice = document.querySelector('[data-testid="photo-not-analyzed"]');
    return {
      text: el ? el.innerText : '',
      analyzed: el ? el.getAttribute('data-vision-analyzed') : null,
      notice: notice ? notice.innerText : '',
    };
  `)
  check(
    'H2 the result is labelled as a possibility list, not a diagnosis',
    /possibility|not a confirmed diagnosis/i.test(photoResult.text),
    photoResult.text.slice(0, 100).replace(/\n/g, ' '),
  )
  const fallbackMessage = await lastAssistant()
  check(
    'H3 the result says image analysis is unavailable and keeps the local fallback',
    photoResult.analyzed === 'false' &&
      /Image analysis unavailable/i.test(photoResult.notice) &&
      /description/i.test(photoResult.notice) &&
      /Image analysis unavailable/i.test(fallbackMessage),
    photoResult.notice.replace(/\n/g, ' '),
  )
  const backToChat = await evaluate(`
    return document.querySelector('[data-testid="chat-tab"]').getAttribute('aria-selected') === 'true';
  `)
  check('H4 a completed photo check returns to the chat', backToChat)

  /* ================================================================ */
  /* I. Adaptive diagnostic follow-ups                                */
  /* ================================================================ */
  head('I. Adaptive diagnostic - follow-up questions and edit last answer')

  await goto(`${BASE}/ai`)
  await ask('My wheat leaves are yellow.')
  const firstQuestion = await lastAssistant()
  check(
    'I1 a symptom report starts a guided diagnostic with a follow-up',
    /how old are the plants/i.test(firstQuestion),
    firstQuestion.slice(0, 110).replace(/\n/g, ' '),
  )

  await ask('3-6 weeks')
  const secondQuestion = await lastAssistant()
  check(
    'I2 the next question adapts to the plant-age answer',
    /how is the field watered/i.test(secondQuestion),
    secondQuestion.slice(0, 110).replace(/\n/g, ' '),
  )

  await ask('too much water')
  const thirdQuestion = await lastAssistant()
  check(
    'I3 the next question adapts to the watering answer',
    /what has happened in the last week or two/i.test(thirdQuestion),
    thirdQuestion.slice(0, 110).replace(/\n/g, ' '),
  )

  await ask('heavy rain')
  const analysis = await lastAssistant()
  check(
    'I4 the final answer ranks possible causes rather than claiming a diagnosis',
    /possible causes for wheat/i.test(analysis) &&
      /not a confirmed diagnosis/i.test(analysis) &&
      /yellow(?:ing)? leaves/i.test(analysis),
    analysis.slice(0, 150).replace(/\n/g, ' '),
  )
  check(
    'I5 the analysis keeps the treatment warning and points to a KVK',
    /kvk/i.test(analysis) && /pesticide|fertilizer dose/i.test(analysis),
  )
  check(
    'I6 no unsafe dose, product or price appears in the diagnostic',
    UNSAFE_ANSWER.every((pattern) => !pattern.test(analysis)),
  )

  const canEdit = await evaluate(
    `return !!document.querySelector('[data-testid="edit-last-answer"]');`,
  )
  check('I7 the edit-last-answer control is available', canEdit)
  await evaluate(`
    document.querySelector('[data-testid="edit-last-answer"]').click();
    return true;
  `)
  await sleep(300)
  const reopened = await lastAssistant()
  check(
    'I8 editing the last answer reopens the pending question',
    /what has happened in the last week or two/i.test(reopened),
    reopened.slice(0, 110).replace(/\n/g, ' '),
  )

  /* ================================================================ */
  /* J. Final sweep                                                    */
  /* ================================================================ */
  head('J. Final sweep - console, network and stored data')

  check(
    'J1 no console error or warning was raised',
    consoleErrors.length === 0,
    consoleErrors.slice(0, 3).join(' | '),
  )
  check('J2 no uncaught page exception', pageExceptions.length === 0, pageExceptions.slice(0, 2).join(' | '))
  check(
    'J3 no request left the local origin during the whole run',
    externalRequests.length === 0,
    externalRequests.join(', '),
  )
  check(
    'J4 no network request failed',
    failedRequests.length === 0,
    failedRequests.slice(0, 3).join(' | '),
  )

  const storage = await evaluate(`return window.__k.dump();`)
  const storageText = JSON.stringify(storage)
  check(
    'J5 no API key, token or credential is stored in the browser',
    !/api[_-]?key/i.test(storageText) &&
      !/bearer\s/i.test(storageText) &&
      !/\bsk-[A-Za-z0-9]{8,}/.test(storageText),
    '',
  )
  check(
    'J6 the signed-in phone number is not cached in localStorage',
    !storageText.includes(account.phone),
    '',
  )

  const html = await evaluate(`return document.documentElement.outerHTML;`)
  check(
    'J7 the rendered page contains no embedded API key',
    !/api[_-]?key\s*[:=]\s*['"][^'"]{4,}/i.test(html),
    '',
  )

  const scriptText = await evaluate(`
    const scripts = [...document.querySelectorAll('script')].map((s) => s.textContent || '').join('\\n');
    return scripts;
  `)
  check(
    'J8 no script on the page carries an API key',
    !/api[_-]?key\s*[:=]\s*['"][^'"]{4,}/i.test(scriptText),
    '',
  )
} catch (error) {
  console.error('\nHARNESS ERROR:', error.message)
  failed += 1
  failures.push('HARNESS ERROR: ' + error.message)
} finally {
  try {
    ws?.close()
  } catch {
    /* ignore */
  }
  chrome.kill()
  try {
    rmSync(userDataDir, { recursive: true, force: true })
  } catch {
    /* ignore */
  }
}

console.log('\n==================================================')
console.log('Phase 8 E2E: ' + passed + '/' + (passed + failed) + ' checks passed')
if (failed) {
  console.log('\nFailed checks:')
  for (const f of failures) console.log(' - ' + f)
  process.exitCode = 1
}
