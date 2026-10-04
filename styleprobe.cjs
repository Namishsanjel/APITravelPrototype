// Computed-style probe: for each anchor text, print the matched element's
// style subset + ancestor chain (class/rect/bg/radius/pad) + pseudo gradients.
// Usage: node styleprobe.cjs <url> <anchor> [anchor...]
const { chromium } = require('playwright');
const [URL, ...ANCHORS] = process.argv.slice(2);

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
        y += 800;
        if (y < document.body.scrollHeight) setTimeout(step, 40);
        else { window.scrollTo(0, 0); setTimeout(res, 250); }
      };
      step();
    });
  });
  await page.waitForTimeout(600);
  const out = await page.evaluate((anchors) => {
    const lines = [];
    lines.push('TITLE=' + document.title);
    const md = document.querySelector('meta[name="description"]');
    lines.push('DESC=' + (md ? md.content : ''));
    const fmt = (e) => {
      const cs = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      const rect = `y${(r.y + scrollY).toFixed(1)} x${r.x.toFixed(1)} ${r.width.toFixed(1)}x${r.height.toFixed(1)}`;
      const bits = [
        rect,
        `${cs.fontFamily.split(',')[0].replace(/"/g, '')} ${cs.fontSize}/${cs.lineHeight} w${cs.fontWeight} ls${cs.letterSpacing}`,
        `color=${cs.color}`,
      ];
      if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)') bits.push(`bg=${cs.backgroundColor}`);
      if (cs.borderTopWidth !== '0px' || cs.borderLeftWidth !== '0px')
        bits.push(`bd=${cs.borderTopWidth} ${cs.borderTopColor} r${cs.borderRadius}`);
      else if (cs.borderRadius !== '0px') bits.push(`r=${cs.borderRadius}`);
      if (cs.paddingTop !== '0px') bits.push(`pad=${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`);
      if (cs.backdropFilter && cs.backdropFilter !== 'none') bits.push(`backdrop=${cs.backdropFilter}`);
      if (cs.opacity !== '1') bits.push(`op=${cs.opacity}`);
      if (cs.display !== 'block' && cs.display !== 'inline') bits.push(`disp=${cs.display}`);
      if (cs.position !== 'static') bits.push(`pos=${cs.position}`);
      if (cs.gap !== '0px') bits.push(`gap=${cs.gap}`);
      if (cs.textAlign !== 'start') bits.push(`ta=${cs.textAlign}`);
      if (cs.textTransform !== 'none') bits.push(`tt=${cs.textTransform}`);
      if (cs.overflow !== 'visible') bits.push(`ov=${cs.overflow}`);
      if (cs.objectFit) bits.push(`of=${cs.objectFit}`);
      if (cs.mixBlendMode !== 'normal') bits.push(`blend=${cs.mixBlendMode}`);
      return bits.join(' | ');
    };
    const pseudo = (e, which) => {
      const cs = getComputedStyle(e, which);
      const bits = [];
      if (cs.backgroundImage !== 'none') bits.push(`${which} bgimg=${cs.backgroundImage.slice(0, 160)}`);
      if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)') bits.push(`${which} bg=${cs.backgroundColor}`);
      if (cs.content && cs.content !== 'none' && cs.content !== 'normal') bits.push(`${which} content=${cs.content}`);
      return bits;
    };
    for (const a of anchors) {
      let el = null;
      const all = [...document.querySelectorAll('*')];
      if (a.startsWith('img:')) {
        const sub = a.slice(4);
        el = document.querySelector(`img[src*="${sub}"]`);
        lines.push(`### IMG "${sub}"`);
        if (!el) { lines.push('  NOT FOUND'); continue; }
        lines.push(`  SELF  img ${fmt(el)}`);
        let p = el.parentElement;
        let d = 0;
        while (p && d < 7) {
          const chain = [];
          for (const w of ['::before', '::after']) chain.push(...pseudo(p, w));
          lines.push(`  ANC${d} ${p.tagName.toLowerCase()} ${fmt(p)}`);
          chain.forEach((c) => lines.push(`        ${c}`));
          p = p.parentElement;
          d++;
        }
        continue;
      }
      el = all.find(
        (e) => e.children.length === 0 && (e.textContent || '').trim().startsWith(a) && e.getBoundingClientRect().height > 0
      );
      if (!el) el = all.find((e) => (e.textContent || '').trim().startsWith(a) && e.getBoundingClientRect().height > 0);
      lines.push(`### "${a}"`);
      if (!el) { lines.push('  NOT FOUND'); continue; }
      // element itself + small children surface
      lines.push(`  SELF  ${el.tagName.toLowerCase()} ${fmt(el)}`);
      if (el.children.length && el.children.length <= 6) {
        for (const c of el.children) lines.push(`    kid ${c.tagName.toLowerCase()} ${fmt(c)}`);
      }
      // ancestor chain
      let p = el.parentElement;
      let d = 0;
      while (p && d < 6) {
        const chain = [];
        for (const w of ['::before', '::after']) chain.push(...pseudo(p, w));
        lines.push(`  ANC${d} ${p.tagName.toLowerCase()} ${fmt(p)}`);
        chain.forEach((c) => lines.push(`        ${c}`));
        p = p.parentElement;
        d++;
      }
    }
    return lines;
  }, ANCHORS);
  console.log('=== ' + URL);
  out.forEach((l) => console.log(l));
  await browser.close();
})();
