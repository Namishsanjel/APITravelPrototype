// Screenshot a URL full-page at desktop + mobile, save to shots/
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SHOTS = path.join(__dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

// local cache of framer CDN assets (hydration JS + fonts), see downloadframer.ps1
const FRAMER_MAP = (() => {
  try {
    return JSON.parse(
      fs.readFileSync(path.join(__dirname, 'public', 'framer', 'map.json'), 'utf8').replace(/^﻿/, '')
    );
  } catch {
    return {};
  }
})();
function contentTypeFor(p) {
  if (/\.(mjs|js)$/.test(p)) return 'application/javascript; charset=utf-8';
  if (/\.css$/.test(p)) return 'text/css; charset=utf-8';
  if (/\.woff2$/.test(p)) return 'font/woff2';
  if (/\.woff$/.test(p)) return 'font/woff';
  if (/\.svg$/.test(p)) return 'image/svg+xml';
  if (/\.json$/.test(p)) return 'application/json';
  if (/\.png$/.test(p)) return 'image/png';
  if (/\.jpe?g$/.test(p)) return 'image/jpeg';
  if (/\.ico$/.test(p)) return 'image/x-icon';
  return 'application/octet-stream';
}
function mappedAsset(u) {
  const rel = FRAMER_MAP[u];
  if (!rel) return null;
  const file = path.join(__dirname, 'public', rel.replace(/^\//, ''));
  return fs.existsSync(file) ? file : null;
}

// Serve framerusercontent.com from the local image cache (CDN throttles the
// browser). Hash algorithm must match fetchimgs.ps1: md5(query).slice(0,6).
function localImg(u) {
  try {
    const url = new URL(u);
    if (url.host !== 'framerusercontent.com') return null;
    const m = url.pathname.match(/^\/images\/([A-Za-z0-9]+)\.(jpg|png)$/);
    if (!m) return null;
    const raw = url.search
      .replace(/%20\d+w/g, '') // fused srcset descriptors (mirror encodes the space)
      .replace(/[&?]r=\d+/g, '')
      .replace(/^&/, '?');
    const stripped = raw.replace(/[?&]scale-down-to=\d+/g, '').replace(/^&/, '?');
    const hashOf = (q) => crypto.createHash('md5').update(q, 'utf8').digest('hex').slice(0, 6);
    for (const q of [raw, stripped]) {
      const file = path.join(__dirname, 'public', 'img', `${m[1]}-${hashOf(q)}.${m[2]}`);
      if (fs.existsSync(file)) return file;
    }
  } catch {}
  return null;
}

const targets = process.argv.slice(2);
if (targets.length % 3 !== 0) {
  console.error('Usage: node screenshot.js <name> <url> <desktop|mobile> ...');
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch();
  for (let i = 0; i < targets.length; i += 3) {
    const [name, url, kind] = targets.slice(i, i + 3);
    const isMobile = kind === 'mobile';
    const ctx = await browser.newContext({
      viewport: isMobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    await page.route('**/*', async (route) => {
      const u = route.request().url();
      let host = '';
      try { host = new URL(u).host; } catch {}
      if (host === 'events.framer.com') return route.abort();
      if (host === 'framerusercontent.com') {
        const img = localImg(u);
        if (img) return route.fulfill({ path: img, contentType: img.endsWith('.png') ? 'image/png' : 'image/jpeg' });
        const asset = mappedAsset(u);
        if (asset) return route.fulfill({ path: asset, contentType: contentTypeFor(asset) });
      } else if (host === 'fonts.googleapis.com' || host === 'fonts.gstatic.com') {
        const asset = mappedAsset(u);
        if (asset) return route.fulfill({ path: asset, contentType: contentTypeFor(asset) });
      }
      return route.continue();
    });
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    } catch (e) {
      console.log(name, 'goto warn:', e.message);
    }
    // wait for lazy content / animations
    await page.waitForTimeout(3000);
    await page.evaluate(async () => {
      await new Promise((res) => {
        let y = 0;
        const step = () => {
          window.scrollTo(0, y);
          y += 400;
          // hold each position so IntersectionObserver-driven entrance
          // animations (Framer cards) trigger and complete
          if (y < document.body.scrollHeight) setTimeout(step, 500);
          else { window.scrollTo(0, 0); setTimeout(res, 800); }
        };
        step();
      });
    });
    await page.waitForTimeout(1500);
    // make sure every image decoded before capturing (CDN hiccups)
    for (let attempt = 0; attempt < 3; attempt++) {
      const bad = await page.evaluate(async () => {
        const imgs = [...document.images];
        const t0 = Date.now();
        while (Date.now() - t0 < 8000) {
          const pending = imgs.filter((i) => !i.complete || i.naturalWidth === 0);
          if (!pending.length) break;
          await new Promise((r) => setTimeout(r, 250));
        }
        // Mirror-proxied framerusercontent IDs 404, but the srcset still
        // carries the real CDN candidate — swap stuck images over to it.
        for (const i of imgs.filter((x) => !x.complete || x.naturalWidth === 0)) {
          const cands = (i.getAttribute('srcset') || '').split(',').map((s) => s.trim().split(/\s+/)[0]);
          const real = cands.find((u) => u && u.startsWith('https://framerusercontent.com/'));
          if (real) {
            i.setAttribute('srcset', '');
            i.setAttribute('sizes', '');
            i.src = real;
          }
        }
        const t1 = Date.now();
        while (Date.now() - t1 < 6000) {
          const pending = imgs.filter((i) => !i.complete || i.naturalWidth === 0);
          if (!pending.length) break;
          await new Promise((r) => setTimeout(r, 250));
        }
        return imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.currentSrc || i.src);
      });
      if (!bad.length) break;
      console.log(name, `attempt ${attempt + 1}: ${bad.length} image(s) unloaded, cache-busting:`, bad.slice(0, 4));
      await page.evaluate((urls) => {
        for (const img of document.images) {
          const u = img.currentSrc || img.src;
          if (urls.includes(u)) img.src = u + (u.includes('?') ? '&' : '?') + 'r=' + Date.now();
        }
      }, bad);
      await page.waitForTimeout(4000);
    }
    const file = path.join(SHOTS, `${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    const h = await page.evaluate(() => document.body.scrollHeight);
    console.log(`OK ${name} ${url} [${kind}] ${h}px -> ${file}`);
    await ctx.close();
  }
  await browser.close();
})();
