import { useEffect } from "react";
import PageShell from "../components/PageShell.jsx";
import { PageHeader } from "../components/ui.jsx";
import TourCard from "../components/TourCard.jsx";
import DestinationsPage from "./DestinationsPage.jsx";
import { DESTINATIONS_ALL } from "../data/newPages.js";
import { HIKES_ALL } from "../data/hikes.js";

function FactList({ title, items }) {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <h2 className="t-h4 text-ink">{title}</h2>
      <ul className="flex flex-col gap-2">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-[9px] h-[5px] w-[5px] shrink-0 rounded-full bg-primary" />
            <span className="t-body">{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DestinationDetailPage() {
  const slug = window.location.pathname.split("/").filter(Boolean).pop() ?? "";
  const dest = DESTINATIONS_ALL.find((d) => d.slug === slug);

  useEffect(() => {
    document.title = `${dest ? dest.name : "Destination"} — API Touch`;
  }, [dest]);

  if (!dest) return <DestinationsPage />;

  const tours = HIKES_ALL.filter((h) => dest.tours.includes(h.slug));

  return (
    <PageShell>
      <section className="container-x flex flex-col gap-8 pt-[120px]">
        <PageHeader badge={dest.region} title={dest.name} sub={dest.body} />
        <img src={dest.image} alt={dest.alt} className="h-[420px] w-full rounded-lg object-cover max-[809.98px]:h-[260px]" />
      </section>

      <section className="container-x flex flex-col gap-12 pb-[60px] pt-12">
        <div className="flex gap-12 max-[809.98px]:flex-col">
          <FactList title="Attractions" items={dest.attractions} />
          <FactList title="Activities" items={dest.activities} />
          <FactList title="Best time to visit" items={dest.bestTime} />
        </div>

        {tours.length ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-baseline justify-between border-b border-smoke/30 pb-3">
              <h2 className="t-h3s text-ink">Tour packages</h2>
              <a href="/tours" className="t-link text-smoke">
                All tours
              </a>
            </div>
            <div className="grid grid-cols-2 gap-6 max-[809.98px]:grid-cols-1">
              {tours.map((t, i) => (
                <TourCard key={t.slug} tour={t} index={i} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-6 rounded-lg bg-mist p-6 max-[809.98px]:flex-col max-[809.98px]:items-start">
          <div className="flex flex-col gap-1">
            <p className="t-h4 text-ink">Want {dest.name} built around you?</p>
            <p className="t-body">Tell us your dates and group size — we come back with a route and a price.</p>
          </div>
          <a href="/plan-your-trip" className="btn btn-dark w-[160px]">
            Plan your trip
          </a>
        </div>
      </section>
    </PageShell>
  );
}
