import { useEffect, useState } from "react";
import PageShell from "../components/PageShell.jsx";
import { PageHeader, ImgBlur } from "../components/ui.jsx";
import TourCard from "../components/TourCard.jsx";
import { HIKES_ALL } from "../data/hikes.js";
import { TOUR_DETAILS } from "../data/tourDetails.js";
import { GALLERY } from "../data/pages.js";

const GALLERY_IMAGES = GALLERY.columns.flat().map((c) => c.src);

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
      <rect x="1.5" y="1.5" width="13" height="13" rx="4" stroke="currentColor" strokeWidth="1.2" />
      <path d="m5 8.2 2.1 2.1L11 6.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Arrow({ dir }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d={dir === "left" ? "M8.75 3.5 5.25 7l3.5 3.5" : "M5.25 3.5 8.75 7l-3.5 3.5"}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TourDetailPage() {
  const slug = window.location.pathname.split("/").filter(Boolean).pop() ?? "";
  const tour = HIKES_ALL.find((h) => h.slug === slug);
  const detail = TOUR_DETAILS[slug];
  const [shot, setShot] = useState(0);

  useEffect(() => {
    document.title = `${detail ? detail.title : "Tour"} — API Touch`;
  }, [detail]);

  if (!tour || !detail) {
    return (
      <PageShell faq={false}>
        <section className="container-x flex flex-col gap-6 pt-[120px] pb-[60px]">
          <PageHeader badge="Tour" title="This tour could not be found" />
          <a href="/tours" className="btn btn-dark w-[160px]">
            Browse all tours
          </a>
        </section>
      </PageShell>
    );
  }

  const [tagline, ...overview] = detail.overview.split("\n\n");
  const [amount, unit] = detail.price.split(" /");
  const others = HIKES_ALL.filter((h) => h.slug !== slug).slice(0, 2);

  return (
    <PageShell>
      {/* headline + standfirst, as on the original detail page */}
      <section className="container-x flex flex-col gap-8 pt-[120px]">
        <PageHeader title={detail.title} sub={tagline} />

        {/* hero photo with the trip facts glassed over it */}
        <div className="relative h-[360px] overflow-hidden rounded-lg bg-mist p-1 max-[809.98px]:h-[260px]">
          <div className="relative h-full w-full overflow-hidden rounded">
            <img src={tour.image} alt={tour.alt} className="absolute inset-0 h-full w-full object-cover" />
            <div className="grad-card absolute inset-0" />
            <ImgBlur />
            <div className="absolute inset-0 z-10 flex gap-2 p-4">
              {detail.chips.map((c) => (
                <span key={c} className="chip">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* body: itinerary column + booking card */}
      <section className="container-x flex justify-between gap-8 pb-[60px] pt-12 max-[1099.98px]:flex-col">
        <div className="flex w-[800px] flex-col gap-10 max-[1099.98px]:w-full">
          <div className="flex flex-col gap-3">
            <h2 className="t-h4 text-ink">Overview</h2>
            {overview.map((p) => (
              <p key={p} className="t-body">
                {p}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="t-h4 text-ink">What's Included</h2>
            <div className="grid grid-cols-3 gap-x-6 gap-y-3 max-[809.98px]:grid-cols-2">
              {detail.inclusions.map((i) => (
                <div key={i} className="flex items-center gap-2 text-ink">
                  <CheckIcon />
                  <p className="t-body text-ink">{i}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="t-h4 text-ink">Gallery</h2>
            <div className="relative h-[380px] overflow-hidden rounded-lg max-[809.98px]:h-[260px]">
              <img
                key={shot}
                src={GALLERY_IMAGES[shot]}
                alt={tour.alt}
                className="shot-in absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={() => setShot((i) => (i - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-mist text-ink"
                >
                  <Arrow dir="left" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={() => setShot((i) => (i + 1) % GALLERY_IMAGES.length)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-mist text-ink"
                >
                  <Arrow dir="right" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="t-h4 text-ink">Tour Schedule</h2>
            <div className="flex flex-col gap-3">
              {detail.itinerary.map((d, i) => (
                <p key={`${d.day}-${i}`} className="t-body">
                  <span className="text-ink">{d.day}</span>
                  {d.title ? ` — ${d.title}` : ""} — {d.body}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* booking card: photo, trip facts, price and the booking CTA */}
        <aside className="flex w-[470px] shrink-0 flex-col gap-5 self-start rounded-lg bg-mist p-6 max-[1099.98px]:w-full">
          <div className="h-[170px] overflow-hidden rounded-lg">
            <img src={tour.image} alt="" className="h-full w-full object-cover" />
          </div>

          {detail.start ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <p className="t-link text-ink">{detail.start}</p>
                <p className="t-eyebrow text-smoke">Starting Point</p>
              </div>
              <div className="h-px flex-1 border-t border-dashed border-smoke" />
              <div className="flex flex-col items-end">
                <p className="t-link text-ink">{detail.end}</p>
                <p className="t-eyebrow text-smoke">Ending Point</p>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-4">
            <div className="flex items-baseline gap-1">
              <span className="t-h2 text-ink">{amount}</span>
              <span className="t-body">/{unit}</span>
            </div>

            <a href="/plan-your-trip" className="btn btn-dark h-[51px] w-full">
              Book This Tour
            </a>
          </div>
        </aside>
      </section>

      <section className="container-x flex flex-col gap-6 pb-[60px]">
        <h2 className="t-h3l text-ink">More Tours to Explore</h2>
        <div className="grid grid-cols-2 gap-6 max-[809.98px]:grid-cols-1">
          {others.map((t, i) => (
            <TourCard key={t.slug} tour={t} index={i} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
