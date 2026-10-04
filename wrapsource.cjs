// Which CSS rules set text-wrap, and does p1/p2 match them? Ref vs port.
const { chromium } = require('playwright');
const [A, B] = process.argv.slice(2);

const PROBE = async (page, url) => {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(3000);
  return page.evaluate(() => {
    const targets = [
      ['p1', (e) => (e.textContent || '').trim().startsWith('API Touch began')],
      ['p2', (e) => (e.textContent || '').trim().startsWith('What started as informal')],
      ['heroP', (e) => (e.textContent || '').trim().startsWith('Meet the passionate')],
      ['h2why', (e) => (e.textContent || '').trim().startsWith('What sets every')],
      ['whyP', (e) => (e.textContent || '').trim().startsWith('Thoughtfully crafted')],
      ['h2guide', (e) => (e.textContent || '').trim().startsWith('Experts who know')],
      ['guideP', (e) => (e.textContent || '').trim().startsWith('From hidden viewpoints')],
      ['faqP', (e) => (e.textContent || '').trim().startsWith('From packing lists')],
      ['ctaP', (e) => (e.textContent || '').trim().startsWith('Explore remote landscapes')],
      ['footP', (e) => (e.textContent || '').trim().startsWith('Guided hikes')],
    ];
    const rules = []; // {sel, textWrap}
    for (const sheet of [...document.styleSheets]) {
      let list;
      try { list = sheet.cssRules; } catch { continue; }
      const walk = (rs) => {
        for (const r of [...rs]) {
          if (r.cssRules) walk(r.cssRules);
          if (r instanceof CSSStyleRule && r.style.textWrap) {
            rules.push({ sel: r.selectorText, tw: r.style.textWrap, href: (sheet.href || 'inline').slice(-40) });
          }
        }
      };
      walk(list);
    }
    const out = { rules, els: [] };
    for (const [name, match] of targets) {
      const cands = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6,p')].filter(match);
      const el = cands[cands.length - 1];
      if (!el) { out.els.push({ name, err: 'not found' }); continue; }
      const cs = getComputedStyle(el);
      const matched = rules.filter((r) => { try { return el.matches(r.sel); } catch { return false; } });
      out.els.push({
        name,
        tag: el.tagName,
        cls: (el.className || '').toString().slice(0, 60),
        inline: el.style.textWrap || '',
        computed: cs.textWrap,
        matched: matched.map((r) => `${r.sel.slice(0, 70)} => ${r.tw}`),
      });
    }
    return out;
  });
};

(async () => {
  const browser = await chromium.launch();
  for (const [label, url] of [['A(ref)', A], ['B(port)', B]]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const res = await PROBE(page, url);
    console.log(label + '=' + url);
    res.rules.forEach((r) => console.log(`  RULE ${r.tw} :: ${r.sel.slice(0, 100)} [${r.href}]`));
    res.els.forEach((e) => {
      if (e.err) return console.log(`  ${e.name}: ${e.err}`);
      console.log(`  ${e.name} <${e.tag}> computed=${e.computed} inline="${e.inline}" cls="${e.cls}"`);
      e.matched.forEach((m) => console.log(`      matches: ${m}`));
    });
    await page.close();
  }
  await browser.close();
})();
