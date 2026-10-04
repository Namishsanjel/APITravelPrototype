import { useEffect } from "react";
import PageShell from "../components/PageShell.jsx";
import { PageHeader, ImgBlur } from "../components/ui.jsx";
import { DESTINATIONS_PAGE, DESTINATIONS_ALL } from "../data/newPages.js";
import { PAGES } from "../data/content.js";

export default function DestinationsPage() {
  const page = PAGES["/destinations"];

  useEffect(() => {
    document.title = page.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", page.description);
  }, [page]);

  return (
    <PageShell>
      <section className="container-x flex flex-col gap-12 pt-[120px] pb-[60px]">
        <PageHeader badge={DESTINATIONS_PAGE.badge} title={DESTINATIONS_PAGE.title} sub={DESTINATIONS_PAGE.sub} />

        {DESTINATIONS_PAGE.groups.map((group) => {
          const list = DESTINATIONS_ALL.filter((d) => d.continent === group);
          if (!list.length) return null;
          return (
            <div key={group} className="flex flex-col gap-6">
              <div className="flex items-baseline justify-between border-b border-smoke/30 pb-3">
                <h2 className="t-h3s text-ink">{group}</h2>
                <p className="t-eyebrow text-smoke">
                  {list.length} {list.length === 1 ? "destination" : "destinations"}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 max-[1099.98px]:grid-cols-2 max-[809.98px]:grid-cols-1">
                {list.map((d) => (
                  <a
                    key={d.slug}
                    href={`/destinations/${d.slug}`}
                    className="relative block h-[380px] rounded-lg bg-mist p-1 [will-change:transform]"
                  >
                    <div className="relative h-full w-full overflow-hidden rounded">
                      <img src={d.image} alt={d.alt} className="absolute inset-0 h-full w-full object-cover" />
                      <div className="grad-card absolute inset-0" />
                      <ImgBlur />
                      <div className="absolute inset-0 z-10 flex flex-col justify-between p-4">
                        <div className="flex gap-2">
                          <span className="chip">{d.region}</span>
                        </div>
                        <div className="flex flex-col gap-3">
                          <h3 className="t-h3l text-mist">{d.name}</h3>
                          <span className="btn btn-cream w-[104px]">explore</span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}

        <div className="flex items-center justify-between gap-6 rounded-lg bg-mist p-6 max-[809.98px]:flex-col max-[809.98px]:items-start">
          <div className="flex flex-col gap-1">
            <p className="t-h4 text-ink">Ready to pick a route?</p>
            <p className="t-body">Every destination above has at least one tour we run ourselves.</p>
          </div>
          <a href="/tours" className="btn btn-dark w-[150px]">
            Browse all tours
          </a>
        </div>
      </section>
    </PageShell>
  );
}
