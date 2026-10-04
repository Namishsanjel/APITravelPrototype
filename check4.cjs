const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:5174/plan-your-trip", { waitUntil: "networkidle" });
  const info = await p.evaluate(() => {
    const img = document.querySelector(".contact-card img");
    const card = document.querySelector(".contact-card");
    const left = document.querySelector(".contact-top");
    const probe = left.getBoundingClientRect();
    const at = document.elementFromPoint(probe.left + 40, probe.top + 40);
    return {
      hasImg: !!img,
      src: img && img.src,
      natural: img && img.naturalWidth + "x" + img.naturalHeight,
      imgRect: img && JSON.stringify(img.getBoundingClientRect()),
      imgZ: img && getComputedStyle(img).zIndex,
      imgPos: img && getComputedStyle(img).position,
      cardPos: card && getComputedStyle(card).position,
      cardRect: card && JSON.stringify(card.getBoundingClientRect()),
      topEl: at && at.tagName + "." + at.className,
      cardBg: card && getComputedStyle(card).backgroundImage.slice(0, 60),
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await b.close();
})();
