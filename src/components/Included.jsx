import { INCLUDED_SECTION, INCLUDED_FEATURES, INCLUDED_PHOTOS } from "../data/content.js";
import { SectionHead, HeadCopy } from "./ui.jsx";
import Icon from "../data/Icon.jsx";

/** Mist card: icon, heading, one-line description (measured 625/305 x 180). */
function FeatureCard({ item, className = "" }) {
  return (
    <div className={`flex h-[180px] flex-col rounded-lg bg-mist p-4 ${className}`}>
      <Icon id={item.icon} size={36} />
      <h4 className="t-h4 mt-8">{item.title}</h4>
      <p className="t-body mt-1">{item.body}</p>
    </div>
  );
}

/** Photo card: image fills the card, copy sits bottom-left on p-4. */
function PhotoCard({ item, className = "" }) {
  return (
    <div className={`relative h-[180px] overflow-hidden rounded-lg ${className}`}>
      <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <h4 className="t-h4 text-mist">{item.title}</h4>
        <p className="t-body mt-1 text-sage">{item.body}</p>
      </div>
    </div>
  );
}

export default function Included() {
  const { guiding, gear, meals, groups } = INCLUDED_FEATURES;
  const { transfers, always } = INCLUDED_PHOTOS;

  return (
    <section className="section-py">
      <div className="container-x">
        <SectionHead badge={INCLUDED_SECTION.badge} title={INCLUDED_SECTION.title}>
          <HeadCopy>{INCLUDED_SECTION.body}</HeadCopy>
        </SectionHead>

        <div className="mt-12 grid grid-cols-2 gap-4">
          {/* left half */}
          <div className="grid grid-cols-2 gap-4">
            <FeatureCard item={guiding} />
            <FeatureCard item={gear} />
            <PhotoCard item={always} className="col-span-2" />
          </div>
          {/* right half */}
          <div className="grid grid-cols-2 gap-4">
            <PhotoCard item={transfers} className="col-span-2" />
            <FeatureCard item={meals} />
            <FeatureCard item={groups} />
          </div>
        </div>
      </div>
    </section>
  );
}
