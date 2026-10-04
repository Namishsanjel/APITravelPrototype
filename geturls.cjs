// Collect every framerusercontent.com / fontshare URL the mirror pages request.
// Usage: node geturls.cjs <url1> [url2 ...]  -> writes framerurls.txt (appends unique)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const TARGETS = process.argv.slice(2);
const OUT = 'framerurls.txt';

const MAP = (() => {
  try { return JSON.parse(fs.readFileSync('public/framer/map.json', 'utf8').replace(/^﻿/, '')); } catch { return {}; }
})();
function ctFor(p) {
  if (/\.(mjs|js)$/.test(p)) return 'application/javascript; charset=utf-8';
  if (/\.css$/.test(p)) return 'text/css; charset=utf-8';
  if (/\.woff2$/.test(p)) return 'font/woff2';
  if (/\.woff$/.test(p)) return 'font/woff';
  return 'application/octet-stream';
}
async function installRoute(page) {
  await page.route('**/*', async (route) => {
    const u = route.request().url();
    let host = '';
    try { host = new URL(u).host; } catch {}
    if (host === 'events.framer.com') return route.abort();
    if (host === 'framerusercontent.com' || host === 'fonts.googleapis.com' || host === 'fonts.gstatic.com') {
      const rel = MAP[u];
      if (rel) {
        const f = path.join(__dirname, 'public', rel.replace(/^\//, ''));
        if (fs.existsSync(f)) return route.fulfill({ path: f, contentType: ctFor(f) });
      }
    }
    return route.continue();
  });
}

(async () => {
  const urls = new Set(fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8').split('\n').filter(Boolean) : []);
  const browser = await chromium.launch();
  for (const target of TARGETS) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await installRoute(page);
    const seen = new Set();
    page.on('request', (r) => {
      const u = r.url();
      if (/^https:\/\/(framerusercontent\.com|fonts\.gstatic\.com|fonts\.googleapis\.com)\//.test(u)) {
        if (!seen.has(u)) { seen.add(u); urls.add(u); }
      }
    });
    try { await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 }); } catch (e) { console.log('goto:', e.message.slice(0, 60)); }
    await page.waitForTimeout(12000);
    // trigger lazy/dynamic imports by scrolling slowly
    await page.evaluate(async () => {
      await new Promise((res) => {
        let y = 0;
        const step = () => {
          window.scrollTo(0, y);
          y += 500;
          if (y < document.body.scrollHeight) setTimeout(step, 300);
          else { window.scrollTo(0, 0); setTimeout(res, 300); }
        };
        step();
      });
    });
    await page.waitForTimeout(8000);
    console.log(target, '->', seen.size, 'urls');
    await page.close();
  }
  await browser.close();
  const list = [...urls].sort();
  fs.writeFileSync(OUT, list.join('\n') + '\n');
  console.log('total unique:', list.length);
})();
