const { chromium } = require("playwright");

const URL = "https://trova-travel.framer.website/";

const snapFn = () => {
  const one = (n) => {
    const cs = getComputedStyle(n);
    const r = n.getBoundingClientRect();
    return {
      tag: n.tagName,
      cls: (n.className || "").toString().slice(0, 40),
      text: (n.textContent || "").trim().slice(0, 26),
      op: cs.opacity,
      tr: cs.transform,
      pos: cs.position,
      top: Math.round(r.top),
      h: Math.round(r.height),
    };
  };
  const all = [...document.querySelectorAll("a, button, span, div, p, h1")];
  const el = all.find((e) => {
    const kids = [...e.children].filter((k) => k.textContent.trim());
    if (kids.length < 2) return false;
    const t = kids.map((k) => k.textContent.trim());
    return t[0] && t[0] === t[1] && e.offsetHeight < 90;
  });
  if (!el) return null;
  return { root: one(el), kids: [...el.children].map(one) };
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2600); // let the load sequence finish

  // ---- 1: hero eyebrow — does it exist, does it animate?
  const eyebrow = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const hero = h1 && (h1.closest("section") || h1.parentElement.parentElement);
    const leaf = [...(hero ? hero.querySelectorAll("*") : [])].filter(
      (e) => !e.children.length && /Global Expeditions|Est\. Wild/i.test(e.textContent)
    );
    const wrap = leaf[0] ? leaf[0].closest("[data-framer-appear-id]") : null;
    return {
      heroText: hero ? hero.innerText.slice(0, 260) : null,
      eyebrowFound: leaf.length > 0,
      eyebrowText: leaf[0] ? leaf[0].textContent.trim() : null,
      inAppearWrapper: !!wrap,
      appearId: wrap ? wrap.dataset.framerAppearId : null,
      appearAnim: wrap && wrap.getAnimations()[0] ? wrap.getAnimations()[0].effect.getTiming().delay : null,
      opacityNow: leaf[0] ? getComputedStyle(leaf[0]).opacity : null,
    };
  });
  console.log("== eyebrow / hero text (live) ==");
  console.log(JSON.stringify(eyebrow, null, 1));

  // ---- 2: stacked-label (roll) candidates on the home page
  const rolls = await page.evaluate(() => {
    const out = [];
    for (const e of document.querySelectorAll("a, button, span, div")) {
      const kids = [...e.children].filter((k) => k.textContent.trim());
      if (kids.length < 2) continue;
      const t = kids.map((k) => k.textContent.trim());
      if (!t[0] || t[0] !== t[1]) continue;
      if (e.offsetHeight > 90) continue;
      out.push({
        tag: e.tagName,
        cls: (e.className || "").toString().slice(0, 60),
        text: t[0],
        w: e.offsetWidth,
        h: e.offsetHeight,
        html: e.outerHTML.slice(0, 340),
      });
      if (out.length >= 8) break;
    }
    return out;
  });
  console.log("== stacked-label candidates (live home) ==");
  console.log(JSON.stringify(rolls, null, 1));

  // ---- 3: hover the first stacked CTA, sample the roll
  const box = await page.evaluate(() => {
    const all = [...document.querySelectorAll("a, button, span, div, p, h1")];
    const el = all.find((e) => {
      const kids = [...e.children].filter((k) => k.textContent.trim());
      if (kids.length < 2) return false;
      const t = kids.map((k) => k.textContent.trim());
      return t[0] && t[0] === t[1] && e.offsetHeight < 90;
    });
    if (!el) return null;
    el.scrollIntoView({ block: "center" });
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, text: el.textContent.trim() };
  });

  if (box) {
    await page.mouse.move(box.x - 400, box.y - 300); // park away first
    await page.waitForTimeout(400);
    const before = await page.evaluate(snapFn);
    await page.mouse.move(box.x, box.y, { steps: 4 });
    await page.waitForTimeout(70);
    const t70 = await page.evaluate(snapFn);
    await page.waitForTimeout(330);
    const t400 = await page.evaluate(snapFn);
    console.log("== hover target ==", JSON.stringify(box));
    console.log("== before ==", JSON.stringify(before, null, 1));
    console.log("== t+70ms ==", JSON.stringify(t70, null, 1));
    console.log("== t+400ms ==", JSON.stringify(t400, null, 1));
  } else {
    console.log("== no stacked CTA found ==");
  }

  await browser.close();
})();
