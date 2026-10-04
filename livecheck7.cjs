const { chromium } = require("playwright");

const URL = "https://trova-travel.framer.website/";

const animScan = () => {
  const out = [];
  for (const a of document.getAnimations()) {
    if (a.playState !== "running") continue;
    const t = a.effect.getTiming();
    const kf = a.effect.getKeyframes();
    const props = new Set();
    for (const k of kf) Object.keys(k).forEach((p) => !["offset", "easing", "composite", "computedOffset"].includes(p) && props.add(p));
    out.push({
      d: Math.round(t.delay),
      u: t.duration,
      tag: a.effect.target.tagName,
      txt: (a.effect.target.textContent || "").trim().slice(0, 18),
      props: [...props],
      f0: Object.fromEntries(Object.entries(kf[0]).filter(([k]) => !["offset", "easing", "composite", "computedOffset"].includes(k))),
    });
  }
  return out;
};

const group = (list) => {
  const m = {};
  for (const e of list) {
    const k = `d=${e.d}|u=${e.u}|${e.tag}|props=${e.props.join("+")}|f0=${JSON.stringify(e.f0)}`;
    (m[k] ||= []).push(e.txt);
  }
  return Object.entries(m).map(([k, txts]) => ({ key: k, n: txts.length, sample: txts.slice(0, 4) }));
};

(async () => {
  const browser = await chromium.launch();

  // ---- A: hero load — every animation type per target
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(450);
    const s = await page.evaluate(() => {
      const out = [];
      for (const a of document.getAnimations()) {
        if (a.playState !== "running") continue;
        const t = a.effect.getTiming();
        const kf = a.effect.getKeyframes();
        const props = new Set();
        for (const k of kf) Object.keys(k).forEach((p) => !["offset", "easing", "composite", "computedOffset"].includes(p) && props.add(p));
        out.push({ d: Math.round(t.delay), u: t.duration, tag: a.effect.target.tagName, cls: a.effect.target.className.toString().slice(0, 24), txt: (a.effect.target.textContent || "").trim().slice(0, 20), props: [...props], f0: Object.fromEntries(Object.entries(kf[0]).filter(([k]) => !["offset", "easing", "composite", "computedOffset"].includes(k))) });
      }
      return out;
    });
    console.log("== A: hero load running animations @450ms ==");
    console.log(JSON.stringify(group(s), null, 1));
    await page.close();
  }

  // ---- B: home card grid — card reveal shape + stagger + computed transition state
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(3000);
    const res = await page.evaluate(async () => {
      const card = [...document.querySelectorAll("section")].find((s) => (s.getAttribute("data-framer-name") || "").toLowerCase().includes("included"));
      const y = card.getBoundingClientRect().top + window.scrollY - 500;
      const seen = new Map();
      const computed = [];
      const kids = card ? [...card.querySelectorAll("div")].filter((d) => getComputedStyle(d).opacity === "0" && d.offsetHeight > 100).slice(0, 3) : [];
      const iv = setInterval(() => {
        for (const a of document.getAnimations()) {
          if (a.playState !== "running") continue;
          const t = a.effect.getTiming();
          const kf = a.effect.getKeyframes();
          const props = new Set();
          for (const k of kf) Object.keys(k).forEach((p) => !["offset", "easing", "composite", "computedOffset"].includes(p) && props.add(p));
          const key = `d=${Math.round(t.delay)}|u=${t.duration}|${a.effect.target.tagName}|${[...props].join("+")}|${JSON.stringify(Object.fromEntries(Object.entries(kf[0]).filter(([k]) => !["offset", "easing", "composite", "computedOffset"].includes(k))))}`;
          if (!seen.has(key)) seen.set(key, { n: 0, sample: (a.effect.target.textContent || "").trim().slice(0, 16) });
          seen.get(key).n++;
        }
        if (kids[0]) {
          const cs = getComputedStyle(kids[0]);
          computed.push({ t: Math.round(performance.now()), op: +cs.opacity, fil: cs.filter, tr: cs.transform, td: cs.transitionDuration, tt: cs.transitionTimingFunction.slice(0, 40) });
        }
      }, 40);
      await new Promise((r) => {
        const step = () => {
          if (window.scrollY >= y - 4) return r();
          window.scrollTo(0, Math.min(y, window.scrollY + 70));
          setTimeout(step, 45);
        };
        step();
      });
      await new Promise((r) => setTimeout(r, 3000));
      clearInterval(iv);
      return { groups: [...seen.entries()].map(([k, v]) => ({ key: k, ...v })), computed: computed.filter((_, i) => i % 4 === 0) };
    });
    console.log("== B: 'included' card/block reveal animations ==");
    console.log(JSON.stringify(res.groups, null, 1));
    console.log("== B: first block computed during reveal ==");
    console.log(JSON.stringify(res.computed.filter((c) => c.op > 0.001 && c.op < 0.999 || c.fil !== "none"), null, 1));
    await page.close();
  }

  // ---- C: /hikes card grid stagger
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(URL + "hikes", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(3000);
    const res = await page.evaluate(async () => {
      const target = [...document.querySelectorAll("div")].find((d) => getComputedStyle(d).opacity === "0" && d.offsetHeight > 300 && d.offsetWidth > 500);
      if (!target) return { err: "no dormant block", dormant: document.querySelectorAll("*").length };
      const y = target.getBoundingClientRect().top + window.scrollY - 450;
      const seen = new Map();
      const iv = setInterval(() => {
        for (const a of document.getAnimations()) {
          if (a.playState !== "running") continue;
          const t = a.effect.getTiming();
          const kf = a.effect.getKeyframes();
          const props = new Set();
          for (const k of kf) Object.keys(k).forEach((p) => !["offset", "easing", "composite", "computedOffset"].includes(p) && props.add(p));
          const key = `d=${Math.round(t.delay)}|u=${t.duration}|${a.effect.target.tagName}|${[...props].join("+")}|${JSON.stringify(Object.fromEntries(Object.entries(kf[0]).filter(([k]) => !["offset", "easing", "composite", "computedOffset"].includes(k))))}`;
          if (!seen.has(key)) seen.set(key, { n: 0, sample: (a.effect.target.textContent || "").trim().slice(0, 16) });
          seen.get(key).n++;
        }
      }, 30);
      await new Promise((r) => {
        const step = () => {
          if (window.scrollY >= y - 4) return r();
          window.scrollTo(0, Math.min(y, window.scrollY + 70));
          setTimeout(step, 45);
        };
        step();
      });
      await new Promise((r) => setTimeout(r, 3200));
      clearInterval(iv);
      return { groups: [...seen.entries()].map(([k, v]) => ({ key: k, ...v })) };
    });
    console.log("== C: /hikes card reveal animations ==");
    console.log(JSON.stringify(res, null, 1));
    await page.close();
  }

  await browser.close();
})();
