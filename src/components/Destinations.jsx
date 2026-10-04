import { DESTINATIONS_SECTION, DESTINATIONS } from "../data/content.js";
import { SectionHead, HeadCopy, Eyebrow } from "./ui.jsx";
import { Reveal } from "../anim.jsx";
import { stagger } from "../motion.js";

/** Alternating rows: photo on one side, region + heading + copy on the other. */
export default function Destinations() {
  return (
    <section id="destinations" className="section-py">
      <div className="container-x">
        <SectionHead badge={DESTINATIONS_SECTION.badge} title={DESTINATIONS_SECTION.title}>
          <HeadCopy>{DESTINATIONS_SECTION.body}</HeadCopy>
          <a href="/destinations" className="t-link text-ink underline underline-offset-4">
            All destinations
          </a>
        </SectionHead>

        <div className="mt-12 flex flex-col gap-12">
          {DESTINATIONS.map((d, i) => (
            <Reveal
              key={d.title}
              delay={stagger(i, 120)}
              className={`flex items-center gap-16 max-[809.98px]:flex-col max-[809.98px]:items-start max-[809.98px]:gap-6 ${
                i % 2 === 1 ? "flex-row-reverse" : ""
              }`}
            >
              <img
                src={d.image}
                alt={d.alt}
                loading="lazy"
                className="h-[420px] w-[645px] shrink-0 rounded-lg object-cover max-[809.98px]:h-[240px] max-[809.98px]:w-full"
              />
              <div className="flex-1 max-[809.98px]:w-full">
                <Eyebrow>{d.region}</Eyebrow>
                <h3 className="t-h3l mt-3">
                  <a href={`/destinations/${d.slug}`}>{d.title}</a>
                </h3>
                <p className="t-body mt-3 max-w-[470px] max-[809.98px]:max-w-none">{d.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
