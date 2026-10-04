// Inspect entrance-animation state of journal card containers (row1 vs row2).
const { chromium } = require('playwright');
const URL = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
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
  const out = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('div.framer-quf69h-container')];
    return cards.map((el, i) => {
      const cs = getComputedStyle(el);
      const anims = (el.getAnimations ? el.getAnimations({ subtree: true }) : []).map((a) => ({
        name: (a.animationName || a.id || a.constructor.name),
        state: a.playState,
        t: a.currentTime,
        target: a.effect && a.effect.target ? a.effect.target.tagName.toLowerCase() + '.' + String(a.effect.target.className).split(' ')[0] : null,
      }));
      return {
        i,
        y: +(el.getBoundingClientRect().y + scrollY).toFixed(0),
        op: cs.opacity,
        inlineOp: el.style.opacity,
        inlineTf: el.style.transform,
        cls: String(el.className).slice(0, 60),
        anims: anims.slice(0, 4),
        nAnim: anims.length,
      };
    });
  });
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
