const { chromium } = require("playwright");

const URL = "https://trova-travel.framer.website/";

const histogram = () => {
  const map = {};
  const hidden = [];
  for (const e of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(e);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const op = cs.opacity;
    map[op] = (map[op] || 0) + 1;
    if (op !== "1") {
      hidden.push({
        tag: e.tagName,
        cls: (e.className || "").toString().slice(0, 34),
        text: (e.textContent || "").trim().slice(0, 34),
        op,
        tr: cs.transform,
        inlineOp: e.style.opacity || null,
        appear: e.hasAttribute("data-framer-appear-id"),
        td: cs.transitionDuration,
      });
    }
  }
  const running = document
    .getAnimations()
    .filter((a) => a.playState === "running")
    .map((a) => {
      const t = a.effect.getTiming();
      return { target: (a.effect.target && a.effect.target.className.toString().slice(0, 30)) || "?", delay: t.delay, dur: t.duration, ease: t.easing };
    });
  return { hist: map, hiddenCount: hidden.length, hidden: hidden.slice(0, 14), running };
};

(async () => {
  const browser = await chromium.launch();

  for (const path of ["", "hikes", "journal", "about", "gallery"]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(URL + path, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(3200);
    const r = await page.evaluate(histogram);
    console.log(`== /${path || ""} opacity histogram after load ==`);
    console.log(JSON.stringify(r, null, 1));
    await page.close();
  }

  // ---- roll timing with a REAL mouse on a card "learn more"
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2600);

  const pos = await page.evaluate(() => {
    const all = [...document.querySelectorAll("a")];
    const el = all.find((e) => /learn more/i.test(e.textContent) && e.offsetHeight < 80);
    if (!el) return null;
    el.scrollIntoView({ block: "center" });
    const r = el.getBoundingClientRect();
    const wrap = [...el.querySelectorAll("div")].find((d) => {
      const k = [...d.children].filter((c) => c.textContent.trim());
      return k.length === 2 && k[0].textContent.trim() === k[1].textContent.trim();
    });
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, hasWrap: !!wrap };
  });
  console.log("== roll target ==", JSON.stringify(pos));
  await page.waitForTimeout(2000);

  if (pos) {
    await page.mouse.move(pos.x - 500, pos.y);
    await page.waitForTimeout(600);
    // start rAF sampling, then hover
    const timingPromise = page.evaluate(
      () =>
        new Promise((resolve) => {
          const all = [...document.querySelectorAll("a")];
          const el = all.find((e) => /learn more/i.test(e.textContent) && e.offsetHeight < 80);
          const wrap = [...el.querySelectorAll("div")].find((d) => {
            const k = [...d.children].filter((c) => c.textContent.trim());
            return k.length === 2 && k[0].textContent.trim() === k[1].textContent.trim();
          });
          const kid = wrap ? wrap.children[0] : null;
          const t0 = performance.now();
          const out = [];
          const tick = () => {
            const cs = getComputedStyle(kid);
            out.push({ t: Math.round(performance.now() - t0), tr: cs.transform, rootTr: getComputedStyle(wrap).transform, op: cs.opacity });
            if (performance.now() - t0 < 900) requestAnimationFrame(tick);
            else resolve(out);
          };
          requestAnimationFrame(tick);
        })
    );
    await page.waitForTimeout(60);
    await page.mouse.move(pos.x, pos.y, { steps: 2 });
    const frames = await timingPromise;
    const parsed = frames.map((f) => {
      const m = /matrix\(1, 0, 0, 1, 0, (-?[\d.]+)\)/.exec(f.tr);
      return { t: f.t, y: m ? +m[1] : f.tr, root: f.rootTr, op: f.op };
    });
    console.log("== roll frames (every 3rd) ==");
    console.log(JSON.stringify(parsed.filter((_, i) => i % 3 === 0), null, 1));
    const ys = parsed.filter((p) => typeof p.y === "number");
    if (ys.length) {
      const start = ys[0].y;
      const end = ys[ys.length - 1].y;
      console.log("roll y:", { start, end, at150: (ys.find((p) => p.t >= 150) || {}).y, at300: (ys.find((p) => p.t >= 300) || {}).y, at600: (ys.find((p) => p.t >= 600) || {}).y });
    }
  }

  await browser.close();
})();
