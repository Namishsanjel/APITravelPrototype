const { chromium } = require("playwright");

const URL = process.env.PROBE_URL || "http://localhost:5175/";

const snap = (s) => {
  const els = [...document.querySelectorAll("a.btn, span.btn")];
  const el = els.find((e) => e.textContent.trim().toLowerCase().startsWith(s));
  if (!el) return { err: "not found" };
  const r = el.getBoundingClientRect();
  const win = el.querySelector(".roll");
  const wr = win ? win.getBoundingClientRect() : null;
  const wcs = win ? getComputedStyle(win) : null;
  const lines = [...(win ? win.children : [])].map((sp) => {
    const sr = sp.getBoundingClientRect();
    const cs = getComputedStyle(sp);
    return {
      t: sp.textContent,
      rel: { y: +(sr.y - r.y).toFixed(1), h: +sr.height.toFixed(1), x: +(sr.x - r.x).toFixed(1), w: +sr.width.toFixed(1) },
      visible: sr.y < r.y + r.height - 0.05 && sr.y + sr.height > r.y + 0.05,
      tr: cs.transform,
    };
  });
  return {
    btn: { w: +r.width.toFixed(1), h: +r.height.toFixed(1), cls: el.className },
    win: wr
      ? { rel: { x: +(wr.x - r.x).toFixed(1), y: +(wr.y - r.y).toFixed(1), w: +wr.width.toFixed(1), h: +wr.height.toFixed(1) }, overflow: wcs.overflow }
      : null,
    lines,
  };
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);

  for (const label of ["learn more", "browse all tours"]) {
    console.log(`\n===== ${label} =====`);
    const found = await page.evaluate((s) => {
      const els = [...document.querySelectorAll("a.btn, span.btn")];
      const i = els.findIndex((e) => e.textContent.trim().toLowerCase().startsWith(s));
      if (i < 0) return null;
      els[i].scrollIntoView({ block: "center" });
      return i;
    }, label);
    if (found == null) { console.log("NOT FOUND"); continue; }
    const loc = page.locator("a.btn, span.btn").nth(found);
    await page.waitForTimeout(900);

    const pos = await page.evaluate((s) => {
      const els = [...document.querySelectorAll("a.btn, span.btn")];
      const el = els.find((e) => e.textContent.trim().toLowerCase().startsWith(s));
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }, label);

    await page.mouse.move(5, 5);
    await page.waitForTimeout(600);
    console.log("IDLE :", JSON.stringify(await page.evaluate(snap, label)));
    await loc.screenshot({ path: `shots/roll2-${label.replace(/\s+/g, "-")}-idle.png` });

    await page.mouse.move(pos.x - 300, pos.y);
    await page.waitForTimeout(300);
    await page.mouse.move(pos.x, pos.y, { steps: 3 });
    await page.waitForTimeout(800);
    console.log("HOVER:", JSON.stringify(await page.evaluate(snap, label)));
    await loc.screenshot({ path: `shots/roll2-${label.replace(/\s+/g, "-")}-hover.png` });

    // a true mid-roll frame: freeze both lines at 50% (the transition would
    // otherwise have finished before a screenshot can settle)
    await page.evaluate((s) => {
      const els = [...document.querySelectorAll("a.btn, span.btn")];
      const el = els.find((e) => e.textContent.trim().toLowerCase().startsWith(s));
      const win = el.querySelector(".roll");
      win.dataset.prev = "";
      for (const [i, sp] of [...win.children].entries()) {
        sp.dataset.prev = sp.style.transform || "";
        sp.style.transition = "none";
        sp.style.transform = i === 0 ? "translateY(-50%)" : "translateY(50%)";
      }
    }, label);
    await page.waitForTimeout(120);
    await loc.screenshot({ path: `shots/roll2-${label.replace(/\s+/g, "-")}-mid.png` });
    console.log("MID  :", JSON.stringify(await page.evaluate(snap, label)));

    // restore
    await page.evaluate((s) => {
      const els = [...document.querySelectorAll("a.btn, span.btn")];
      const el = els.find((e) => e.textContent.trim().toLowerCase().startsWith(s));
      for (const sp of el.querySelector(".roll").children) {
        sp.style.transition = "";
        sp.style.transform = sp.dataset.prev || "";
        delete sp.dataset.prev;
      }
    }, label);
    await page.mouse.move(5, 5);
    await page.waitForTimeout(600);
    console.log("BACK :", JSON.stringify(await page.evaluate(snap, label)));
  }

  await browser.close();
})();
