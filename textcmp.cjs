// 1) Element screenshots of the same text on orig + port, mad compare.
// 2) Dump loaded @font-face entries for Inter Display / Clash / Cabinet.
// Usage: node textcmp.cjs <text-substring> <url1> <url2>
const { chromium } = require('playwright');
const fs = require('fs');
const sub = process.argv[2];
const urls = process.argv.slice(3);
(async () => {
  const browser = await chromium.launch();
  const shots = [];
  for (let i = 0; i < urls.length; i++) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(urls[i], { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2000);
    const handle = await page.evaluateHandle((sub) => {
      const walk = (el) => {
        for (const c of el.children) {
          const h = walk(c);
          if (h) return h;
        }
        if (el.children.length === 0 && (el.textContent || '').includes(sub)) return el;
        return null;
      };
      return walk(document.body);
    }, sub);
    const el = handle.asElement();
    if (!el) {
      console.log(`NOT FOUND on ${urls[i]}`);
      continue;
    }
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const buf = await el.screenshot({ type: 'png' });
    const f = `shots/textcmp-${i}.png`;
    fs.writeFileSync(f, buf);
    shots.push(f);
    if (i === 0) {
      const fonts = await page.evaluate(() => {
        const out = [];
        document.fonts.forEach((f) => out.push(`${f.family} ${f.weight} ${f.style} status=${f.status} stretch=${f.stretch}`));
        // src urls from stylesheets
        const srcs = [];
        for (const s of document.styleSheets) {
          try {
            for (const r of s.cssRules) {
              if (r.constructor.name === 'CSSFontFaceRule' || (r.cssText || '').startsWith('@font-face')) {
                srcs.push(r.cssText.slice(0, 220));
              }
            }
          } catch (e) {}
        }
        return { faces: out, srcs };
      });
      console.log('--- font faces (url1) ---');
      fonts.faces.forEach((f) => console.log('  ' + f));
      console.log('--- @font-face rules (url1) ---');
      fonts.srcs.forEach((s) => console.log('  ' + s));
    }
    await page.close();
  }
  if (shots.length === 2) {
    const page = await browser.newPage();
    const res = await page.evaluate(
      async (files) => {
        const toUrl = (f) => 'data:image/png;base64,' + f;
        const load = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = u; });
        const fsRead = files; // base64 strings passed in
        const [A, B] = await Promise.all([load(toUrl(fsRead[0])), load(toUrl(fsRead[1]))]);
        const W = Math.min(A.width, B.width), H = Math.min(A.height, B.height);
        const grab = (img) => {
          const c = document.createElement('canvas');
          c.width = W; c.height = H;
          const x = c.getContext('2d', { willReadFrequently: true });
          x.drawImage(img, 0, 0);
          return x.getImageData(0, 0, W, H).data;
        };
        const Da = grab(A), Db = grab(B);
        let sum = 0, n = W * H * 3;
        for (let i = 0; i < Da.length; i += 4) {
          sum += Math.abs(Da[i] - Db[i]) + Math.abs(Da[i + 1] - Db[i + 1]) + Math.abs(Da[i + 2] - Db[i + 2]);
        }
        return { a: `${A.width}x${A.height}`, b: `${B.width}x${B.height}`, mad: (sum / n).toFixed(3) };
      },
      shots.map((f) => fs.readFileSync(f).toString('base64'))
    );
    console.log(`element shots: ${res.a} vs ${res.b}, mad=${res.mad}`);
    await page.close();
  }
  await browser.close();
})();
