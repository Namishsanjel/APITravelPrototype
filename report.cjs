// Extract structural + computed-style report from the page for 1:1 porting
const { chromium } = require('playwright');

const url = process.argv[2];
const out = process.argv[3] || 'original-report.txt';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3000);
  // scroll through for lazy loads
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const step = () => { window.scrollTo(0, y); y += 600; if (y < document.body.scrollHeight) setTimeout(step, 50); else res(); };
      step();
    });
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);

  const report = await page.evaluate(() => {
    const pick = (el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        name: el.getAttribute('data-framer-name') || '',
        text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 70),
        rect: { x: Math.round(r.x), y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) },
        style: {
          fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight,
          lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing, color: cs.color,
          background: cs.backgroundColor, borderRadius: cs.borderRadius, padding: cs.padding,
          textAlign: cs.textAlign, display: cs.display, gap: cs.gap,
        },
      };
    };
    // top-level sections
    const sections = [...document.querySelectorAll('body [data-framer-name]')]
      .filter((el) => ['section', 'footer', 'header'].includes(el.tagName.toLowerCase()))
      .map(pick);
    // headings h1-h3 + buttons + links with text
    const texts = [...document.querySelectorAll('h1,h2,h3,h4,p,a,button')].filter((el) => {
      const t = (el.textContent || '').trim();
      return t && t.length < 120 && el.getBoundingClientRect().width > 0;
    }).slice(0, 160).map(pick);
    return { sections, texts, bodyBg: getComputedStyle(document.body).backgroundColor };
  });
  require('fs').writeFileSync(out, JSON.stringify(report, null, 1));
  console.log('sections', report.sections.length, 'texts', report.texts.length, '->', out);
  await browser.close();
})();
