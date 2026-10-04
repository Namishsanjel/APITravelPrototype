// Localize vertical drift between ref and port about pages.
const { chromium } = require('playwright');
const [A, B] = process.argv.slice(2);

const PROBE = async (page, url) => {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  return page.evaluate(() => {
    const r = (e) => {
      if (!e) return null;
      const b = e.getBoundingClientRect();
      return { y: +(b.y + scrollY).toFixed(3), h: +b.height.toFixed(3), w: +b.width.toFixed(3), x: +b.x.toFixed(3) };
    };
    const find = (s) => [...document.images].find((i) => i.src.includes(s));
    const sec = (e) => (e ? e.closest('section') : null);
    const hero = find('eletD');
    const story = find('Rdokshm');
    const why = find('DSeT2');
    const guide = find('9LRj');
    const bg = find('tbrfd');
    const storySec = sec(story);
    return {
      heroSec: r(sec(hero)),
      heroImg: r(hero),
      storySec: r(storySec),
      storyImg: r(story),
      storyH4: r(storySec ? storySec.querySelector('h4') : null),
      whySec: r(sec(why)),
      whyImg: r(why),
      guidesSec: r(sec(guide)),
      guidesImg: r(guide),
      bgImg: r(bg),
      scrollH: document.documentElement.scrollHeight,
    };
  });
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const a = await PROBE(page, A);
  const b = await PROBE(page, B);
  console.log('A=' + A);
  console.log('B=' + B);
  for (const k of Object.keys(a)) {
    const sa = JSON.stringify(a[k]);
    const sb = JSON.stringify(b[k]);
    console.log((sa === sb ? 'SAME ' : 'DIFF ') + k + '\n   A: ' + sa + '\n   B: ' + sb);
  }
  await browser.close();
})();
