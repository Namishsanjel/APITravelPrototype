// Hover the nav "Destinations" trigger, walk the country list, capture the panel.
const { chromium } = require('playwright');
const path = require('path');

const SHOTS = path.join(__dirname, 'shots');
const BASE = 'http://localhost:5199';

const CASES = [
  { name: 'navdrop-home-1440', url: '/', w: 1440, h: 900, hover: 'Scotland' },
  { name: 'navdrop-dest-1440', url: '/destinations', w: 1440, h: 900, hover: 'Peru' },
  { name: 'navdrop-home-1024', url: '/', w: 1024, h: 768, hover: 'Iceland' },
  { name: 'navdrop-home-860', url: '/', w: 860, h: 900, hover: 'Tanzania' },
];

(async () => {
  const browser = await chromium.launch();
  for (const c of CASES) {
    const ctx = await browser.newContext({ viewport: { width: c.w, height: c.h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(BASE + c.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2200);

    const panel = page.locator('#nav-destinations-menu');
    await page.locator('button[aria-controls="nav-destinations-menu"]').hover();
    await page.waitForSelector('#nav-destinations-menu', { timeout: 5000 });
    await page.waitForTimeout(700);

    const rows = page.locator('#nav-destinations-menu nav a');
    console.log(`${c.name} list=[${(await rows.allInnerTexts()).map((t) => t.replace(/\n/g, ' / ')).join(' | ')}]`);
    console.log(`  initial preview: ${await panel.locator('h3').first().innerText()}`);

    await rows.filter({ hasText: c.hover }).first().hover();
    await page.waitForTimeout(600);
    console.log(`  preview after hovering ${c.hover}: ${await panel.locator('h3').first().innerText()}`);

    const box = await panel.locator('> div').boundingBox();
    const fits = box.x >= 0 && box.x + box.width <= c.w && box.y + box.height <= c.h + 40;
    console.log(`  panel=${Math.round(box.width)}x${Math.round(box.height)} y=${Math.round(box.y)} fitsViewport=${fits}`);

    await page.screenshot({ path: path.join(SHOTS, c.name + '.png') });

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    console.log(`  escape closes: ${(await panel.count()) === 0}`);

    await page.locator('header nav a[href="/gallery"]').hover();
    await page.waitForTimeout(300);
    console.log(`  stays closed over Gallery: ${(await panel.count()) === 0}`);

    await ctx.close();
  }
  await browser.close();
})();