// Find the card around an image, then list every descendant with paint-relevant
// styles (bg, bg-image, border, radius, position, opacity) to expose gradient
// overlays + chip borders. Usage: node overlayprobe.cjs <url> <img-substr>
const { chromium } = require('playwright');
const [URL, SUB] = process.argv.slice(2);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const out = await page.evaluate((sub) => {
    const lines = [];
    const img = document.querySelector(`img[src*="${sub}"]`);
    if (!img) return ['IMG NOT FOUND'];
    // card root: nearest ancestor with a border-radius >= 6px
    let root = img.parentElement;
    for (let i = 0; i < 8 && root; i++) {
      const cs = getComputedStyle(root);
      const rr = parseFloat(cs.borderRadius) || 0;
      if (rr >= 6 || cs.backgroundColor !== 'rgba(0, 0, 0, 0)') break;
      root = root.parentElement;
    }
    if (!root) return ['ROOT NOT FOUND'];
    const r = (e) => {
      const b = e.getBoundingClientRect();
      return `y${(b.y + scrollY).toFixed(1)} x${b.x.toFixed(1)} ${b.width.toFixed(1)}x${b.height.toFixed(1)}`;
    };
    const desc = (e, d) => {
      const cs = getComputedStyle(e);
      const bits = [];
      if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)') bits.push(`bg=${cs.backgroundColor}`);
      if (cs.backgroundImage !== 'none') bits.push(`bgimg=${cs.backgroundImage.slice(0, 200)}`);
      if (cs.borderTopWidth !== '0px') bits.push(`border=${cs.borderTopWidth}/${cs.borderBottomWidth} ${cs.borderTopColor}`);
      if (cs.borderRadius !== '0px') bits.push(`r=${cs.borderRadius}`);
      if (cs.position !== 'static') bits.push(`pos=${cs.position}`);
      if (cs.opacity !== '1') bits.push(`op=${cs.opacity}`);
      if (cs.zIndex !== 'auto') bits.push(`z=${cs.zIndex}`);
      if (cs.objectFit) bits.push(`of=${cs.objectFit}`);
      const tag = e.tagName.toLowerCase() === 'img' ? 'img' : e.tagName.toLowerCase();
      lines.push(`${'  '.repeat(d)}${tag} ${r(e)} ${bits.join(' | ')}`);
      // pseudo borders/bg for chip-like elements
      for (const w of ['::before', '::after']) {
        const ps = getComputedStyle(e, w);
        const pb = [];
        if (ps.content !== 'none' && ps.content !== 'normal') pb.push(`content=${ps.content}`);
        if (ps.backgroundColor !== 'rgba(0, 0, 0, 0)') pb.push(`bg=${ps.backgroundColor}`);
        if (ps.backgroundImage !== 'none') pb.push(`bgimg=${ps.backgroundImage.slice(0, 160)}`);
        if (ps.borderTopWidth !== '0px') pb.push(`border=${ps.borderTopWidth} ${ps.borderTopColor}`);
        if (ps.borderRadius !== 'none' && ps.borderRadius !== '0px') pb.push(`r=${ps.borderRadius}`);
        if (pb.length) lines.push(`${'  '.repeat(d)}  ${w} ${pb.join(' | ')}`);
      }
      for (const c of e.children) desc(c, d + 1);
    };
    lines.push(`ROOT: ${root.tagName.toLowerCase()} ${r(root)}`);
    desc(root, 1);
    return lines;
  }, SUB);
  console.log('=== ' + URL + ' [' + SUB + ']');
  out.forEach((l) => console.log(l));
  await browser.close();
})();
