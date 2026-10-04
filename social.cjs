// Print context around social hrefs in index.html (footer icons).
const fs = require('fs');
const html = fs.readFileSync(process.argv[2], 'utf8');
for (const needle of ['x.com/ArbiDesign03', 'arbi-khan', 'dribbble.com']) {
  const i = html.indexOf(needle);
  if (i < 0) { console.log('NOT FOUND', needle); continue; }
  console.log('=== ' + needle + ' ===');
  console.log(html.slice(Math.max(0, i - 700), i + 120).replace(/></g, '>\n<'));
}
