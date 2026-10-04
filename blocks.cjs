// Screenshot named blocks using a handle resolved in the same evaluate call (no index drift).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const url = process.argv[2];
const outDir = process.argv[3];
fs.mkdirSync(outDir, { recursive: true });

const TARGETS = [
  ['header', 'header'],
  ['Hero section', 'section'],
  ['About us', 'section'],
  ['Hikes', 'section'],
  ["What's included", 'section'],
  ['Experience', 'section'],
  ['Our guide', 'section'],
  ["How it's work", 'section'],
  ['Testimonial', 'section'],
  ['Travel Journal', 'section'],
  ['FAQ', 'section'],
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
    const handle = await page.evaluateHandle(
      ({ name, tag }) => {
        const els = [...document.querySelectorAll(tag)];
        return (
          els.find((e) => (e.getAttribute('data-framer-name') || '').trim() === name && e.getBoundingClientRect().height > 100) ||
          els.find((e) => e.getBoundingClientRect().height > 300) ||
          document.body
        );
      },
      { name, tag }
    );
    const el = handle.asElement();
    if (!el) continue;
    const file = path.join(outDir, `blk-${String(i).padStart(2, '0')}-${name.replace(/[^a-z0-9]+/gi, '_')}.png`);
    try {
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await el.screenshot({ path: file });
      const box = await el.boundingBox();
      console.log('OK', name, JSON.stringify(box), '->', path.basename(file));
    } catch (e) {
      console.log('FAIL', name, e.message.slice(0, 90));
    }
    i++;
  }
  await browser.close();
})();
