import { createRequire } from 'module'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const puppeteer = require('../frontend/node_modules/puppeteer')

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'demo', 'screenshots')
mkdirSync(OUT, { recursive: true })

const BASE = 'http://localhost:3000'
const API  = 'http://localhost:8000'

const delay = ms => new Promise(r => setTimeout(r, ms))

async function injectAuth(page) {
  // Try real login first
  try {
    const res = await page.evaluate(async (apiUrl) => {
      const r = await fetch(`${apiUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'screenshot@wateros.ai', username: 'screenshotbot', password: 'scr33nsh0t', full_name: 'Screenshot Bot' }),
      })
      if (r.ok) return r.json()
      // Try login if already exists
      const r2 = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'screenshot@wateros.ai', password: 'scr33nsh0t' }),
      })
      return r2.ok ? r2.json() : null
    }, API)

    if (res?.access_token) {
      await page.evaluate((tok) => {
        localStorage.setItem('access_token', tok)
        localStorage.setItem('wateros-auth', JSON.stringify({
          state: { user: { id: 1, email: 'screenshot@wateros.ai', username: 'screenshotbot', role: 'admin' }, accessToken: tok, isAuthenticated: true, isLoading: false },
          version: 0,
        }))
      }, res.access_token)
      console.log('  ✓ Authenticated with real token')
      return
    }
  } catch {}

  // Fallback: mock auth
  await page.evaluate(() => {
    localStorage.setItem('access_token', 'mock-token')
    localStorage.setItem('wateros-auth', JSON.stringify({
      state: { user: { id: 1, email: 'admin@wateros.ai', username: 'admin', role: 'admin' }, accessToken: 'mock-token', isAuthenticated: true, isLoading: false },
      version: 0,
    }))
  })
  console.log('  ✓ Injected mock auth state')
}

async function goto(page, path, waitMs = 3000) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 25000 })
  await delay(waitMs)
}

async function shot(page, name) {
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: false })
  console.log(`  ✓ ${name}.png`)
}

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
    defaultViewport: { width: 1440, height: 900 },
  })

  const page = await browser.newPage()

  // ── 01 Login page ─────────────────────────────────────────────────────────
  console.log('\n[01] Login page')
  await goto(page, '/login', 1500)
  await shot(page, '01-login')

  // Inject auth for all subsequent pages
  await injectAuth(page)

  // ── 02 Dashboard ──────────────────────────────────────────────────────────
  console.log('\n[02] Dashboard')
  await goto(page, '/dashboard', 4000)
  await shot(page, '02-dashboard')

  // ── 03 Global ─────────────────────────────────────────────────────────────
  console.log('\n[03] Global intelligence')
  await goto(page, '/global', 3000)
  await shot(page, '03-global')

  // ── 04 Countries (base) ───────────────────────────────────────────────────
  console.log('\n[04] Countries page')
  await goto(page, '/countries', 3000)
  await shot(page, '04-countries')

  // ── 04b Countries + AI Insights (click India) ─────────────────────────────
  console.log('\n[04b] Countries — AI Insights (India selected)')
  try {
    // Click the first table row (should be a country)
    const rows = await page.$$('tbody tr, [data-row], tr.cursor-pointer')
    if (rows.length > 0) {
      await rows[0].click()
      await delay(1800)
      await shot(page, '04b-countries-ai-insights')
    } else {
      // Try clicking any clickable row-like element
      await page.evaluate(() => {
        const el = document.querySelector('tbody tr')
        if (el) el.click()
      })
      await delay(1800)
      await shot(page, '04b-countries-ai-insights')
    }
  } catch (e) {
    console.log(`  ⚠ Click failed: ${e.message}`)
    await shot(page, '04b-countries-ai-insights')
  }

  // ── 05 States ─────────────────────────────────────────────────────────────
  console.log('\n[05] States page')
  await goto(page, '/states', 2500)
  await shot(page, '05-states')

  // ── 06 Cities ─────────────────────────────────────────────────────────────
  console.log('\n[06] Cities page')
  await goto(page, '/cities', 3000)
  await shot(page, '06-cities')

  // ── 06b Cities + AI Insights ──────────────────────────────────────────────
  console.log('\n[06b] Cities — AI Insights (city selected)')
  try {
    await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="cursor-pointer"], [class*="GlassCard"]')
      if (cards.length > 1) cards[1].click()
    })
    await delay(1800)
    await shot(page, '06b-cities-ai-insights')
  } catch { await shot(page, '06b-cities-ai-insights') }

  // ── 07 Sensors ────────────────────────────────────────────────────────────
  console.log('\n[07] Sensors page')
  await goto(page, '/sensors', 3000)
  await shot(page, '07-sensors')

  // ── 08 Rivers ─────────────────────────────────────────────────────────────
  console.log('\n[08] Rivers page')
  await goto(page, '/rivers', 2500)
  await shot(page, '08-rivers')

  // ── 08b Rivers + AI Insights ──────────────────────────────────────────────
  console.log('\n[08b] Rivers — AI Insights (river selected)')
  try {
    await page.evaluate(() => {
      const row = document.querySelector('tbody tr')
      if (row) row.click()
    })
    await delay(1800)
    await shot(page, '08b-rivers-ai-insights')
  } catch { await shot(page, '08b-rivers-ai-insights') }

  // ── 09 Pipelines ──────────────────────────────────────────────────────────
  console.log('\n[09] Pipelines page')
  await goto(page, '/pipelines', 2500)
  await shot(page, '09-pipelines')

  // ── 10 Water Quality ──────────────────────────────────────────────────────
  console.log('\n[10] Water Quality page')
  await goto(page, '/water-quality', 2500)
  await shot(page, '10-water-quality')

  // ── 11 Climate ────────────────────────────────────────────────────────────
  console.log('\n[11] Climate page')
  await goto(page, '/climate', 2500)
  await shot(page, '11-climate')

  // ── 12 Forecast ───────────────────────────────────────────────────────────
  console.log('\n[12] Forecast page')
  await goto(page, '/forecast', 2500)
  await shot(page, '12-forecast')

  // ── 13 Agent Console (base view) ─────────────────────────────────────────
  console.log('\n[13] Agent Console — base view')
  await goto(page, '/agents', 4000)
  await shot(page, '13-agents-overview')

  // ── 13b Agent Console — set geo context ───────────────────────────────────
  console.log('\n[13b] Agent Console — geographic context selected')
  try {
    // Select India from the country dropdown
    await page.select('select', 'India')
    await delay(800)
    // Select state
    const selects = await page.$$('select')
    if (selects.length >= 2) {
      await selects[1].select('Assam')
      await delay(600)
    }
    await shot(page, '13b-agents-geo-context')
  } catch (e) {
    console.log(`  ⚠ Geo select: ${e.message}`)
    await shot(page, '13b-agents-geo-context')
  }

  // ── 13c Agent Console — click Run on first agent (Flood Agent) ────────────
  console.log('\n[13c] Agent Console — Flood Agent running (live trace)')
  try {
    // Click the first Run button
    const runBtns = await page.$$('button')
    let runBtn = null
    for (const btn of runBtns) {
      const txt = await page.evaluate(el => el.textContent?.trim(), btn)
      if (txt === 'Run') { runBtn = btn; break }
    }
    if (runBtn) {
      await runBtn.click()
      await delay(1200) // Capture mid-execution with live trace visible
      await shot(page, '13c-agents-live-trace')
      await delay(3000) // Wait for completion
      await shot(page, '13d-agents-result')
    } else {
      await shot(page, '13c-agents-live-trace')
      await shot(page, '13d-agents-result')
    }
  } catch (e) {
    console.log(`  ⚠ Run agent: ${e.message}`)
    await shot(page, '13c-agents-live-trace')
  }

  // ── 13e Agent Console — expand result card ────────────────────────────────
  console.log('\n[13e] Agent Console — reasoning chain expanded')
  try {
    const expandBtns = await page.$$('button')
    for (const btn of expandBtns) {
      const txt = await page.evaluate(el => el.textContent?.trim(), btn)
      if (txt?.includes('reasoning') || txt?.includes('View')) {
        await btn.click()
        await delay(800)
        break
      }
    }
    await shot(page, '13e-agents-reasoning-chain')
  } catch { await shot(page, '13e-agents-reasoning-chain') }

  // ── 13f Observability Tab ────────────────────────────────────────────────
  console.log('\n[13f] Agent Console — Observability tab')
  try {
    const tabBtns = await page.$$('button')
    for (const btn of tabBtns) {
      const txt = await page.evaluate(el => el.textContent?.trim(), btn)
      if (txt?.includes('Observability')) {
        await btn.click()
        await delay(1500)
        break
      }
    }
    await shot(page, '13f-agents-observability')
  } catch { await shot(page, '13f-agents-observability') }

  // ── 13g Run Decision Agent ────────────────────────────────────────────────
  console.log('\n[13g] Agent Console — Decision Agent A2A run')
  try {
    // Switch back to agent grid view (click Chat tab first to reset)
    const tabBtns = await page.$$('button')
    for (const btn of tabBtns) {
      const txt = await page.evaluate(el => el.textContent?.trim(), btn)
      if (txt?.includes('Chat')) { await btn.click(); break }
    }
    await delay(400)

    // Find and click Run on Decision Agent
    const allBtns = await page.$$('button')
    let decisionRunBtn = null
    for (let i = 0; i < allBtns.length; i++) {
      const txt = await page.evaluate(el => el.textContent?.trim(), allBtns[i])
      if (txt === 'Run') {
        // Check if the sibling card has "Decision" in it
        const cardText = await page.evaluate(el => {
          const card = el.closest('[class*="GlassCard"], [class*="rounded"]')
          return card?.textContent ?? ''
        }, allBtns[i])
        if (cardText.toLowerCase().includes('decision')) {
          decisionRunBtn = allBtns[i]
          break
        }
      }
    }
    if (decisionRunBtn) {
      await decisionRunBtn.click()
      await delay(1500)
      await shot(page, '13g-decision-agent-running')
      await delay(4000)
      await shot(page, '13h-decision-agent-result')
    } else {
      await shot(page, '13g-decision-agent-running')
      await shot(page, '13h-decision-agent-result')
    }
  } catch (e) {
    console.log(`  ⚠ Decision agent: ${e.message}`)
    await shot(page, '13g-decision-agent-running')
  }

  // ── 13i Chat with Decision Agent ────────────────────────────────────────
  console.log('\n[13i] Agent Console — Decision Agent chat')
  try {
    const input = await page.$('input[placeholder*="water"], input[placeholder*="Ask"]')
    if (input) {
      await input.click()
      await input.type('What is the flood risk in Assam this week?', { delay: 30 })
      await delay(300)
      await page.keyboard.press('Enter')
      await delay(2000)
      await shot(page, '13i-agents-chat')
    } else {
      await shot(page, '13i-agents-chat')
    }
  } catch { await shot(page, '13i-agents-chat') }

  // ── 14 Workflow ──────────────────────────────────────────────────────────
  console.log('\n[14] Workflow page')
  await goto(page, '/workflow', 4000)
  await shot(page, '14-workflow')

  // ── 15 Knowledge Graph ───────────────────────────────────────────────────
  console.log('\n[15] Knowledge Graph')
  await goto(page, '/knowledge-graph', 4000)
  await shot(page, '15-knowledge-graph')

  // ── 16 Digital Twin ──────────────────────────────────────────────────────
  console.log('\n[16] Digital Twin / Simulation')
  await goto(page, '/digital-twin', 3000)
  await shot(page, '16-digital-twin')

  // ── 17 Alerts ────────────────────────────────────────────────────────────
  console.log('\n[17] Alerts page')
  await goto(page, '/alerts', 2500)
  await shot(page, '17-alerts')

  // ── 18 Reports ───────────────────────────────────────────────────────────
  console.log('\n[18] Reports page')
  await goto(page, '/reports', 2500)
  await shot(page, '18-reports')

  // ── 19 Reservoirs ────────────────────────────────────────────────────────
  console.log('\n[19] Reservoirs page')
  await goto(page, '/reservoirs', 2500)
  await shot(page, '19-reservoirs')

  // ── 20 Settings ──────────────────────────────────────────────────────────
  console.log('\n[20] Settings page')
  await goto(page, '/settings', 2000)
  await shot(page, '20-settings')

  await browser.close()

  const total = 25 // approximate count
  console.log(`\n✅  Done! Screenshots saved to demo/screenshots/\n`)
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1) })
