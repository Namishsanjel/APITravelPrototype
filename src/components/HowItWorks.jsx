import { STEPS_SECTION, STEPS } from "../data/content.js";
import { Eyebrow } from "./ui.jsx";

export default function HowItWorks() {
  const { badge, title, body, cta, ctaHref } = STEPS_SECTION;

  return (
    <section className="section-py">
      <div className="container-x flex justify-between">
        {/* left column — badge/h2 sit 10px lower here than in other sections */}
        <div className="w-[420px]">
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
        </div>

        {/* right column — four step cards */}
        <div className="flex w-[798px] flex-col gap-6">
          {STEPS.map((s) => (
            <div key={s.n} className="flex h-[128px] gap-9 rounded-lg bg-mist p-6">
              <span className="w-[36px] shrink-0 pt-1 text-center font-body text-[20px] leading-[28px] font-medium text-ink">
                {s.n}
              </span>
              <div className="flex-1">
                <h4 className="t-h4">{s.title}</h4>
                <p className="t-body mt-1">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
