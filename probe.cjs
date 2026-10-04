const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 600, height: 200 } });
  const label = 'XYZZY-' + Math.floor(Math.random() * 9000 + 1000);
  await p.setContent('<body style="margin:0;background:#cc0000;color:#fff;font:72px sans-serif;display:flex;align-items:center;justify-content:center;height:200px">' + label + '</body>');
  await p.screenshot({ path: 'shots/probe-909.png' });
  await b.close();
  console.log('ok', label);
})();
