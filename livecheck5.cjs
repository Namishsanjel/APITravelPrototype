const { chromium } = require("playwright");

const URL = "https://trova-travel.framer.website/";

(async () => {
  const browser = await chromium.launch();

  // ==== A: eyebrow opacity over 8s after load (fresh page) ====
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    const s = await page.evaluate(
      () =>
        new Promise((resolve) => {
          const out = [];
          const t0 = performance.now();
          const iv = setInterval(() => {
            const el = [...document.querySelectorAll("body *")].find(
              (e) => !e.children.length && /Global Expeditions/.test(e.textContent)
            );
            const anims = document.getAnimations().filter((a) => a.playState === "running");
            if (el) out.push({ t: Math.round(performance.now() - t0), op: +getComputedStyle(el).opacity, inline: el.style.opacity, nAnims: anims.length });
            if (performance.now() - t0 > 8000) {
              clearInterval(iv);
              resolve(out.filter((_, i) => i % 5 === 0));
            }
          }, 100);
        })
    );
    console.log("== eyebrow settle (every 500ms) ==");
    console.log(JSON.stringify(s, null, 1));
    await page.close();
  }

  // ==== B: scroll reveal — real timings while scrolling to hidden content ====
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(3000);

    const res = await page.evaluate(async () => {
      const words = [...document.querySelectorAll("span")].filter(
        (s) => getComputedStyle(s).opacity === "0.001" && s.children.length === 0 && s.offsetHeight > 0
      );
      const blocks = [...document.querySelectorAll("div")].filter(
        (d) => getComputedStyle(d).opacity === "0" && d.offsetHeight > 0 && d.children.length > 0 && d.offsetWidth > 200
      );
      const t0 = performance.now();
      const log = [];
      const iv = setInterval(() => {
        const running = document
          .getAnimations()
          .filter((a) => a.playState === "running")
          .map((a) => {
            const ti = a.effect.getTiming();
            const kf = a.effect.getKeyframes();
            return {
              tg: (a.effect.target.textContent || "").trim().slice(0, 18),
              cls: a.effect.target.className.toString().slice(0, 22),
              d: ti.delay,
              u: ti.duration,
              e: ti.easing,
              n: kf.length,
              f0: kf[0] && { op: kf[0].opacity, tr: kf[0].transform },
              fl: kf[kf.length - 1] && { op: kf[kf.length - 1].opacity, tr: kf[kf.length - 1].transform },
            };
          });
        const w = words.slice(0, 8).map((el) => ({
          w: el.textContent.slice(0, 7),
          op: +getComputedStyle(el).opacity,
          y: +new DOMMatrix(getComputedStyle(el).transform).m42.toFixed(2),
        }));
        const b = blocks.slice(0, 5).map((el) => {
          const cs = getComputedStyle(el);
          return { op: +cs.opacity, td: cs.transitionDuration, tt: cs.transitionTimingFunction, tr: cs.transform.slice(0, 30), txt: (el.textContent || "").trim().slice(0, 14) };
        });
        log.push({ t: Math.round(performance.now() - t0), running, w, b });
      }, 40);

      // scroll like a user toward the first hidden word group
      const goal = words[0] ? words[0].getBoundingClientRect().top + window.scrollY - 400 : 2200;
      await new Promise((res) => {
        const step = () => {
          if (window.scrollY >= goal - 4) return res();
          window.scrollTo(0, Math.min(goal, window.scrollY + 70));
          setTimeout(step, 45);
        };
        step();
      });
      await new Promise((r) => setTimeout(r, 2600));
      clearInterval(iv);
      return { nWords: words.length, nBlocks: blocks.length, log };
    });

    // compress: per-element onset/end + distinct running animations
    const animSeen = {};
    const wordTrack = {};
    const blockTrack = {};
    for (const e of res.log) {
      for (const a of e.running || []) {
        const k = `${a.cls}|${a.d}|${a.u}|${a.e}|${a.n}|${JSON.stringify(a.f0)}|${JSON.stringify(a.fl)}`;
        animSeen[k] = (animSeen[k] || 0) + 1;
      }
      (e.w || []).forEach((w, i) => {
        (wordTrack[w.w + "#" + i] ||= []).push({ t: e.t, op: w.op, y: w.y });
      });
      (e.b || []).forEach((b, i) => {
        (blockTrack[b.txt + "#" + i] ||= []).push({ t: e.t, op: b.op, td: b.td, tt: b.tt, tr: b.tr });
      });
    }
    const onset = (arr, pick) => {
      const first = arr.find((p) => pick(p) > 0.03);
      const done = arr.find((p) => pick(p) >= 0.99);
      return { start: first && first.t, end: done && done.t, dur: first && done ? done.t - first.t : null, firstV: first && pick(first) };
    };
    console.log("== scroll reveal: word onsets ==");
    console.log(JSON.stringify(Object.fromEntries(Object.entries(wordTrack).map(([k, v]) => [k, onset(v, (p) => p.op)])), null, 1));
    console.log("== scroll reveal: word y travel (first word track) ==");
    const fk = Object.keys(wordTrack)[0];
    console.log(JSON.stringify((wordTrack[fk] || []).filter((_, i) => i % 4 === 0), null, 1));
    console.log("== scroll reveal: block onsets ==");
    console.log(JSON.stringify(Object.fromEntries(Object.entries(blockTrack).map(([k, v]) => [k, onset(v, (p) => p.op)])), null, 1));
    console.log("== scroll reveal: block mid-flight samples ==");
    const bk = Object.keys(blockTrack)[0];
    console.log(JSON.stringify((blockTrack[bk] || []).filter((p) => p.op > 0.02 && p.op < 0.99).slice(0, 8), null, 1));
    console.log("== distinct running WAAPI animations seen ==");
    console.log(JSON.stringify(animSeen, null, 1));
    await page.close();
  }

  // ==== C: hover roll — real mouse, fine sampling + transition props ====
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2800);
    const pos = await page.evaluate(() => {
      const el = [...document.querySelectorAll("a")].find((e) => /learn more/i.test(e.textContent) && e.offsetHeight < 80);
      if (!el) return null;
      el.scrollIntoView({ block: "center" });
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    await page.waitForTimeout(2200);
    if (pos) {
      await page.mouse.move(pos.x - 600, pos.y);
      await page.waitForTimeout(700);
      const snap = () =>
        page.evaluate(() => {
          const el = [...document.querySelectorAll("a")].find((e) => /learn more/i.test(e.textContent) && e.offsetHeight < 80);
          const wrap = [...el.querySelectorAll("div")].find((d) => {
            const k = [...d.children].filter((c) => c.textContent.trim());
            return k.length === 2 && k[0].textContent.trim() === k[1].textContent.trim();
          });
          const kid = wrap.children[0];
          const cs = getComputedStyle(kid);
          const m = /matrix\(1, 0, 0, 1, 0, (-?[\d.]+)\)/.exec(cs.transform);
          const r = el.getBoundingClientRect();
          return { y: m ? +m[1] : cs.transform, kidTop: Math.round(kid.getBoundingClientRect().top), rootTop: Math.round(wrap.getBoundingClientRect().top), td: cs.transitionDuration, tt: cs.transitionTimingFunction, op: cs.opacity, elY: Math.round(r.y) };
        });
      const before = await snap();
      await page.mouse.move(pos.x, pos.y, { steps: 2 });
      const marks = [40, 80, 120, 180, 260, 360, 500, 700];
      const out = [];
      let prev = 0;
      for (const m of marks) {
        await page.waitForTimeout(m - prev);
        prev = m;
        out.push({ at: m, ...(await snap()) });
      }
      console.log("== roll hover: before ==", JSON.stringify(before));
      console.log("== roll hover: timeline ==");
      console.log(JSON.stringify(out, null, 1));
    }
    await page.close();
  }

  await browser.close();
})();
