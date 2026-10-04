import { INCLUDED, EXPERIENCE_IMAGES, GUIDES, STEPS } from "../data/content.js";

export function Included() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-[1330px] px-4 py-16 md:px-8 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">What&apos;s included</p>
        <h2 className="font-display mt-3 max-w-xl text-3xl font-bold leading-tight md:text-5xl">
          What makes the experience different
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {INCLUDED.map((f) => (
            <div key={f.title} className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="font-display text-lg font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-smoke">{f.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm font-semibold text-primary">100% Local guides on every trip</p>
      </div>
    </section>
  );
}

export function Experience() {
  return (
    <section id="experience" className="bg-primary text-white">
      <div className="mx-auto max-w-[1330px] px-4 py-16 md:px-8 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Experience</p>
        <h2 className="font-display mt-3 text-3xl font-bold md:text-5xl">See what the journey feels like</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {EXPERIENCE_IMAGES.map((src, i) => (
            <img key={src} src={src} alt={`Guided hiking experience ${i + 1}`} className="h-64 w-full rounded-2xl object-cover" loading="lazy" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function Guides() {
  return (
    <section className="bg-mist">
      <div className="mx-auto max-w-[1330px] px-4 py-16 md:px-8 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Our Guides</p>
        <h2 className="font-display mt-3 text-3xl font-bold md:text-5xl">Meet the people behind the path</h2>
        <p className="mt-4 max-w-3xl text-smoke">{GUIDES.body}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {GUIDES.points.map((g) => (
            <div key={g.title} className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="font-display text-lg font-bold">{g.title}</h3>
              <p className="mt-1 text-sm text-smoke">{g.body}</p>
            </div>
          ))}
          <div className="rounded-2xl bg-primary p-5 text-white">
            <p className="text-xs uppercase tracking-widest text-white/70">lead guide</p>
            <p className="font-display mt-1 text-xl font-bold">{GUIDES.lead}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Steps() {
  return (
    <section id="book" className="bg-cream">
      <div className="mx-auto max-w-[1330px] px-4 py-16 md:px-8 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">How It Works</p>
        <h2 className="font-display mt-3 text-3xl font-bold md:text-5xl">From planning to the first step</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="font-display text-sm font-bold text-primary">{s.n}</p>
              <h3 className="font-display mt-2 text-lg font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-smoke">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
