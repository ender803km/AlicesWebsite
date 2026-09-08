import { chromium } from 'playwright'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve('dist')
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.png':'image/png',
  '.svg':'image/svg+xml', '.woff2':'font/woff2', '.woff':'font/woff', '.json':'application/json' }

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])
  let file = path.join(ROOT, url)
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(ROOT, 'index.html')
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
})
await new Promise(r => server.listen(4173, r))

const ROUTES = ['/', '/commands', '/about', '/contact', '/privacy', '/terms', '/login', '/nope-404']
const WIDTHS = [320, 360, 390, 414, 768, 1024, 1280, 1440, 1920]

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const fails = []
const note = (m) => fails.push(m)

for (const route of ROUTES) {
  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 900 } })
    const errors = []
    page.on('pageerror', e => errors.push(e.message))
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
    await page.goto(`http://localhost:4173${route}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(150)

    const r = await page.evaluate(() => {
      const out = { overflow: 0, escaped: [], tiny: [], smallTap: [] }
      out.overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth

      // An element wider than the viewport is only a bug if nothing above it
      // scrolls horizontally on purpose (the mobile module chip rail does).
      const inScroller = (el) => {
        for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
          const ox = getComputedStyle(n).overflowX
          if (ox === 'auto' || ox === 'scroll') return true
        }
        return false
      }
      // A link inside a sentence is meant to be text-sized; the 30px rule is
      // for standalone controls.
      const isInlineInProse = (el) => {
        if (!getComputedStyle(el).display.startsWith('inline')) return false
        const parent = el.parentElement
        if (!parent) return false
        // Running text: the parent holds prose of its own around this link,
        // so the link is sized by the sentence, not by a tap target.
        return [...parent.childNodes].some(
          (n) => n.nodeType === 3 && n.textContent.trim().length > 0,
        )
      }

      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el)
        if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue
        const b = el.getBoundingClientRect()
        if (!b.width && !b.height) continue
        if (b.right > window.innerWidth + 1.5 && cs.position !== 'fixed' &&
            !el.closest('[aria-hidden="true"]') && !inScroller(el))
          out.escaped.push(el.tagName + '.' + (el.className.toString().split(' ')[0] || '') + ' right=' + Math.round(b.right))
        const fs = parseFloat(cs.fontSize)
        if (fs && fs < 11.5 && el.textContent.trim() && el.children.length === 0 && el.tagName !== 'KBD')
          out.tiny.push(el.tagName + '.' + (el.className.toString().split(' ')[0] || '') + ' ' + fs + 'px')
        if ((el.tagName === 'A' || el.tagName === 'BUTTON') && el.textContent.trim() &&
            (b.height < 30 || b.width < 30) && !isInlineInProse(el))
          out.smallTap.push(el.tagName + ' ' + Math.round(b.width) + 'x' + Math.round(b.height) + ' "' + el.textContent.trim().slice(0,24) + '"')
      }
      out.escaped = [...new Set(out.escaped)].slice(0, 5)
      out.tiny = [...new Set(out.tiny)].slice(0, 5)
      out.smallTap = [...new Set(out.smallTap)].slice(0, 5)
      return out
    })

    const tag = `${route} @${width}`
    if (r.overflow > 1) note(`${tag}: horizontal overflow ${r.overflow}px`)
    if (r.escaped.length) note(`${tag}: escapes viewport → ${r.escaped.join(' | ')}`)
    if (r.tiny.length) note(`${tag}: text under 11.5px → ${r.tiny.join(' | ')}`)
    if (r.smallTap.length) note(`${tag}: tap target under 30px → ${r.smallTap.join(' | ')}`)
    const real = errors.filter(e => !/favicon|net::ERR|Failed to load resource/.test(e))
    if (real.length) note(`${tag}: JS error → ${real.slice(0,2).join(' | ')}`)
    await page.close()
  }
}

// ─── Behaviour checks on /commands ───────────────────────────────────────────
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errs = []
page.on('pageerror', e => errs.push(e.message))
await page.goto('http://localhost:4173/commands', { waitUntil: 'networkidle' })

const check = async (name, fn) => { try { const ok = await fn(); if (!ok) note(`behaviour: ${name}`) } catch (e) { note(`behaviour: ${name} threw ${e.message}`) } }

await check('masthead states the real command count', async () =>
  (await page.textContent('.home-cmd-masthead p')).includes('110'))
await check('all 23 modules render a section', async () =>
  (await page.locator('section.home-cmd-module').count()) === 23)
await check('rail lists every module', async () =>
  (await page.locator('.home-cmd-rail a').count()) === 23)
await check('search narrows results', async () => {
  await page.fill('input[type=search]', 'alliance')
  await page.waitForTimeout(120)
  const t = await page.textContent('.home-cmd-result-count')
  return /1 of 110/.test(t)
})
await check('search matches descriptions too', async () => {
  await page.fill('input[type=search]', 'weekly rotation')
  await page.waitForTimeout(120)
  return (await page.locator('.home-cmd-row').count()) >= 1
})
await check('empty state appears for nonsense', async () => {
  await page.fill('input[type=search]', 'zzzznope')
  await page.waitForTimeout(120)
  return await page.locator('.home-empty').isVisible()
})
await check('clear button restores the full list', async () => {
  await page.click('.home-empty button')
  await page.waitForTimeout(120)
  return (await page.locator('section.home-cmd-module').count()) === 23
})
await check('admin filter returns only admin commands', async () => {
  await page.click('.home-cmd-filter:has-text("Admin only")')
  await page.waitForTimeout(120)
  const rows = await page.locator('.home-cmd-row').count()
  const badges = await page.locator('.home-cmd-row .home-badge-admin').count()
  return rows > 0 && rows === badges
})
await check('mods filter returns only mod commands', async () => {
  await page.click('.home-cmd-filter:has-text("Mods only")')
  await page.waitForTimeout(120)
  const rows = await page.locator('.home-cmd-row').count()
  const badges = await page.locator('.home-cmd-row .home-badge-mods').count()
  return rows === 3 && rows === badges
})
await check('"? alias" badge renders on prefix-capable commands', async () => {
  await page.click('.home-cmd-filter:has-text("Everything")')
  await page.fill('input[type=search]', '/balance')
  await page.waitForTimeout(120)
  return (await page.textContent('.home-cmd-badges')).includes('? alias')
})
await check('every module anchor resolves', async () => {
  await page.fill('input[type=search]', '')
  await page.click('.home-cmd-filter:has-text("Everything")')
  await page.waitForTimeout(150)
  const ids = await page.$$eval('.home-cmd-rail a', as => as.map(a => a.getAttribute('href').slice(1)))
  const missing = await page.evaluate(ids => ids.filter(i => !document.getElementById(i)), ids)
  return missing.length === 0
})
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await check('homepage proof band shows derived counts', async () => {
  const t = await page.textContent('.home-proof-inner')
  return t.includes('23') && t.includes('110')
})
await check('homepage highlights section renders three cards', async () =>
  (await page.locator('#highlights-heading ~ * , .home-triad').count()) > 0 &&
  (await page.locator('section[aria-labelledby="highlights-heading"] .home-triad-item').count()) === 3)
await check('homepage index links point at real anchors', async () => {
  const hrefs = await page.$$eval('.home-index-row', as => as.map(a => a.getAttribute('href')))
  return hrefs.length === 23 && hrefs.every(h => h.startsWith('/commands#'))
})
if (errs.length) note(`behaviour: JS errors → ${errs.slice(0,2).join(' | ')}`)
await page.close()

await browser.close()
server.close()

if (fails.length) { console.log('FAIL (' + fails.length + ')'); fails.forEach(f => console.log('  ✗ ' + f)); process.exit(1) }
console.log('PASS — ' + ROUTES.length * WIDTHS.length + ' route/width combinations, all behaviour checks green')
