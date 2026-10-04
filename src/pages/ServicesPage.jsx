import { useEffect } from "react";
import PageShell from "../components/PageShell.jsx";
import { PageHeader } from "../components/ui.jsx";
import Icon from "../data/Icon.jsx";
import { SERVICES, INCLUDED_SECTION, INCLUDED_FEATURES, PAGES } from "../data/content.js";
import { SERVICES_PAGE } from "../data/newPages.js";

// icon ids from the site's own set, one per extra service card
const EXTRA_ICON = {
  Transportation: "535953797",
  Permits: "1118047839",
  "Travel insurance": "2109778876",
};

const FEATURES = [INCLUDED_FEATURES.guiding, INCLUDED_FEATURES.gear, INCLUDED_FEATURES.meals, INCLUDED_FEATURES.groups];

export default function ServicesPage() {
  const page = PAGES["/services"];

  useEffect(() => {
    document.title = page.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", page.description);
  }, [page]);

  return (
    <PageShell>
      <section className="container-x flex flex-col gap-12 pt-[120px] pb-[60px]">
        <PageHeader badge={SERVICES_PAGE.badge} title={SERVICES_PAGE.title} sub={SERVICES_PAGE.sub} />

        {/* the three core services, same cards as the home section */}
        <div className="grid grid-cols-3 gap-6 max-[809.98px]:grid-cols-1">
          {SERVICES.map((s) => (
            <div key={s.title} className="flex flex-col rounded-lg bg-mist p-6">
              <Icon id={s.icon} size={36} />
              <h4 className="t-h4 mt-6">{s.title}</h4>
              <p className="t-body mt-2">{s.body}</p>
            </div>
          ))}
        </div>

        {/* the rest of the list */}
        <div className="grid grid-cols-3 gap-6 max-[809.98px]:grid-cols-1">
          {SERVICES_PAGE.extra.map((s) => (
            <div key={s.title} className="flex flex-col gap-4 rounded-lg bg-mist p-6">
              {s.image ? (
                <img src={s.image} alt="" className="h-[140px] w-full rounded-lg object-cover" />
              ) : (
                <Icon id={EXTRA_ICON[s.title]} size={36} />
              )}
              <div className="flex flex-col gap-2">
                <h4 className="t-h4">{s.title}</h4>
                <p className="t-body">{s.body}</p>
                <p className="t-body">{s.note}</p>
              </div>
            </div>
          ))}
        </div>

        {/* what's included + the way over to the planning form */}
        <div className="flex flex-col gap-8 rounded-lg bg-mist p-8 max-[809.98px]:p-6">
          <div className="flex items-end justify-between gap-6 max-[809.98px]:flex-col max-[809.98px]:items-start">
            <div className="flex w-[560px] flex-col gap-2 max-[809.98px]:w-full">
              <h2 className="t-h3l text-ink">{INCLUDED_SECTION.title.join(" ")}</h2>
              <p className="t-body">{INCLUDED_SECTION.body}</p>
            </div>
            <a href={SERVICES_PAGE.ctaHref} className="btn btn-dark w-[150px]">
              {SERVICES_PAGE.cta}
            </a>
          </div>

          <div className="grid grid-cols-4 gap-6 max-[809.98px]:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col gap-2 rounded-lg bg-cream p-4">
                <Icon id={f.icon} size={30} />
                <p className="t-link text-ink">{f.title}</p>
                <p className="t-body">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
