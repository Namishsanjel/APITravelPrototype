// Element-based screenshots of every named top-level block, robust to layout shift.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const url = process.argv[2];
const outDir = process.argv[3];
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const s = () => { window.scrollTo(0, y); y += 600; if (y < document.body.scrollHeight) setTimeout(s, 50); else res(); };
      s();
    });
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(2500);

  const list = await page.evaluate(() => {
    const names = ['Desktop', 'Hero section', 'About us', 'Hikes', "What's included", 'Experience', 'Our guide', "How it's work", 'Testimonial', 'Travel Journal', 'FAQ'];
    const out = [];
    for (const n of names) {
      const el = [...document.querySelectorAll('[data-framer-name]')].find(
        (e) => (e.getAttribute('data-framer-name') || '').trim() === n && e.offsetParent !== null && e.getBoundingClientRect().height > 100
      );
      if (el) out.push({ n, idx: [...document.querySelectorAll('[data-framer-name]')].indexOf(el) });
    }
    return out;
  });

  let i = 0;
  for (const item of list) {
    const handle = await page.evaluateHandle((idx) => document.querySelectorAll('[data-framer-name]')[idx], item.idx);
    const el = handle.asElement();
    if (!el) continue;
    const file = path.join(outDir, `el-${String(i).padStart(2, '0')}-${item.n.replace(/[^a-z0-9]+/gi, '_')}.png`);
    try {
      await el.screenshot({ path: file });
      console.log('OK', item.n, '->', path.basename(file));
    } catch (e) {
      console.log('FAIL', item.n, e.message.slice(0, 80));
    }
    i++;
  }
  await browser.close();
})();
