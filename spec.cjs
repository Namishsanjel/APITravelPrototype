// One-off: reads the original site's __framer__appearAnimationsContent and
// tallies every transition + target state it defines, so the port's constants
// can be matched to the real numbers. Not shipped.
const fs = require('fs');
const path = require('path');

const ROOT = 'trova-travel.framer.website';

function collectHtml(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) collectHtml(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = process.argv[2] ? [process.argv[2]] : collectHtml(ROOT);

const allTransitions = {};
const allInitials = {};
const perFile = {};

for (const file of files) {
  const h = fs.readFileSync(file, 'utf8');
  const at = h.indexOf('__framer__appearAnimationsContent');
  if (at < 0) continue;
  const s = h.indexOf('{', at);
  if (s < 0) continue;
  let d = 0;
  let inStr = false;
  let end = -1;
  for (let k = s; k < h.length; k++) {
    const c = h[k];
    if (inStr) {
      if (c === '\\') k++;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === '{') d++;
    else if (c === '}') {
      d--;
      if (d === 0) {
        end = k + 1;
        break;
      }
    }
  }
  if (end < 0) continue;

  let spec;
  try {
    spec = JSON.parse(h.slice(s, end));
  } catch {
    console.log('parse failed:', file);
    continue;
  }

  let n = 0;
  for (const id in spec) {
    const variants = spec[id] && typeof spec[id] === 'object' ? spec[id] : {};
    for (const vk in variants) {
      const state = variants[vk];
      if (!state || !state.animate) continue;
      n++;
      const t = state.animate.transition || {};
      const tk = `${t.type} dur=${t.duration} delay=${t.delay} ease=${JSON.stringify(t.ease)}`;
      allTransitions[tk] = (allTransitions[tk] || 0) + 1;
      const s0 = state.initial || {};
      const ik = `y ${s0.y}->${state.animate.y}  x ${s0.x}->${state.animate.x}  op ${s0.opacity}->${state.animate.opacity}  scale ${s0.scale}->${state.animate.scale}`;
      allInitials[ik] = (allInitials[ik] || 0) + 1;
    }
  }
  perFile[path.relative(ROOT, file)] = n;
}

console.log('--- animated element variants per page ---');
Object.entries(perFile).forEach(([f, n]) => console.log(String(n).padStart(4), f));
console.log('--- ALL TRANSITIONS ---');
Object.entries(allTransitions).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(String(v).padStart(4), k));
console.log('--- ALL INITIAL/TARGET STATES ---');
Object.entries(allInitials).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(String(v).padStart(4), k));
