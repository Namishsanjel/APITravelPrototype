// Quick visual check of the icon ids picked for the Services cards.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const icons = require('./src/data/icons.json');
const picks = Object.keys(icons).map((id) => [id, id]);

const cells = picks
  .map(
    ([id, label]) => `<div style="width:250px;background:#f7f9f4;border-radius:8px;padding:24px;font-family:sans-serif">
      <div style="width:36px;height:36px;color:#282828">${icons[id]}</div>
      <div style="font-size:20px;font-weight:600;margin-top:24px">${label}</div>
      <div style="font-size:14px;color:#5c5c58;margin-top:8px">${id}</div>
    </div>`
  )
  .join('');

const html = `<!doctype html><html><body style="margin:0;background:#f1ead9;padding:40px">
  <div style="display:flex;flex-wrap:wrap;gap:24px;width:1160px">${cells}</div></body></html>`;

const file = path.join(__dirname, 'shots', 'icons.png');
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'shots', 'icons.html'), html);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1260, height: 700 } });
  await page.goto('file:///' + path.join(__dirname, 'shots', 'icons.html').replace(/\\/g, '/'));
  await page.waitForTimeout(300);
  await page.screenshot({ path: file, fullPage: true });
  await browser.close();
  console.log('OK', file);
})();
