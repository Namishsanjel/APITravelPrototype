const { chromium } = require("playwright");

const URL = process.env.PROBE_URL || "http://localhost:5175/";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);

  const r = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("a.btn.btn-roll, span.btn.btn-roll")) {
      const win = el.querySelector(".roll");
      if (!win) { out.push({ err: "no .roll", cls: el.className }); continue; }
      const br = el.getBoundingClientRect();
      const wr = win.getBoundingClientRect();
      const line = win.children[0];
      // measure the painted text width with a Range
      const rg = document.createRange();
      rg.selectNodeContents(line);
      const tr = rg.getBoundingClientRect();
      out.push({
        text: line.textContent,
        btn: { w: +br.width.toFixed(2), h: +br.height.toFixed(2) },
        win: { x: +(wr.x - br.x).toFixed(2), w: +wr.width.toFixed(2), h: +wr.height.toFixed(2), scrollW: win.scrollWidth, clientW: win.clientWidth, scrollH: win.scrollHeight, clientH: win.clientHeight },
        paintedText: { x: +(tr.x - br.x).toFixed(2), w: +tr.width.toFixed(2), right: +(tr.right - br.x).toFixed(2), rightMargin: +(br.right - tr.right).toFixed(2) },
        clippedRight: tr.right > wr.right + 0.01,
        clippedLeft: tr.left < wr.left - 0.01,
        idleLabelVisible: (() => {
          const lr = line.getBoundingClientRect();
          const inWin = lr.bottom <= wr.bottom + 0.01 && lr.top >= wr.top - 0.01;
          const l2 = win.children[1];
          const l2r = l2.getBoundingClientRect();
          const l2in = l2r.bottom <= wr.bottom + 0.01 && l2r.top >= wr.top - 0.01;
          return { line1: inWin, line2: l2in };
        })(),
      });
    }
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
  await browser.close();
})();
