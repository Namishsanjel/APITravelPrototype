const { chromium } = require("playwright");

const URL = "https://trova-travel.framer.website/";

const info = () => {
  const all = [...document.querySelectorAll("a, span, div")];
  const btn = all.find((e) => /learn more/i.test(e.textContent || "") && e.offsetHeight > 20 && e.offsetHeight < 80 && e.offsetWidth < 300);
  const r = btn.getBoundingClientRect();
  const win = [...btn.querySelectorAll("div")].find((d) => {
    const k = [...d.children];
    return k.length === 2 && k[0].textContent.trim() === k[1].textContent.trim();
  });
  const wr = win.getBoundingClientRect();
  const wcs = getComputedStyle(win);
  return {
    win: { rel: { y: +(wr.y - r.y).toFixed(1), h: +wr.height.toFixed(1), w: +wr.width.toFixed(1) }, overflow: wcs.overflow, disp: wcs.display, pos: wcs.position, tr: wcs.transform, kids: win.children.length },
    btnOv: getComputedStyle(btn).overflow,
  };
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(4000);

  const idx = await page.evaluate(() => {
    const all = [...document.querySelectorAll("a, span, div")];
    const i = all.findIndex((e) => /learn more/i.test(e.textContent || "") && e.offsetHeight > 20 && e.offsetHeight < 80 && e.offsetWidth < 300);
    all[i].scrollIntoView({ block: "center" });
    return i;
  });
  await page.waitForTimeout(1500);
  const loc = page.locator("a, span, div").nth(idx);
  const pos = await page.evaluate((i) => {
    const all = [...document.querySelectorAll("a, span, div")];
    const r = all[i].getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, idx);

  await page.mouse.move(5, 5);
  await page.waitForTimeout(700);
  console.log("INFO idle:", JSON.stringify(await page.evaluate(info), null, 1));
  await loc.screenshot({ path: "shots/ref-roll-idle.png" });

  await page.mouse.move(pos.x - 300, pos.y);
  await page.waitForTimeout(400);
  await page.mouse.move(pos.x, pos.y, { steps: 3 });
  for (const t of [90, 130, 160]) {
    await page.waitForTimeout(t === 90 ? 90 : 40);
    await loc.screenshot({ path: `shots/ref-roll-t${t}.png` });
  }
  await page.waitForTimeout(600);
  console.log("INFO hover:", JSON.stringify(await page.evaluate(info), null, 1));
  await loc.screenshot({ path: "shots/ref-roll-hover.png" });

  await browser.close();
})();
