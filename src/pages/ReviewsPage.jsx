import { useEffect } from "react";
import PageShell from "../components/PageShell.jsx";
import { PageHeader } from "../components/ui.jsx";
import Icon from "../data/Icon.jsx";
import { TESTIMONIAL_SECTION, FEATURED_QUOTE, REVIEWS, PAGES } from "../data/content.js";

function Location({ children, color }) {
  return (
    <div className="mt-[2px] flex items-center gap-1">
      <Icon id="4159562592" size={16} style={{ color }} />
      <span className="t-eyebrow" style={{ color }}>
        {children}
      </span>
    </div>
  );
}

export default function ReviewsPage() {
  const page = PAGES["/reviews"];

  useEffect(() => {
    document.title = page.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", page.description);
  }, [page]);

  return (
    <PageShell>
      <section className="container-x flex flex-col gap-12 pt-[120px] pb-[60px]">
        <PageHeader badge={TESTIMONIAL_SECTION.badge} title={TESTIMONIAL_SECTION.title.join(" ")} sub={TESTIMONIAL_SECTION.body} />

        <div className="flex gap-6 max-[809.98px]:flex-col">
          {/* featured quote over photo */}
          <div className="relative h-[495px] w-[480px] shrink-0 overflow-hidden rounded-lg max-[809.98px]:h-[420px] max-[809.98px]:w-full">
            <img src={FEATURED_QUOTE.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="grad-quote absolute inset-0" />
            <div className="absolute inset-0 flex flex-col justify-end px-6 pt-6 pb-[27px]">
              <h4 className="t-h4 text-mist">{FEATURED_QUOTE.quote}</h4>
              <p className="mt-4 font-interd text-[16px] leading-[22.4px] text-cream">{FEATURED_QUOTE.name}</p>
              <Location color="var(--color-secondary)">{FEATURED_QUOTE.trip}</Location>
            </div>
          </div>

          {/* written reviews */}
          <div className="flex w-[762px] flex-col gap-6 max-[1099.98px]:w-full">
            {REVIEWS.map((r) => (
              <div key={r.name} className="rounded-lg bg-mist p-6">
                <h4 className="t-h4">{r.title}</h4>
                <p className="t-body mt-6">{r.body}</p>
                <div className="mt-6 flex gap-[10px]">
                  <img src={r.avatar} alt="" className="h-[41px] w-[41px] shrink-0 rounded-md object-cover" />
                  <div>
                    <p className="font-interd text-[16px] leading-[22.4px] text-ink">{r.name}</p>
                    <Location color="var(--color-smoke)">{r.trip}</Location>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 rounded-lg bg-mist p-6 max-[809.98px]:flex-col max-[809.98px]:items-start">
          <div className="flex flex-col gap-1">
            <p className="t-h4 text-ink">Traveled with us?</p>
            <p className="t-body">Tell us how the route felt — the next group reads every word of it.</p>
          </div>
          <a href="/contact" className="btn btn-dark w-[140px]">
            get in touch
          </a>
        </div>
      </section>
    </PageShell>
  );
}
