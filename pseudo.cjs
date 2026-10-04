// Pseudo-element / background inspector for form controls.
const { chromium } = require('playwright');
const url = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3000);
  const rows = await page.evaluate(() => {
    const out = [];
    const dump = (el, label) => {
      const cs = getComputedStyle(el);
      const before = getComputedStyle(el, '::before');
      const after = getComputedStyle(el, '::after');
      const r = el.getBoundingClientRect();
      out.push(
        `${label} box ${Math.round(r.x)},${Math.round(r.y + scrollY)} ${Math.round(r.width)}x${Math.round(r.height)}` +
        `\n   bgImage ${cs.backgroundImage.slice(0, 160)} bgPos ${cs.backgroundPosition} bgSize ${cs.backgroundSize} bgRepeat ${cs.backgroundRepeat}` +
        `\n   before content "${before.content}" pos ${before.position} inset ${before.top} ${before.right} ${before.bottom} ${before.left} size ${before.width}x${before.height} bg ${before.backgroundImage.slice(0, 120)}` +
        `\n   after  content "${after.content}" pos ${after.position} inset ${after.top} ${after.right} ${after.bottom} ${after.left} size ${after.width}x${after.height} bg ${after.backgroundImage.slice(0, 120)}`
      );
    };
    document.querySelectorAll('.framer-form-select-wrapper, .framer-form-input-wrapper, input[type="date"], select, textarea').forEach((el, i) => {
      dump(el, `[${i}] ${el.tagName}.${el.className}`);
    });
    return out;
  });
  rows.forEach((r) => console.log(r));
  await browser.close();
})();
