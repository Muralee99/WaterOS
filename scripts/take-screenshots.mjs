import { createRequire } from 'module'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const puppeteer = require('../frontend/node_modules/puppeteer')

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'demo', 'screenshots')
mkdirSync(OUT, { recursive: true })

const BASE = 'http://localhost:3000'

const PAGES = [
  { path: '/login',           name: '01-login',          wait: 1500 },
  { path: '/dashboard',       name: '02-dashboard',      wait: 2500 },
  { path: '/global',          name: '03-global',         wait: 2000 },
  { path: '/countries',       name: '04-countries',      wait: 2000 },
  { path: '/states',          name: '05-states',         wait: 2000 },
  { path: '/cities',          name: '06-cities',         wait: 2000 },
  { path: '/sensors',         name: '07-sensors',        wait: 2500 },
  { path: '/climate',         name: '08-climate',        wait: 2000 },
  { path: '/rivers',          name: '09-rivers',         wait: 2000 },
  { path: '/water-quality',   name: '10-water-quality',  wait: 2000 },
  { path: '/agents',          name: '11-agents',         wait: 2500 },
  { path: '/workflow',        name: '12-workflow',       wait: 2500 },
  { path: '/knowledge-graph', name: '13-knowledge-graph',wait: 2500 },
  { path: '/forecast',        name: '14-forecast',       wait: 2000 },
  { path: '/alerts',          name: '15-alerts',         wait: 2000 },
  { path: '/reports',         name: '16-reports',        wait: 2000 },
]

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  })

  const page = await browser.newPage()

  // Login page screenshot
  console.log('Capturing login page...')
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2', timeout: 30000 })
  await new Promise(r => setTimeout(r, 1500))
  await page.screenshot({ path: join(OUT, '01-login.png') })
  console.log('  ✓ 01-login.png')

  // Authenticate
  try {
    await page.type('input[type="email"]', 'admin@wateros.ai', { delay: 50 })
    await page.type('input[type="password"]', 'admin123', { delay: 50 })
    await page.click('button[type="submit"]')
    await new Promise(r => setTimeout(r, 3000))
  } catch (e) {
    console.log('  Login form error:', e.message)
  }

  // Screenshot each app page
  for (const { path, name, wait } of PAGES.slice(1)) {
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
  console.log(`\nDone! ${PAGES.length} screenshots saved to demo/screenshots/`)
  console.log('To create GIF: use https://ezgif.com/maker or ffmpeg:')
  console.log('  ffmpeg -framerate 0.5 -pattern_type glob -i "demo/screenshots/*.png" -vf scale=1280:-1 demo/wateros-demo.gif')
}

run().catch(e => { console.error(e); process.exit(1) })
