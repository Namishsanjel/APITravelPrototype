import { HIKES_SECTION, HIKES } from "../data/content.js";
import { SectionHead, HeadCopy } from "./ui.jsx";
import { useReveal, stagger } from "../motion.js";

function HikeCard({ hike, className = "", big = false, index = null }) {
  const rv = useReveal({ delay: index == null ? 0 : stagger(index) });

  return (
    <a
      {...rv}
      href={hike.href}
      className={`rv relative block overflow-hidden rounded-lg bg-mist p-1 ${className}`}
    >
      <div className="relative h-full w-full overflow-hidden">
        <img src={hike.image} alt={hike.alt} className="absolute inset-0 h-full w-full object-cover" />
        <div className="grad-card absolute inset-0" />
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <div className="flex gap-2">
            {hike.chips.map((c) => (
              <span key={c} className="chip">
                {c}
              </span>
            ))}
          </div>
          <div>
            <h3 className={`${big ? "t-h3l" : "t-h3s"} text-mist`}>{hike.title}</h3>
            <span className="btn btn-dark btn-roll mt-4 w-[113px]">
              <span className="roll">
                <span>Learn More</span>
                <span aria-hidden="true">Learn More</span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

export default function Hikes() {
  const [a, b, c, d] = HIKES;
  return (
    <section id="hikes" className="section-py">
      <div className="container-x">
        <SectionHead badge={HIKES_SECTION.badge} title={HIKES_SECTION.title}>
          <HeadCopy>{HIKES_SECTION.body}</HeadCopy>
          <a href={HIKES_SECTION.ctaHref} className="btn btn-dark btn-roll w-[150px]">
            <span className="roll">
              <span>{HIKES_SECTION.cta}</span>
              <span aria-hidden="true">{HIKES_SECTION.cta}</span>
            </span>
          </a>
          <a href="/experiences" className="t-link text-ink underline underline-offset-4">
            Browse by experience
          </a>
        </SectionHead>

        <div className="mt-12 grid h-[600px] grid-cols-3 grid-rows-2 gap-4">
          <HikeCard hike={a} big index={0} className="row-span-2" />
          <HikeCard hike={b} index={1} />
          <HikeCard hike={c} index={2} />
          <HikeCard hike={d} index={3} className="col-span-2" />
        </div>
      </div>
    </section>
  );
}
