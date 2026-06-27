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

const PAGES = [
  { path: '/dashboard',       name: '02-dashboard',      wait: 3000 },
  { path: '/global',          name: '03-global',         wait: 2500 },
  { path: '/countries',       name: '04-countries',      wait: 2500 },
  { path: '/states',          name: '05-states',         wait: 2500 },
  { path: '/cities',          name: '06-cities',         wait: 2500 },
  { path: '/sensors',         name: '07-sensors',        wait: 3000 },
  { path: '/climate',         name: '08-climate',        wait: 2500 },
  { path: '/rivers',          name: '09-rivers',         wait: 2500 },
  { path: '/water-quality',   name: '10-water-quality',  wait: 2500 },
  { path: '/agents',          name: '11-agents',         wait: 3000 },
  { path: '/workflow',        name: '12-workflow',       wait: 3000 },
  { path: '/knowledge-graph', name: '13-knowledge-graph',wait: 3000 },
  { path: '/forecast',        name: '14-forecast',       wait: 2500 },
  { path: '/alerts',          name: '15-alerts',         wait: 2500 },
  { path: '/reports',         name: '16-reports',        wait: 2500 },
]

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  })

  const page = await browser.newPage()

  // -- Step 1: Login page screenshot --
  console.log('Capturing login page...')
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2', timeout: 30000 })
  await new Promise(r => setTimeout(r, 1500))
  await page.screenshot({ path: join(OUT, '01-login.png') })
  console.log('  ✓ 01-login.png')

  // -- Step 2: Get real JWT token via API --
  console.log('Authenticating via API...')
  let token = null
  try {
    const loginRes = await page.evaluate(async (apiUrl) => {
      const r = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@wateros.ai', password: 'admin123' }),
      })
      if (!r.ok) return null
      return r.json()
    }, API)

    if (loginRes?.access_token) {
      token = loginRes.access_token
      console.log('  ✓ Got JWT token')

      // Inject token into localStorage and Zustand persist state
      await page.evaluate((tok, userData) => {
        localStorage.setItem('access_token', tok)
        localStorage.setItem('wateros-auth', JSON.stringify({
          state: { user: userData, accessToken: tok, isAuthenticated: true, isLoading: false },
          version: 0,
        }))
      }, token, loginRes.user ?? { id: 1, email: 'admin@wateros.ai', username: 'admin', role: 'admin' })
    } else {
      console.log('  ⚠ Login API failed — injecting mock auth state')
      await page.evaluate(() => {
        const mockToken = 'mock-token-for-screenshots'
        localStorage.setItem('access_token', mockToken)
        localStorage.setItem('wateros-auth', JSON.stringify({
          state: { user: { id: 1, email: 'admin@wateros.ai', username: 'admin', role: 'admin' }, accessToken: mockToken, isAuthenticated: true, isLoading: false },
          version: 0,
        }))
      })
    }
  } catch (e) {
    console.log('  ⚠ Auth error:', e.message, '— injecting mock auth state')
    await page.evaluate(() => {
      localStorage.setItem('access_token', 'mock-token')
      localStorage.setItem('wateros-auth', JSON.stringify({
        state: { user: { id: 1, email: 'admin@wateros.ai', username: 'admin', role: 'admin' }, accessToken: 'mock-token', isAuthenticated: true, isLoading: false },
        version: 0,
      }))
    })
  }

  // -- Step 3: Screenshot each page --
  for (const { path, name, wait } of PAGES) {
    try {
      console.log(`Capturing ${name}...`)
      await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
      await new Promise(r => setTimeout(r, wait))
      await page.screenshot({ path: join(OUT, `${name}.png`) })
      console.log(`  ✓ ${name}.png`)
    } catch (e) {
      console.log(`  ✗ ${name}: ${e.message}`)
    }
  }

  await browser.close()
  console.log(`\nDone! ${PAGES.length + 1} screenshots saved to demo/screenshots/`)
}

run().catch(e => { console.error(e); process.exit(1) })
