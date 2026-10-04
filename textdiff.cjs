// Word-frequency diff of rendered text between two pages.
// Catches missing/extra copy regardless of DOM structure.
// Usage: node textdiff.cjs <urlA> <urlB>
const { chromium } = require('playwright');

const urlA = process.argv[2];
const urlB = process.argv[3];

async function words(page, url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const s = () => {
        window.scrollTo(0, y);
        y += 600;
        if (y < document.body.scrollHeight) setTimeout(s, 40);
        else { window.scrollTo(0, 0); setTimeout(res, 300); }
      };
      s();
    });
  });
  await page.waitForTimeout(2500);
  return page.evaluate(() => {
    // rendered text only (hidden nodes excluded by innerText)
    const t = document.body.innerText || '';
    return t.split(/\s+/).map((w) => w.trim()).filter(Boolean);
  });
}

const tally = (arr) => {
  const m = new Map();
  for (const w of arr) m.set(w, (m.get(w) || 0) + 1);
  return m;
};

(async () => {
  const browser = await chromium.launch();
  const A = tally(await words(await browser.newPage({ viewport: { width: 1440, height: 900 } }), urlA));
  const B = tally(await words(await browser.newPage({ viewport: { width: 1440, height: 900 } }), urlB));
  const keys = new Set([...A.keys(), ...B.keys()]);
  const diffs = [];
  for (const k of keys) {
    const a = A.get(k) || 0, b = B.get(k) || 0;
    if (a !== b) diffs.push({ k, a, b });
  }
  console.log(`words: original=${[...A.values()].reduce((s, n) => s + n, 0)} port=${[...B.values()].reduce((s, n) => s + n, 0)}`);
  console.log(`--- ${diffs.length} word-count differences ---`);
  diffs.sort((x, y) => Math.abs(y.b - y.a) - Math.abs(x.b - x.a));
  diffs.forEach((d) => console.log(`  "${d.k}": original=${d.a} port=${d.b}`));
  await browser.close();
})();
