const { chromium } = require("playwright");

const URL = "https://trova-travel.framer.website/";

const scan = () => {
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
      cls: a.effect.target.className.toString().slice(0, 26),
      props: [...props],
      f0: Object.fromEntries(Object.entries(kf[0]).filter(([k]) => !["offset", "easing", "composite", "computedOffset"].includes(k))),
      txt: (a.effect.target.textContent || "").trim().slice(0, 14),
    });
  }
  return out;
};

const group = (list) => {
  const m = {};
  for (const e of list) {
    const k = `d=${e.d}|u=${e.u}|${e.tag}|${e.props.join("+")}|f0=${JSON.stringify(e.f0)}`;
    (m[k] ||= { n: 0, cls: e.cls, txts: [] });
    m[k].n++;
    if (m[k].txts.length < 3) m[k].txts.push(e.txt);
  }
  return Object.entries(m).map(([key, v]) => ({ key, ...v }));
};

(async () => {
  const browser = await chromium.launch();

  for (const [label, path] of [
    ["HOME cards", ""],
    ["/hikes cards", "hikes"],
  ]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(URL + path, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(3000);

    const res = await page.evaluate(async () => {
      // dormant cards = opacity 0 blocks that contain an image and are card-sized
      const cards = [...document.querySelectorAll("div, a")].filter((d) => {
        const cs = getComputedStyle(d);
        return cs.opacity === "0" && d.querySelector("img") && d.offsetHeight > 180 && d.offsetWidth > 200 && d.offsetWidth < 700;
      });
      if (!cards.length) return { err: "no dormant cards", sample: [...document.querySelectorAll("*")].filter((e) => getComputedStyle(e).opacity === "0").length };
      const first = cards[0];
      const y = first.getBoundingClientRect().top + window.scrollY - 420;
      const seen = new Map();
      const track = [];
      const iv = setInterval(() => {
        for (const a of document.getAnimations()) {
          if (a.playState !== "running") continue;
          const t = a.effect.getTiming();
          const kf = a.effect.getKeyframes();
          const props = new Set();
          for (const k of kf) Object.keys(k).forEach((p) => !["offset", "easing", "composite", "computedOffset"].includes(p) && props.add(p));
          const key = `d=${Math.round(t.delay)}|u=${t.duration}|${a.effect.target.tagName}|${[...props].join("+")}|${JSON.stringify(Object.fromEntries(Object.entries(kf[0]).filter(([k]) => !["offset", "easing", "composite", "computedOffset"].includes(k))))}`;
          if (!seen.has(key)) seen.set(key, { n: 0, cls: a.effect.target.className.toString().slice(0, 26), txt: (a.effect.target.textContent || "").trim().slice(0, 14) });
          seen.get(key).n++;
        }
        const cs = getComputedStyle(first);
        track.push({ t: Math.round(performance.now()), op: +cs.opacity, fil: cs.filter, tr: cs.transform, td: cs.transitionDuration });
      }, 35);
      await new Promise((r) => {
        const step = () => {
          if (window.scrollY >= y - 4) return r();
          window.scrollTo(0, Math.min(y, window.scrollY + 60));
          setTimeout(step, 40);
        };
        step();
      });
      await new Promise((r) => setTimeout(r, 3500));
      clearInterval(iv);
      return {
        nCards: cards.length,
        groups: [...seen.entries()].map(([key, v]) => ({ key, ...v })),
        track: track.filter((p, i) => i % 5 === 0),
      };
    });
    console.log(`== ${label} ==`);
    console.log(JSON.stringify(res, null, 1));
    await page.close();
  }

  await browser.close();
})();
