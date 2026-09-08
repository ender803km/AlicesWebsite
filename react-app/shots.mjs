import { chromium } from 'playwright'
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'
const ROOT = path.resolve('dist')
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.json':'application/json'}
const server=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);let f=path.join(ROOT,u)
  if(!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(ROOT,'index.html')
  res.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res)})
await new Promise(r=>server.listen(4173,r))
fs.mkdirSync('/mnt/user-data/outputs', { recursive: true })
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
for (const [route, name] of [['/', 'home'], ['/commands', 'commands'], ['/about', 'about']]) {
  for (const [w, label] of [[1440, 'desktop'], [390, 'mobile']]) {
    // reducedMotion short-circuits useReveal's IntersectionObserver, so every
    // section is painted rather than sitting at opacity 0 below the fold.
    const p = await b.newPage({ viewport: { width: w, height: 1000 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
    await p.goto(`http://localhost:4173${route}`, { waitUntil: 'networkidle' })
    await p.evaluate(async () => {
      // Trigger every IntersectionObserver reveal, then return to the top.
      for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)) }
      window.scrollTo(0, 0)
    })
    await p.waitForTimeout(700)
    await p.screenshot({ path: `/mnt/user-data/outputs/${name}-${label}.png`, fullPage: true })
    await p.close()
  }
}
await b.close(); server.close()
console.log('screenshots written')
