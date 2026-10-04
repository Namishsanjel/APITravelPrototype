const { chromium } = require("playwright");

const URL = "https://trova-travel.framer.website/";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3000);

  // ---- 1: what is hidden vs visible deep inside below-fold sections at rest?
  const census = await page.evaluate(() => {
    const hidden = [];
    const visible = [];
    for (const s of document.querySelectorAll("section")) {
      const absTop = s.getBoundingClientRect().top + window.scrollY;
      if (absTop < 1500) continue; // below fold only
      for (const el of s.querySelectorAll("*")) {
        if (!el.children.length && getComputedStyle(el).display === "none") continue;
        const op = getComputedStyle(el).opacity;
        const rec = { tag: el.tagName, cls: el.className.toString().slice(0, 30), txt: (el.textContent || "").trim().slice(0, 26), op };
        if (op === "0") hidden.push(rec);
        else if (op === "1" && el.offsetWidth > 40 && el.offsetHeight > 20) visible.push(rec);
      }
    }
    return {
      hiddenN: hidden.length,
      hiddenSample: hidden.slice(0, 30),
      visibleN: visible.length,
      visibleSample: visible.slice(0, 25),
    };
  });
  console.log("== census: below-fold deep elements at rest ==");
  console.log(JSON.stringify(census, null, 1));

  // ---- 2: card stagger — poll every dormant card's opacity, find onsets
  const stagger = await page.evaluate(async () => {
    const cards = [...document.querySelectorAll("div, a")].filter((d) => {
      const cs = getComputedStyle(d);
      return cs.opacity === "0" && d.querySelector("img") && d.offsetHeight > 150 && d.offsetWidth > 150 && d.offsetWidth < 750;
    });
    if (!cards.length) return { err: "none" };
    const idx = new Map(cards.map((c, i) => [c, i]));
    const onsets = new Array(cards.length).fill(null);
    const samples = [];
    const t0 = performance.now();
    const iv = setInterval(() => {
      const t = Math.round(performance.now() - t0);
      const vals = cards.map((c) => +getComputedStyle(c).opacity);
      samples.push({ t, vals });
      vals.forEach((v, i) => {
        if (onsets[i] === null && v > 0.015) onsets[i] = { t, v };
      });
      if (t > 7000) clearInterval(iv);
    }, 25);
    // scroll the cards into view
    const y = cards[0].getBoundingClientRect().top + window.scrollY - 380;
    await new Promise((r) => {
      const step = () => {
        if (window.scrollY >= y - 4) return r();
        window.scrollTo(0, Math.min(y, window.scrollY + 60));
        setTimeout(step, 40);
      };
      step();
    });
    await new Promise((r) => setTimeout(r, 7200));
    return {
      n: cards.length,
      onsets: onsets.map((o, i) => ({ i, t: o && o.t })),
      // condensed track: every 400ms
      track: samples.filter((s) => s.t % 400 < 30).map((s) => ({ t: s.t, vals: s.vals.map((v) => +v.toFixed(3)) })),
    };
  });
  console.log("== card stagger (home) ==");
  console.log(JSON.stringify(stagger, null, 1));

  // ---- 3: precise roll timing — in-page interval, real hover
  const roll = await page.evaluate(() => {
    const el = [...document.querySelectorAll("a")].find((e) => /learn more/i.test(e.textContent) && e.offsetHeight < 80);
    if (!el) return null;
    el.scrollIntoView({ block: "center" });
    const wrap = [...el.querySelectorAll("div")].find((d) => {
      const k = [...d.children].filter((c) => c.textContent.trim());
      return k.length === 2 && k[0].textContent.trim() === k[1].textContent.trim();
    });
    const kid = wrap.children[0];
    window.__roll = [];
    const t0 = performance.now();
    const iv = setInterval(() => {
      const cs = getComputedStyle(kid);
      const m = /matrix\(1, 0, 0, 1, 0, (-?[\d.]+)\)/.exec(cs.transform);
      window.__roll.push({ t: Math.round(performance.now() - t0), y: m ? +m[1] : cs.transform });
      if (performance.now() - t0 > 2500) clearInterval(iv);
    }, 16);
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), start: performance.now() };
  });
  if (roll) {
    await page.mouse.move(roll.x - 500, roll.y);
    await page.waitForTimeout(900);
    // restart sampler right before hover
    await page.evaluate(() => {
      clearInterval(window.__iv2);
      const el = [...document.querySelectorAll("a")].find((e) => /learn more/i.test(e.textContent) && e.offsetHeight < 80);
      const wrap = [...el.querySelectorAll("div")].find((d) => {
        const k = [...d.children].filter((c) => c.textContent.trim());
        return k.length === 2 && k[0].textContent.trim() === k[1].textContent.trim();
      });
      const kid = wrap.children[0];
      window.__roll = [];
      const t0 = performance.now();
      window.__iv2 = setInterval(() => {
        const cs = getComputedStyle(kid);
        const m = /matrix\(1, 0, 0, 1, 0, (-?[\d.]+)\)/.exec(cs.transform);
        window.__roll.push({ t: Math.round(performance.now() - t0), y: m ? +m[1] : cs.transform, td: cs.transitionDuration, tt: cs.transitionTimingFunction });
        if (performance.now() - t0 > 2000) clearInterval(window.__iv2);
      }, 16);
    });
    await page.mouse.move(roll.x, roll.y, { steps: 2 });
    await page.waitForTimeout(1400);
    const data = await page.evaluate(() => {
      clearInterval(window.__iv2);
      return window.__roll;
    });
    const compact = data.filter((d, i) => i % 3 === 0 || (d.y !== "none" && d.y > 0));
    console.log("== roll timeline (16ms) ==");
    console.log(JSON.stringify(compact.slice(0, 60), null, 0));
    const ys = data.filter((d) => typeof d.y === "number");
    if (ys.length) {
      const start = ys[0].y;
      const at = (ms) => (ys.find((d) => d.t >= ms) || {}).y;
      console.log("roll fit:", JSON.stringify({ start, n: ys.length, t50: at(50), t100: at(100), t150: at(150), t200: at(200), t300: at(300), t400: at(400), t600: at(600), last: ys[ys.length - 1] }));
    }
  }

  await browser.close();
})();
