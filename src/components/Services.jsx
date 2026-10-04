import { SERVICES_SECTION, SERVICES } from "../data/content.js";
import { Eyebrow } from "./ui.jsx";
import Icon from "../data/Icon.jsx";

export default function Services() {
  const { badge, title, body, cta, ctaHref } = SERVICES_SECTION;

  return (
    <section id="services" className="section-py">
      <div className="container-x flex justify-between max-[809.98px]:flex-col max-[809.98px]:gap-8">
        {/* left column — badge/h2 sit 10px lower here than in other sections */}
        <div className="w-[420px] max-[809.98px]:w-full">
          <Eyebrow>{badge}</Eyebrow>
          <h2 className="t-h2 mt-[18px]">
            {title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="t-body mt-[6px]">{body}</p>
          <a href={ctaHref} className="btn btn-dark mt-4 w-[134px]">
            {cta}
          </a>
          <a href="/services" className="t-link mt-3 block text-ink underline underline-offset-4">
            All services
          </a>
        </div>

        {/* right column — three service cards (Visas / Air Ticketing / Hotel Booking) */}
        <div className="grid w-[798px] grid-cols-3 gap-6 max-[809.98px]:w-full max-[809.98px]:grid-cols-1">
          {SERVICES.map((s) => (
            <div key={s.title} className="flex flex-col rounded-lg bg-mist p-6">
              <Icon id={s.icon} size={36} />
              <h4 className="t-h4 mt-6">{s.title}</h4>
              <p className="t-body mt-2">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
