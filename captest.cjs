// Isolate what makes fullPage capture render content +600px offset.
// A: fresh page, no scroll dance
// B: scroll dance (as in screenshot.cjs), wait, capture
// C: scroll dance + forced instant scroll-to-0 + scrollY assertion
// Reports scrollY before capture + overall mad vs orig reference.
const { chromium } = require('playwright');
const fs = require('fs');

const URL = 'http://localhost:5173/hikes';
const REF = 'shots/hikes-desktop.png';

async function mad(page, file) {
  const a = fs.readFileSync(REF).toString('base64');
  const b = fs.readFileSync(file).toString('base64');
  return page.evaluate(async ({ a, b }) => {
    const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + u; });
    const [A, B] = await Promise.all([load(a), load(b)]);
    const W = Math.min(A.width, B.width), H = Math.min(A.height, B.height);
    const grab = (img) => {
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(img, 0, 0);
      return x.getImageData(0, 0, W, H).data;
    };
    const [Da, Db] = [grab(A), grab(B)];
    let s = 0;
    for (let i = 0; i < Da.length; i += 4) s += Math.abs(Da[i] - Db[i]) + Math.abs(Da[i + 1] - Db[i + 1]) + Math.abs(Da[i + 2] - Db[i + 2]);
    return +(s / (Da.length / 4) / 3).toFixed(3);
  }, { a, b });
}

const dance = async (page) => {
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const step = () => {
        window.scrollTo(0, y);
        y += 600;
        if (y < document.body.scrollHeight) setTimeout(step, 60);
        else { window.scrollTo(0, 0); setTimeout(res, 400); }
      };
      step();
    });
  });
  await page.waitForTimeout(1500);
};

(async () => {
  const browser = await chromium.launch();
  const results = [];

  for (const variant of ['A', 'B', 'C']) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(3000);
    if (variant !== 'A') await dance(page);
    if (variant === 'C') {
      await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); });
      await page.waitForTimeout(300);
    }
    const scrollY = await page.evaluate(() => window.scrollY);
    const file = `shots/cap-${variant}.png`;
    await page.screenshot({ path: file, fullPage: true });
    const scrollYAfter = await page.evaluate(() => window.scrollY);
    results.push(`${variant}: scrollY before=${scrollY} after=${scrollYAfter}`);
    await ctx.close();
    // compute mad with a scratch page
    const p2 = await (await browser.newContext()).newPage();
    results.push(`   mad vs orig = ${await mad(p2, file)}`);
    await p2.close();
  }
  results.forEach((r) => console.log(r));
  await browser.close();
})();
