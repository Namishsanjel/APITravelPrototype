import { EXPERIENCE_SECTION, EXPERIENCE_IMAGES } from "../data/content.js";
import { SectionHead, HeadCopy } from "./ui.jsx";

export default function Experience() {
  const [a, b, c, d] = EXPERIENCE_IMAGES;
  const cell = "overflow-hidden rounded-lg";
  return (
    <section id="gallery" className="section-py">
      <div className="container-x">
        <SectionHead badge={EXPERIENCE_SECTION.badge} title={EXPERIENCE_SECTION.title}>
          <HeadCopy>{EXPERIENCE_SECTION.body}</HeadCopy>
          <a href={EXPERIENCE_SECTION.ctaHref} className="btn btn-dark w-[171px]">
            {EXPERIENCE_SECTION.cta}
          </a>
        </SectionHead>

        <div className="mt-12 grid h-[666px] grid-cols-3 grid-rows-2 gap-x-4 gap-y-6">
          <div className={`row-span-2 ${cell}`}>
            <img src={a.src} alt={a.alt} className="h-full w-full object-cover" />
          </div>
          <div className={cell}>
            <img src={b.src} alt={b.alt} className="h-full w-full object-cover" />
          </div>
          <div className={cell}>
            <img src={c.src} alt={c.alt} className="h-full w-full object-cover" />
          </div>
          <div className={`col-span-2 ${cell}`}>
            <img src={d.src} alt={d.alt} className="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
