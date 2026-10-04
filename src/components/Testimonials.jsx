import { TESTIMONIAL_SECTION, FEATURED_QUOTE, REVIEWS } from "../data/content.js";
import { SectionHead, HeadCopy } from "./ui.jsx";
import Icon from "../data/Icon.jsx";

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

export default function Testimonials() {
  return (
    <section className="section-py">
      <div className="container-x">
        <SectionHead badge={TESTIMONIAL_SECTION.badge} title={TESTIMONIAL_SECTION.title}>
          <HeadCopy>{TESTIMONIAL_SECTION.body}</HeadCopy>
          <a href="/reviews" className="t-link text-ink underline underline-offset-4">
            Read all reviews
          </a>
        </SectionHead>

        <div className="mt-12 flex gap-6">
          {/* featured quote over photo */}
          <div className="relative h-[495px] w-[480px] shrink-0 overflow-hidden rounded-lg">
            <img src={FEATURED_QUOTE.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="grad-quote absolute inset-0" />
            <div className="absolute inset-0 flex flex-col justify-end px-6 pt-6 pb-[27px]">
              <h4 className="t-h4 text-mist">{FEATURED_QUOTE.quote}</h4>
              <p className="mt-4 font-interd text-[16px] leading-[22.4px] text-cream">
                {FEATURED_QUOTE.name}
              </p>
              <Location color="var(--color-secondary)">{FEATURED_QUOTE.trip}</Location>
            </div>
          </div>

          {/* two written reviews */}
          <div className="flex w-[762px] flex-col gap-6">
            {REVIEWS.map((r) => (
              <div key={r.name} className="h-[236px] rounded-lg bg-mist p-6">
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
      </div>
    </section>
  );
}
