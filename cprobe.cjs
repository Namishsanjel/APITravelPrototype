// Contact-page probe: named containers + styled boxes + form controls.
// Usage: node cprobe.cjs <url> [width] [yMin] [yMax] [mode]
//   mode = names | boxes | form   (default names)
const { chromium } = require('playwright');
const url = process.argv[2];
const width = Number(process.argv[3] || 1440);
const yMin = Number(process.argv[4] ?? 0);
const yMax = Number(process.argv[5] ?? 1e9);
const mode = process.argv[6] || 'names';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const s = () => { window.scrollTo(0, y); y += 600; if (y < document.body.scrollHeight) setTimeout(s, 40); else { window.scrollTo(0, 0); setTimeout(res, 300); } };
      s();
    });
  });
  await page.waitForTimeout(2500);

  const rows = await page.evaluate(({ yMin, yMax, mode }) => {
    const out = [];
    const line = (label, el, cs, r) =>
      out.push(
        `${label} | x${Math.round(r.x)},y${Math.round(r.y + scrollY)},${Math.round(r.width)}x${Math.round(r.height)}` +
          (cs ? ` | ${cs}` : '')
      );

    if (mode === 'names') {
      for (const el of document.querySelectorAll('*')) {
        const r = el.getBoundingClientRect();
        const y = r.y + scrollY;
        if (r.height < 8 || y + r.height < yMin || y > yMax) continue;
        const name = el.getAttribute('data-framer-name');
        if (!name && !['SECTION', 'HEADER', 'MAIN', 'FOOTER'].includes(el.tagName)) continue;
        const cs = getComputedStyle(el);
        line(`${el.tagName}[${name}]`, el,
          `pos ${cs.position} | pad ${cs.padding} | gap ${cs.gap} | ${cs.display} | ${cs.flexDirection || ''} ${cs.justifyContent || ''} ${cs.alignItems || ''}`,
          r);
      }
    } else if (mode === 'boxes') {
      for (const el of document.querySelectorAll('*')) {
        const r = el.getBoundingClientRect();
        const y = r.y + scrollY;
        if (r.width < 4 || r.height < 4 || y + r.height < yMin || y > yMax) continue;
        const cs = getComputedStyle(el);
        const bg = cs.backgroundColor;
        const radius = cs.borderRadius;
        const hasRadius = radius && radius !== '0px' && !radius.split(' ').every((v) => v === '0px');
        const bw = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderLeftWidth);
        const hasBorder = bw > 0 && cs.borderTopStyle !== 'none';
        if (bg === 'rgba(0, 0, 0, 0)' && !hasRadius && !hasBorder) continue;
        const txt = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 26);
        line(`${el.tagName}.${(el.className || '').toString().split(' ').slice(0, 2).join('.')}`, el,
          `bg ${bg} | r ${radius}` + (hasBorder ? ` | bd ${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}` : '') +
          ` | pad ${cs.padding}` + (txt ? ` | "${txt}"` : ''),
          r);
      }
    } else {
      const sels = 'input,textarea,select,option,button,[data-framer-input-wrapper],[data-framer-name="Text wrap"]';
      for (const el of document.querySelectorAll(sels)) {
        const r = el.getBoundingClientRect();
        const y = r.y + scrollY;
        if (r.width < 4 || r.height < 4 || y + r.height < yMin || y > yMax) continue;
        const cs = getComputedStyle(el);
        const phc = getComputedStyle(el, '::placeholder').color;
        line(`${el.tagName}${el.type ? '[' + el.type + ']' : ''} ${(el.getAttribute('data-framer-name') || '')}`, el,
          `ph "${el.placeholder || ''}" val "${(el.value || '').toString().slice(0, 24)}" | f ${cs.fontFamily.split(',')[0]} ${cs.fontSize}/${cs.lineHeight} w${cs.fontWeight}` +
          ` | col ${cs.color} | placeholder ${phc}` +
          ` | bg ${cs.backgroundColor} | r ${cs.borderRadius} | bd ${cs.borderWidth} ${cs.borderStyle} ${cs.borderColor}` +
          ` | pad ${cs.padding} | ta ${cs.textAlign} | ap ${cs.appearance || cs.webkitAppearance} | h ${cs.height}`,
          r);
      }
      for (const el of document.querySelectorAll('*')) {
        if (el.children.length) continue;
        const ph = el.getAttribute('data-framer-input-wrapper');
        void ph;
      }
    }
    return out;
  }, { yMin, yMax, mode });
  rows.forEach((r) => console.log(r));
  await browser.close();
})();
