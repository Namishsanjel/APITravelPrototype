import { ImgBlur } from "./ui.jsx";
import { useReveal, stagger } from "../motion.js";

/**
 * The CMS card from the tours listing page (chips, title, "learn more"),
 * extracted so the tour detail page's "more tours" row can reuse it.
 */
export default function TourCard({ tour, index = null }) {
  const rv = useReveal({ delay: index == null ? 0 : stagger(index) });

  return (
    <div
      {...rv}
      className="rv relative h-[600px] rounded-lg bg-mist p-1 [will-change:transform]"
    >
      <div className="relative h-full w-full overflow-hidden rounded">
        <img src={tour.image} alt={tour.alt} className="absolute inset-0 h-full w-full object-cover" />
        <div className="grad-card absolute inset-0" />
        <ImgBlur />
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-4">
          <div className="flex gap-2">
            {tour.chips.map((c) => (
              <span key={c} className="chip">
                {c}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="t-h3l text-mist">{tour.title}</h3>
            <a href={tour.href} className="btn btn-dark btn-roll w-[113px]">
              <span className="roll">
                <span>Learn More</span>
                <span aria-hidden="true">Learn More</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
