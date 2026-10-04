/* Close-ups for the cream-background check: form fields + FAQ buttons. */
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("http://localhost:4173/contact", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const form = await page.$("form");
  if (form) await form.screenshot({ path: "shots/palette/_form_only.png" });

  await page.goto("http://localhost:4173/faq", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(1500);
  const card = await page.$("section .bg-mist.rounded-lg");
  if (card) await card.screenshot({ path: "shots/palette/_faqcard_only.png" });

  // objective contrast numbers for the two risky pairings
  const probe = async (url, sel, otherSel) => {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    return page.evaluate(
      ([a, b]) => {
        const el = document.querySelector(a);
        const host = document.querySelector(b);
        const cs = el && getComputedStyle(el);
        const hs = host && getComputedStyle(host);
        return { fill: cs && cs.backgroundColor, against: hs && hs.backgroundColor };
      },
      [sel, otherSel]
    );
  };
  console.log("form field:", await probe("http://localhost:4173/contact", ".f-control", "form"));
  console.log("faq button:", await probe("http://localhost:4173/faq", "a.btn-cream", "section .bg-mist"));

  await browser.close();
})();
