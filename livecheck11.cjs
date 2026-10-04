const { chromium } = require("playwright");

const URL = "https://trova-travel.framer.website/";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);
  const out = await page.evaluate(async () => {
    // scroll a word-group heading into view, then grab its animations' easing
    const words = [...document.querySelectorAll("span")].filter(
      (s) => getComputedStyle(s).opacity === "0.001" && !s.children.length && s.offsetHeight > 0
    );
    if (!words.length) return { err: "no dormant words" };
    const y = words[0].getBoundingClientRect().top + window.scrollY - 400;
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
    const found = [];
    for (const w of words) {
      for (const a of w.getAnimations()) {
        const t = a.effect.getTiming();
        found.push({ txt: w.textContent.slice(0, 10), dur: t.duration, delay: t.delay, easing: t.easing });
      }
      if (found.length >= 3) break;
    }
    // also hero copy easing (load-time, may be done — check appear elements)
    const h1wrap = document.querySelector("[data-framer-appear-id='17g4ef6']");
    const heroAnims = h1wrap ? h1wrap.getAnimations().map((a) => a.effect.getTiming().easing) : [];
    return { found, heroAnims };
  });
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
