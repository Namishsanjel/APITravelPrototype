// Capture with identity verification: print each element's own data-framer-name + text snippet.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const url = process.argv[2];
const outDir = process.argv[3];
fs.mkdirSync(outDir, { recursive: true });

const TARGETS = [
  ['header', 'header, nav'],
  ['Hero section', 'section'],
  ['About us', 'section'],
  ['Hikes', 'section'],
  ["What's included", 'section'],
  ['Experience', 'section'],
  ['Our guide', 'section'],
  ["How it's work", 'section'],
  ['Testimonial', 'section'],
  ['Travel Journal', 'section'],
  ['FAQ', 'section, div'],
  ['footer', 'footer'],
];

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

  let i = 0;
  for (const [name, tag] of TARGETS) {
    const handle = await page.evaluateHandle(({ name, tag }) => {
      const els = [...document.querySelectorAll(tag)];
      const match = els.find((e) => (e.getAttribute('data-framer-name') || '').trim() === name && e.getBoundingClientRect().height > 100);
      return match || els.find((e) => e.getBoundingClientRect().height > 300) || document.body;
    }, { name, tag });
    const el = handle.asElement();
    if (!el) continue;
    const info = await el.evaluate((e) => ({
      name: e.getAttribute('data-framer-name') || '',
      tag: e.tagName.toLowerCase(),
      text: (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 90),
    }));
    const file = path.join(outDir, `v-${String(i).padStart(2, '0')}.png`);
    try {
      await el.screenshot({ path: file });
      console.log(`${path.basename(file)} | target="${name}" | actual name="${info.name}" tag=${info.tag} | ${info.text}`);
    } catch (e) {
      console.log('FAIL', name, e.message.slice(0, 80));
    }
    i++;
  }
  await browser.close();
})();
