const { chromium } = require("playwright");

const URL = "https://trova-travel.framer.website/";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3000); // load sequence done

  // ---- 1: eyebrow — does the original hero have one, and does it animate?
  const eyebrow = await page.evaluate(() => {
    const leaf = [...document.querySelectorAll("body *")].filter(
      (e) => !e.children.length && /Global Expeditions|Est\. Wild/i.test(e.textContent)
    );
    const heroH1 = [...document.querySelectorAll("h1")].find((h) => /Go Where the Trail Ends/.test(h.textContent));
    const hero = heroH1 ? heroH1.closest("section") || heroH1.parentElement : null;
    const wrap = leaf[0] ? leaf[0].closest("[data-framer-appear-id]") : null;
    return {
      foundAnywhere: leaf.length > 0,
      text: leaf[0] ? leaf[0].textContent.trim() : null,
      opacity: leaf[0] ? getComputedStyle(leaf[0]).opacity : null,
      inAppearWrapper: !!wrap,
      heroText: hero ? hero.innerText.slice(0, 300) : null,
      heroId: hero ? hero.getAttribute("data-framer-name") : null,
    };
  });
  console.log("== eyebrow ==");
  console.log(JSON.stringify(eyebrow, null, 1));

  // ---- 2: below-fold blocks BEFORE scrolling — hidden (scroll reveal) or visible?
  const below = await page.evaluate(() => {
    const secs = [...document.querySelectorAll("main section, body > div > section, section")];
    const out = [];
    let y = 0;
    for (const s of secs) {
      const r = s.getBoundingClientRect();
      const absTop = r.top + window.scrollY;
      if (absTop < 1400) continue; // skip above/near fold
      const kids = [...s.children];
      out.push({
        name: s.getAttribute("data-framer-name") || s.className.toString().slice(0, 30),
        absTop: Math.round(absTop),
        kids: kids.slice(0, 6).map((k) => {
          const cs = getComputedStyle(k);
          return {
            tag: k.tagName,
            cls: k.className.toString().slice(0, 28),
            op: cs.opacity,
            tr: cs.transform,
            td: cs.transitionDuration,
            tt: cs.transitionTimingFunction,
            inlineOp: k.style.opacity || null,
            appear: k.hasAttribute("data-framer-appear-id"),
          };
        }),
      });
      if (out.length >= 5) break;
    }
    y = window.scrollY;
    return { scrollY: y, sections: out };
  });
  console.log("== below-fold section children (before scroll) ==");
  console.log(JSON.stringify(below, null, 1));

  // ---- 3: scroll one below-fold block into view and sample its reveal
  const target = await page.evaluate(() => {
    const secs = [...document.querySelectorAll("section")];
    const s = secs.find((x) => x.getBoundingClientRect().top + window.scrollY > 1400);
    if (!s) return null;
    const kid = s.children[0] || s;
    const r = kid.getBoundingClientRect();
    window.scrollTo({ top: r.top + window.scrollY - 500, behavior: "instant" });
    return {
      tag: kid.tagName,
      cls: kid.className.toString().slice(0, 40),
      text: (kid.innerText || "").slice(0, 60),
      pre: { op: getComputedStyle(kid).opacity, tr: getComputedStyle(kid).transform },
      y: window.scrollY,
    };
  });
  console.log("== reveal target (after jump-scroll to 500px above) ==");
  console.log(JSON.stringify(target, null, 1));

  if (target) {
    // sample the element now sitting near the fold over 1.8s
    const frames = await page.evaluate(
      () =>
        new Promise((resolve) => {
          const secs = [...document.querySelectorAll("section")];
          const s = secs.find((x) => x.getBoundingClientRect().top + window.scrollY > 900 && x.getBoundingClientRect().top < 900);
          const el = s ? s.children[0] || s : null;
          if (!el) return resolve(null);
          const t0 = performance.now();
          const out = [];
          const tick = () => {
            const cs = getComputedStyle(el);
            out.push({ t: Math.round(performance.now() - t0), op: +cs.opacity, tr: cs.transform, td: cs.transitionDuration, tt: cs.transitionTimingFunction });
            if (performance.now() - t0 < 1800) requestAnimationFrame(tick);
            else resolve(out);
          };
          requestAnimationFrame(tick);
        })
    );
    if (frames) {
      const first = frames[0];
      const last = frames[frames.length - 1];
      const onset = frames.find((f) => f.op > (first.op + 1) * 0.02 && f.op > first.op * 1.5);
      const done = frames.find((f) => f.op > 0.99);
      const mid = frames[Math.floor(frames.length / 2)];
      console.log("== reveal frames ==");
      console.log(JSON.stringify({ first, onset, mid, last, doneT: done && done.t, n: frames.length }, null, 1));
      console.log("== reveal frames sample (every 6th) ==");
      console.log(JSON.stringify(frames.filter((_, i) => i % 6 === 0), null, 1));
    } else {
      console.log("== no reveal target visible after scroll ==");
    }
  }

  // ---- 4: roll coverage — how many doubled labels sit in buttons site-wide?
  const rolls = await page.evaluate(() => {
    const out = [];
    for (const e of document.querySelectorAll("a, button, span, div")) {
      const kids = [...e.children].filter((k) => k.textContent.trim());
      if (kids.length < 2) continue;
      const t = kids.map((k) => k.textContent.trim());
      if (!t[0] || t[0] !== t[1]) continue;
      if (e.offsetHeight > 90 || e.offsetWidth > 300) continue;
      const btn = e.closest("a, button");
      out.push({
        text: t[0],
        inAnchor: !!btn,
        btnCls: btn ? btn.className.toString().slice(0, 50) : null,
        winH: e.offsetHeight,
        kidH: kids[0].offsetHeight,
      });
    }
    return { count: out.length, uniq: [...new Set(out.map((o) => o.text))], sample: out.slice(0, 12) };
  });
  console.log("== roll coverage (home) ==");
  console.log(JSON.stringify(rolls, null, 1));

  // ---- 5: roll mechanics — time the transform on hover
  await page.evaluate(() => {
    const all = [...document.querySelectorAll("a, button, span, div, p, h1")];
    const el = all.find((e) => {
      const kids = [...e.children].filter((k) => k.textContent.trim());
      if (kids.length < 2) return false;
      const t = kids.map((k) => k.textContent.trim());
      return t[0] && t[0] === t[1] && e.offsetHeight < 90 && /learn more/i.test(t[0]);
    });
    if (el) {
      el.scrollIntoView({ block: "center" });
      window.__rollTarget = el;
    }
  });
  await page.waitForTimeout(2200);
  const timed = await page.evaluate(async () => {
    const el = window.__rollTarget;
    if (!el) return null;
    const kid = el.children[0];
    const r = el.getBoundingClientRect();
    const opts = { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    const snap = () => ({ t: Math.round(performance.now() - t0), tr: getComputedStyle(kid).transform, rootTr: getComputedStyle(el).transform });
    const t0 = performance.now();
    const out = [];
    // dispatch hover
    el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true, clientX: opts.x, clientY: opts.y }));
    return await new Promise((res) => {
      const tick = () => {
        out.push(snap());
        if (performance.now() - t0 < 700) requestAnimationFrame(tick);
        else res({ samples: out.filter((_, i) => i % 4 === 0), n: out.length, html: el.outerHTML.slice(0, 500) });
      };
      requestAnimationFrame(tick);
    });
  });
  console.log("== roll timing (mouseover) ==");
  console.log(JSON.stringify(timed, null, 1));

  await browser.close();
})();
