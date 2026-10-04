const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text().slice(0, 300)); });
  p.on('pageerror', (e) => errs.push('pageerror: ' + String(e).slice(0, 400)));
  await p.goto(process.argv[2], { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => console.log('goto', e.message));
  await p.waitForTimeout(3000);
  const info = await p.evaluate(() => ({
    title: document.title,
    h: document.body.scrollHeight,
    hasContact: !!document.querySelector('.contact-sec'),
    text: (document.body.innerText || '').split('\n').filter(Boolean).slice(0, 12),
  }));
  console.log(JSON.stringify(info, null, 1));
  console.log('console:', errs.slice(0, 12).join('\n  ') || 'clean');
  await b.close();
})();
