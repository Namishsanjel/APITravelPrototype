const { chromium } = require("playwright");

const URL = "https://trova-travel.framer.website/";

const collect = async (page, scrollTo) => {
  await page.goto(URL + scrollTo.path, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3000);
  return page.evaluate(async (target) => {
    // find the target section by name/keyword, scroll it into view gradually
    const secs = [...document.querySelectorAll("section")];
    const s = secs.find((x) => (x.getAttribute("data-framer-name") || "").toLowerCase().includes(target.kw)) || secs[target.idx || 1];
    const y = s.getBoundingClientRect().top + window.scrollY - 600;
    const seen = new Map();
    const iv = setInterval(() => {
      for (const a of document.getAnimations()) {
        if (a.playState !== "running") continue;
        const t = a.effect.getTiming();
        const kf = a.effect.getKeyframes();
        const props = new Set();
        for (const k of kf) Object.keys(k).forEach((p) => !["offset", "easing", "composite"].includes(p) && props.add(p));
        const key = JSON.stringify({
          d: Math.round(t.delay),
          u: t.duration,
          e: String(t.easing).slice(0, 18),
          n: kf.length,
          props: [...props],
          f0: Object.fromEntries(Object.entries(kf[0]).filter(([k]) => !["offset", "easing", "composite"].includes(k))),
          fl: Object.fromEntries(Object.entries(kf[kf.length - 1]).filter(([k]) => !["offset", "easing", "composite"].includes(k))),
          txt: (a.effect.target.textContent || "").trim().slice(0, 16),
        });
        if (!seen.has(key)) seen.set(key, { count: 0, props: [...props] });
        seen.get(key).count++;
      }
    }, 30);
    await new Promise((res) => {
      const step = () => {
        if (window.scrollY >= y - 4) return res();
        window.scrollTo(0, Math.min(y, window.scrollY + 80));
        setTimeout(step, 50);
      };
      step();
    });
    await new Promise((r) => setTimeout(r, 3000));
    clearInterval(iv);
    return [...seen.entries()].map(([k, v]) => ({ ...JSON.parse(k), hits: v.count }));
  }, scrollTo);
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const home = await collect(page, { path: "", kw: "hike" });
  console.log("== HOME 'Hikes' section animations (delays = stagger) ==");
  console.log(JSON.stringify(home, null, 1));

  const inc = await collect(page, { path: "", kw: "included" });
  console.log("== HOME 'What's included' animations ==");
  console.log(JSON.stringify(inc, null, 1));

  const hikes = await collect(page, { path: "hikes", kw: "" , idx: 1});
  console.log("== /hikes listing animations ==");
  console.log(JSON.stringify(hikes, null, 1));

  await browser.close();
})();
