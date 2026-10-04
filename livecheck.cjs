const { chromium } = require("playwright");

const URL = "https://trova-travel.framer.website/";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // ---- A: home page load — read the Web Animations API timings Framer creates
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(700);

  const appear = await page.evaluate(() =>
    [...document.querySelectorAll("[data-framer-appear-id]")].map((el) => {
      const a = el.getAnimations()[0] || null;
      const t = a ? a.effect.getTiming() : null;
      let kf = null;
      if (a) {
        const frames = a.effect.getKeyframes();
        const mid = frames[Math.floor(frames.length / 2)];
        kf = {
          count: frames.length,
          first: { off: frames[0].offset, op: frames[0].opacity, tr: frames[0].transform, ease: frames[0].easing },
          mid: { off: mid.offset, op: mid.opacity, tr: mid.transform, ease: mid.easing },
          last: { off: frames[frames.length - 1].offset, op: frames[frames.length - 1].opacity, tr: frames[frames.length - 1].transform },
        };
      }
      return {
        id: el.dataset.framerAppearId,
        tag: el.tagName,
        text: (el.textContent || "").trim().slice(0, 46),
        inline: { op: el.style.opacity, tr: el.style.transform },
        anim: t && { delay: t.delay, dur: t.duration, ease: t.easing, fill: t.fill, iters: t.iterations },
        kf,
      };
    })
  );
  console.log("== HOME appear elements (live) ==");
  console.log(JSON.stringify(appear, null, 1));

  // ---- B: inner page nav (about) — same 0.8s / 1s linear?
  await page.goto(URL + "about", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(700);
  const inner = await page.evaluate(() =>
    [...document.querySelectorAll("[data-framer-appear-id]")].map((el) => {
      const a = el.getAnimations()[0] || null;
      const t = a ? a.effect.getTiming() : null;
      return {
        id: el.dataset.framerAppearId,
        tag: el.tagName,
        text: (el.textContent || "").trim().slice(0, 40),
        anim: t && { delay: t.delay, dur: t.duration, ease: t.easing },
      };
    })
  );
  console.log("== ABOUT appear elements (live) ==");
  console.log(JSON.stringify(inner, null, 1));

  // ---- C: card CTA hover — is there a label roll?
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(400);
  const ctas = await page.evaluate(() =>
    [...document.querySelectorAll("a, button, span")]
      .filter((e) => /^(learn more|view tour|explore tours|find your next hike|book your tour|explore)$/i.test((e.textContent || "").trim()))
      .slice(0, 10)
      .map((e) => ({
        tag: e.tagName,
        cls: (e.className || "").toString().slice(0, 60),
        text: e.textContent.trim(),
        w: e.offsetWidth,
        h: e.offsetHeight,
        html: e.outerHTML.slice(0, 260),
      }))
  );
  console.log("== CTA candidates (home) ==");
  console.log(JSON.stringify(ctas, null, 1));

  const snap = () =>
    page.evaluate(() => {
      const el = [...document.querySelectorAll("a, button, span")].find(
        (e) => /^(learn more|explore)$/i.test((e.textContent || "").trim()) && e.offsetWidth < 260 && e.offsetHeight < 70
      );
      if (!el) return null;
      const one = (n) => ({
        tag: n.tagName,
        text: (n.textContent || "").trim().slice(0, 24),
        op: getComputedStyle(n).opacity,
        tr: getComputedStyle(n).transform,
        pos: getComputedStyle(n).position,
        top: Math.round(n.getBoundingClientRect().top),
      });
      return { root: one(el), kids: [...el.querySelectorAll("*")].slice(0, 6).map(one) };
    });

  const before = await snap();
  const box = await page
    .evaluate(() => {
      const el = [...document.querySelectorAll("a, button, span")].find(
        (e) => /^(learn more|explore)$/i.test((e.textContent || "").trim()) && e.offsetWidth < 260 && e.offsetHeight < 70
      );
      if (!el) return null;
      el.scrollIntoView({ block: "center" });
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    })
    .catch(() => null);
  if (box) {
    await page.waitForTimeout(2000); // let the reveal settle
    await page.mouse.move(box.x, box.y);
    await page.waitForTimeout(60);
    const t60 = await snap();
    await page.waitForTimeout(340);
    const t400 = await snap();
    console.log("== hover snapshot: before ==");
    console.log(JSON.stringify(before, null, 1));
    console.log("== hover snapshot: t+60ms ==");
    console.log(JSON.stringify(t60, null, 1));
    console.log("== hover snapshot: t+400ms ==");
    console.log(JSON.stringify(t400, null, 1));
  } else {
    console.log("== no hoverable card CTA found ==");
  }

  await browser.close();
})();
