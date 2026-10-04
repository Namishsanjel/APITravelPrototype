// Fix double-encoded (windows-1252 mojibake) strings in JS data files.
// e.g. 'Ã¢â‚¬â€"' -> '—', 'Ã¢â‚¬â„¢' -> '’', 'Ã‚Â·' -> '·', 'Ã‚Â©' -> '©'
const fs = require('fs');

const MAP = {
  0x80: '€', 0x82: '‚', 0x83: 'ƒ', 0x84: '„', 0x85: '…', 0x86: '†', 0x87: '‡',
  0x88: 'ˆ', 0x89: '‰', 0x8a: 'Š', 0x8b: '‹', 0x8c: 'Œ', 0x8e: 'Ž',
  0x91: '‘', 0x92: '’', 0x93: '“', 0x94: '”', 0x95: '•', 0x96: '–', 0x97: '—',
  0x98: '˜', 0x99: '™', 0x9a: 'š', 0x9b: '›', 0x9c: 'œ', 0x9e: 'ž', 0x9f: 'Ÿ',
};
const REV = Object.fromEntries(Object.entries(MAP).map(([k, v]) => [v, +k]));

// one pass: chars -> windows-1252 bytes -> utf8 decode. null = not decodable.
function dec(s) {
  const bytes = [];
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c <= 0xff && !REV[ch]) bytes.push(c);
    else if (REV[ch] !== undefined) bytes.push(REV[ch]);
    else return null;
  }
  const t = Buffer.from(bytes).toString('utf8');
  return t.includes('�') ? null : t;
}

let changed = 0;
for (const file of ['src/data/content.js', 'src/data/pages.js']) {
  let text = fs.readFileSync(file, 'utf8');
  // match double-quoted string literals
  text = text.replace(/"(?:[^"\\]|\\.)*"/g, (lit) => {
    const inner = lit.slice(1, -1);
    if (!inner.includes('Ã')) return lit;
    let s = inner;
    for (let i = 0; i < 3; i++) {
      const d = dec(s);
      if (d === null || d === s) break;
      s = d;
    }
    if (s === inner) {
      console.log('UNFIXED ' + file + ': ' + inner.slice(0, 80));
      return lit;
    }
    console.log(file + ':\n  - ' + inner.slice(0, 100) + '\n  + ' + s.slice(0, 100));
    changed++;
    return '"' + s + '"';
  });
  fs.writeFileSync(file, text, 'utf8');
}
console.log('changed ' + changed + ' string(s)');
