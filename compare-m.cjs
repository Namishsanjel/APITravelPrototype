// Compare text + image geometry/styles between the original mirror and the port.
// Usage: node compare.cjs <originalUrl> <portUrl> [tolerance]
const { chromium } = require('playwright');

const urlA = process.argv[2];
const urlB = process.argv[3];
const TOL = Number(process.argv[4] || 3);

async function extract(page, url) {
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
    const round = (n) => Math.round(n * 10) / 10;
    const texts = [];
    for (const el of document.querySelectorAll('h1,h2,h3,h4,h5,p,a,button,span,div,li')) {
      const direct = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!direct) continue;
      const t = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60);
      if (!t) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 10 || r.height < 6) continue;
      const cs = getComputedStyle(el);
      texts.push({
        tag: el.tagName.toLowerCase(),
        t,
        x: Math.round(r.x), y: Math.round(r.y + window.scrollY),
        w: Math.round(r.width), h: Math.round(r.height),
        fam: cs.fontFamily.split(',')[0].replace(/"/g, ''),
        fs: cs.fontSize, lh: cs.lineHeight, fw: cs.fontWeight,
        ls: cs.letterSpacing, color: cs.color, al: cs.textAlign,
        raw: round(r.y + window.scrollY),
      });
    }
    const imgs = [];
    for (const img of document.images) {
      const r = img.getBoundingClientRect();
      if (r.width < 4) continue;
      const cs = getComputedStyle(img);
      imgs.push({
        src: (img.currentSrc || img.src).split('/').pop().split('?')[0].slice(0, 34),
        x: Math.round(r.x), y: Math.round(r.y + window.scrollY),
        w: Math.round(r.width), h: Math.round(r.height),
        fit: cs.objectFit,
      });
    }
    return { texts, imgs, docH: document.body.scrollHeight };
  });
}

function pairUp(a, b) {
  const byKey = new Map();
  for (const it of b) {
    const k = it.tag + '|' + it.t;
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k).push(it);
  }
  const pairs = [];
  const unmatchedA = [];
  for (const it of a) {
    const k = it.tag + '|' + it.t;
    const list = byKey.get(k);
    if (list && list.length) {
      // take the closest by y
      let best = 0, bd = Infinity;
      list.forEach((c, i) => {
        const d = Math.abs(c.y - it.y);
        if (d < bd) { bd = d; best = i; }
      });
      pairs.push([it, list.splice(best, 1)[0]]);
    } else {
      unmatchedA.push(it);
    }
  }
  const unmatchedB = [];
  for (const list of byKey.values()) unmatchedB.push(...list);
  return { pairs, unmatchedA, unmatchedB };
}

(async () => {
  const browser = await chromium.launch();
  const ctxA = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const ctxB = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const A = await extract(await ctxA.newPage(), urlA);
  const B = await extract(await ctxB.newPage(), urlB);

  console.log(`doc height: original=${A.docH} port=${B.docH} (delta ${B.docH - A.docH})`);
  console.log(`text nodes: original=${A.texts.length} port=${B.texts.length}`);

  const { pairs, unmatchedA, unmatchedB } = pairUp(A.texts, B.texts);
  const bad = [];
  for (const [a, b] of pairs) {
    const dx = b.x - a.x, dy = b.y - a.y, dw = b.w - a.w, dh = b.h - a.h;
    const style = [];
    if (a.fam !== b.fam) style.push(`font ${a.fam}->${b.fam}`);
    if (a.fs !== b.fs) style.push(`size ${a.fs}->${b.fs}`);
    if (a.lh !== b.lh) style.push(`lh ${a.lh}->${b.lh}`);
    if (a.fw !== b.fw) style.push(`wt ${a.fw}->${b.fw}`);
    if (a.ls !== b.ls) style.push(`ls ${a.ls}->${b.ls}`);
    if (a.color !== b.color) style.push(`color ${a.color}->${b.color}`);
    if (a.al !== b.al) style.push(`align ${a.al}->${b.al}`);
    if (Math.abs(dx) > TOL || Math.abs(dy) > TOL || Math.abs(dw) > TOL || Math.abs(dh) > TOL || style.length) {
      bad.push({ a, b, dx, dy, dw, dh, style });
    }
  }

  bad.sort((p, q) => Math.abs(q.dy) + Math.abs(q.dx) - Math.abs(p.dy) - Math.abs(p.dx));
  console.log(`\n--- ${bad.length} text mismatches (tolerance ${TOL}px) ---`);
  for (const m of bad.slice(0, 80)) {
    console.log(
      `y${m.a.y}->${m.b.y} (${m.dy >= 0 ? '+' : ''}${m.dy}) x${m.a.x}->${m.b.x} (${m.dx >= 0 ? '+' : ''}${m.dx}) ` +
      `w${m.a.w}->${m.b.w} h${m.a.h}->${m.b.h} [${m.a.tag}] "${m.a.t.slice(0, 40)}"` +
      (m.style.length ? `\n      ${m.style.join('; ')}` : '')
    );
  }
  if (unmatchedA.length) {
    console.log(`\n--- ${unmatchedA.length} texts only in ORIGINAL ---`);
    unmatchedA.slice(0, 40).forEach((t) => console.log(`  [${t.tag}] y${t.y} x${t.x} "${t.t.slice(0, 50)}"`));
  }
  if (unmatchedB.length) {
    console.log(`\n--- ${unmatchedB.length} texts only in PORT ---`);
    unmatchedB.slice(0, 40).forEach((t) => console.log(`  [${t.tag}] y${t.y} x${t.x} "${t.t.slice(0, 50)}"`));
  }

  // images
  const { pairs: ipairs, unmatchedA: iua, unmatchedB: iub } = pairUp(
    A.imgs.map((i) => ({ ...i, tag: 'img', t: i.src })),
    B.imgs.map((i) => ({ ...i, tag: 'img', t: i.src }))
  );
  const ibad = ipairs.filter(([a, b]) =>
    Math.abs(b.x - a.x) > 3 || Math.abs(b.y - a.y) > 3 || Math.abs(b.w - a.w) > 3 || Math.abs(b.h - a.h) > 3 || a.fit !== b.fit
  );
  console.log(`\n--- images: ${ibad.length} mismatched of ${ipairs.length} ---`);
  ibad.forEach(([a, b]) =>
    console.log(`  ${a.src}: orig ${a.x},${a.y} ${a.w}x${a.h} ${a.fit} | port ${b.x},${b.y} ${b.w}x${b.h} ${b.fit}`)
  );
  if (iua.length) { console.log('  only in original:'); iua.forEach((i) => console.log(`    ${i.src} y${i.y} ${i.w}x${i.h}`)); }
  if (iub.length) { console.log('  only in port:'); iub.forEach((i) => console.log(`    ${i.src} y${i.y} ${i.w}x${i.h}`)); }

  await browser.close();
})();
