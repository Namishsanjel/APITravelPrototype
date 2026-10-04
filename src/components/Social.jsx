import { useState } from "react";
import { TESTIMONIALS, JOURNAL, FAQS, FOOTER } from "../data/content.js";

export function Testimonials() {
  return (
    <section className="bg-mist">
      <div className="mx-auto max-w-[1330px] px-4 py-16 md:px-8 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Testimonials</p>
        <h2 className="font-display mt-3 text-3xl font-bold md:text-5xl">The memories speak for themselves</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name + t.trip} className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">
              {t.title && <h3 className="font-display text-lg font-bold">{t.title}</h3>}
              <blockquote className="mt-2 flex-1 text-sm text-smoke">“{t.quote}”</blockquote>
              <figcaption className="mt-4 text-sm font-semibold">
                {t.name} <span className="font-normal text-smoke">· {t.trip}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Journal() {
  return (
    <section id="journal" className="bg-cream">
      <div className="mx-auto max-w-[1330px] px-4 py-16 md:px-8 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Travel Journal</p>
            <h2 className="font-display mt-3 text-3xl font-bold md:text-5xl">Stories, Tips &amp; Trail inspiration</h2>
          </div>
          <a href="#journal" className="rounded-full border border-ink/20 px-6 py-2.5 text-sm font-semibold hover:bg-ink hover:text-white">
            Explore Journal
          </a>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {JOURNAL.map((j) => (
            <article key={j.title} className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-smoke">
                {j.tag} · {j.read}
              </p>
              <h3 className="font-display mt-2 text-lg font-bold">{j.title}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// Original: Framer FAQ accordion (Question wrapper + Answer Wrapper toggles).
// Ported to a native useState accordion — same interaction, no Framer JS.
export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-mist">
      <div className="mx-auto max-w-[900px] px-4 py-16 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">FAQ</p>
        <h2 className="font-display mt-3 text-3xl font-bold md:text-4xl">Good to know before you go</h2>
        <div className="mt-8 divide-y divide-ink/10 rounded-2xl bg-white px-6 shadow-sm">
          {FAQS.map((f, i) => (
            <div key={f.q}>
              <button
                type="button"
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
                className="flex w-full items-center justify-between py-4 text-left font-semibold"
              >
                {f.q}
                <span className="ml-4 text-primary">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <p className="pb-4 text-sm text-smoke">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="mx-auto max-w-[1330px] px-4 py-16 md:px-8">
        <div className="rounded-3xl bg-white/10 p-8 md:p-12">
          <h2 className="font-display text-3xl font-bold md:text-5xl">{FOOTER.ctaTitle}</h2>
          <p className="mt-3 max-w-xl text-white/80">{FOOTER.ctaBody}</p>
          <a href="#hikes" className="mt-6 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-ink">
            Explore Tours
          </a>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo-white.png" alt="API Touch" className="h-8 w-auto" />
              <span className="font-display font-bold">API Touch</span>
            </div>
            <p className="mt-3 text-sm text-white/70">© 2026 API Touch</p>
          </div>
          <nav>
            <p className="text-xs uppercase tracking-widest text-white/60">Navigation</p>
            {FOOTER.nav.map((l) => (
              <a key={l} href="#top" className="mt-2 block text-sm text-white/85 hover:text-white">{l}</a>
            ))}
          </nav>
          <nav>
            <p className="text-xs uppercase tracking-widest text-white/60">CMS</p>
            {FOOTER.cms.map((l) => (
              <a key={l} href="#top" className="mt-2 block text-sm text-white/85 hover:text-white">{l}</a>
            ))}
          </nav>
          <nav>
            <p className="text-xs uppercase tracking-widest text-white/60">Legal page</p>
            {FOOTER.legal.map((l) => (
              <a key={l} href="#top" className="mt-2 block text-sm text-white/85 hover:text-white">{l}</a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
