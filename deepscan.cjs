// Deep style scan: ancestors of blur layers + pseudo-elements on card subtree.
// Usage: node deepscan.cjs <url> <selector>
const { chromium } = require('playwright');
const url = process.argv[2];
const sel = process.argv[3];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const out = await page.evaluate((sel) => {
    const root = document.querySelector(sel);
    if (!root) return [`NOT FOUND: ${sel}`];
    const lines = [];
    const layer = [...root.querySelectorAll('*')].find((e) => (getComputedStyle(e).backdropFilter || 'none') !== 'none' && (getComputedStyle(e).backdropFilter || '').includes('0.078'));
    if (layer) {
      let p = layer;
      for (let i = 0; p && i < 6; i++, p = p.parentElement) {
        const cs = getComputedStyle(p);
        lines.push(
          `anc${i} <${p.tagName.toLowerCase()}> filter=${cs.filter} wc=${cs.willChange} contain=${cs.contain} ` +
          `mask=${cs.maskImage !== 'none' ? 'YES' : '-'} clip=${cs.clipPath !== 'none' ? cs.clipPath.slice(0, 40) : '-'} ` +
          `blend=${cs.mixBlendMode} iso=${cs.isolation} op=${cs.opacity} tf=${cs.transform === 'none' ? '-' : cs.transform.slice(0, 30)} ` +
          `cls="${(p.className || '').toString().slice(0, 40)}"`
        );
      }
    } else lines.push('layer not found');
    // pseudo-elements anywhere in card
    for (const e of root.querySelectorAll('*')) {
      for (const pe of ['::before', '::after']) {
        const cs = getComputedStyle(e, pe);
        if (cs.content && cs.content !== 'none') {
          const bits = [];
          if (cs.filter !== 'none') bits.push(`filter=${cs.filter}`);
          if (cs.backdropFilter && cs.backdropFilter !== 'none') bits.push(`bf=${cs.backdropFilter}`);
          if (cs.backgroundImage !== 'none') bits.push(`bg=${cs.backgroundImage.slice(0, 50)}`);
          if (cs.opacity !== '1') bits.push(`op=${cs.opacity}`);
          if (cs.transform !== 'none') bits.push(`tf=${cs.transform.slice(0, 30)}`);
          if (bits.length) lines.push(`PE <${e.tagName.toLowerCase()}> ${pe} cls="${(e.className || '').toString().slice(0, 30)}" ${bits.join(' ')}`);
        }
      }
    }
    // animations across whole card
    const anims = root.getAnimations({ subtree: true });
    lines.push(`animations in card: ${anims.length}`);
    for (const a of anims.slice(0, 12)) {
      try {
        const t = a.effect.getTiming();
        lines.push(`  ${a.animationName || a.constructor.name} state=${a.playState} dur=${t.duration} target=${a.effect.target.tagName}.${(a.effect.target.className || '').toString().slice(0, 26)}`);
      } catch (err) { lines.push(`  ${a.constructor.name} state=${a.playState}`); }
    }
    return lines;
  }, sel);
  out.forEach((l) => console.log(l));
  await browser.close();
})();
