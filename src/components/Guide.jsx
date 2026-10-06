import { GUIDE_SECTION } from "../data/content.js";
import Icon from "../data/Icon.jsx";
import { Eyebrow } from "./ui.jsx";

export default function Guide() {
  const { badge, title, body1, body2, points, image, imageAlt, role, name } = GUIDE_SECTION;

  return (
    <section className="section-py">
      <div className="container-x flex justify-between">
        {/* left column */}
        <div className="w-[610px]">
          <Eyebrow>{badge}</Eyebrow>
          <h2 className="t-h2 mt-2">
            {title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="t-body mt-4 max-w-[480px]">{body1}</p>
          <p className="t-body mt-2 max-w-[480px]">{body2}</p>

          <div className="mt-12 flex gap-6">
            {points.map((pt) => (
              <div key={pt.title} className="w-[293px]">
                <Icon id={pt.icon} size={36} />
                <h4 className="t-h4 mt-4">{pt.title}</h4>
                <p className="t-body mt-1">{pt.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* lead-guide photo card */}
        <div className="relative h-[491px] w-[609px] overflow-hidden rounded-lg">
          <img src={image} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <Eyebrow color="var(--color-mist)">{role}</Eyebrow>
            <h4 className="t-h4 mt-1 text-mist">{name}</h4>
          </div>
        </div>
      </div>
    </section>
  );
}
