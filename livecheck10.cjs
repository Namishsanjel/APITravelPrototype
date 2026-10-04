const { chromium } = require("playwright");

const URL = "https://trova-travel.framer.website/";

const poller = () => {
  // collect opacity onsets for a set of elements matched by class hint
  window.__onsets = [];
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3000);

  // ---- A: Hikes section — badge / copy / CTA onsets from a jump-scroll (all visible at once)
  const a = await page.evaluate(async () => {
    const sec = [...document.querySelectorAll("section")].find((s) => (s.getAttribute("data-framer-name") || "").toLowerCase().includes("hike"));
    const pick = (cls) => sec.querySelector("." + cls);
    const targets = {
      badge: pick("framer-ktrexi-container"),
      copy: pick("framer-tt0tj2"),
      cta: pick("framer-1j5t0wz-container"),
      card1: sec.querySelectorAll(".framer-11fuoq3-container")[0],
      card2: sec.querySelectorAll(".framer-11fuoq3-container")[1],
      card3: sec.querySelectorAll(".framer-11fuoq3-container")[2],
      card4: sec.querySelectorAll(".framer-11fuoq3-container")[3],
    };
    const keys = Object.keys(targets).filter((k) => targets[k]);
    const onsets = {};
    keys.forEach((k) => (onsets[k] = null));
    const t0 = performance.now();
    const iv = setInterval(() => {
      const t = Math.round(performance.now() - t0);
      for (const k of keys) {
        if (onsets[k] === null && +getComputedStyle(targets[k]).opacity > 0.015) onsets[k] = t;
      }
      if (t > 6000) clearInterval(iv);
    }, 20);
    // position so badge AND cards are both on screen if possible; else just cards
    const badgeTop = targets.badge.getBoundingClientRect().top + window.scrollY;
    const card4 = targets.card4;
    const cardBottom = card4.getBoundingClientRect().top + window.scrollY + card4.offsetHeight;
    let y = badgeTop - 120;
    if (cardBottom - y > 880) y = cardBottom - 880; // squeeze the section into one viewport
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 6200));
    const view = {
      scrollY: Math.round(y),
      badgeInView: (() => { const r = targets.badge.getBoundingClientRect(); return r.top >= 0 && r.bottom <= 900; })(),
      cardsInView: [...Array(4)].map((_, i) => {
        const c = sec.querySelectorAll(".framer-11fuoq3-container")[i];
        if (!c) return null;
        const r = c.getBoundingClientRect();
        return { top: Math.round(r.top), bottom: Math.round(r.bottom) };
      }),
    };
    return { onsets, view, missing: Object.keys(targets).filter((k) => !targets[k]) };
  });
  console.log("== A: Hikes section onsets (jump scroll) ==");
  console.log(JSON.stringify(a, null, 1));

  // ---- B: What's included items — 6 siblings, all in one viewport
  const b = await page.evaluate(async () => {
    const sec = [...document.querySelectorAll("section")].find((s) => (s.getAttribute("data-framer-name") || "").toLowerCase().includes("included"));
    if (!sec) return { err: "no section" };
    const items = [...sec.querySelectorAll("div")].filter((d) => {
      const cs = getComputedStyle(d);
      return cs.opacity === "0" && d.offsetHeight > 80 && d.offsetWidth > 150 && /framer-(i5n2xl|1759y9t|1b1ga88|19crp3u|1g3br1q|1bisg99)-container/.test(d.className);
    });
    if (!items.length) return { err: "no items", cls: sec.querySelector("[class*=container]") && sec.querySelector("[class*=container]").className };
    const t0 = performance.now();
    const onsets = items.map(() => null);
    const iv = setInterval(() => {
      const t = Math.round(performance.now() - t0);
      items.forEach((el, i) => {
        if (onsets[i] === null && +getComputedStyle(el).opacity > 0.015) onsets[i] = t;
      });
      if (t > 6000) clearInterval(iv);
    }, 20);
    const first = items[0].getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, first - 300);
    await new Promise((r) => setTimeout(r, 6200));
    return {
      n: items.length,
      onsets,
      inView: items.map((el) => {
        const r = el.getBoundingClientRect();
        return r.top >= -50 && r.bottom <= 950;
      }),
      texts: items.map((el) => el.textContent.trim().slice(0, 12)),
    };
  });
  console.log("== B: 'included' item onsets ==");
  console.log(JSON.stringify(b, null, 1));

  // ---- C: /hikes grid — 4 cards side by side
  await page.goto(URL + "hikes", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);
  const c = await page.evaluate(async () => {
    const cards = [...document.querySelectorAll("div")].filter((d) => {
      const cs = getComputedStyle(d);
      return cs.opacity === "0" && d.querySelector("img") && d.offsetHeight > 250 && d.offsetWidth > 250;
    });
    if (!cards.length) return { err: "none" };
    const t0 = performance.now();
    const onsets = cards.map(() => null);
    const iv = setInterval(() => {
      const t = Math.round(performance.now() - t0);
      cards.forEach((el, i) => {
        if (onsets[i] === null && +getComputedStyle(el).opacity > 0.015) onsets[i] = t;
      });
      if (t > 6000) clearInterval(iv);
    }, 20);
    // jump so the first 4 cards are all visible
    const top = cards[0].getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top - 350);
    await new Promise((r) => setTimeout(r, 6200));
    return {
      n: cards.length,
      onsets,
      geometry: cards.slice(0, 6).map((el) => {
        const r = el.getBoundingClientRect();
        return { top: Math.round(r.top), left: Math.round(r.left) };
      }),
      inView: cards.map((el) => {
        const r = el.getBoundingClientRect();
        return r.top >= -50 && r.bottom <= 950;
      }),
    };
  });
  console.log("== C: /hikes card onsets (jump scroll) ==");
  console.log(JSON.stringify(c, null, 1));

  await browser.close();
})();
