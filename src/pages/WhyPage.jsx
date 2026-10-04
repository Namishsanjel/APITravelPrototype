import { useEffect } from "react";
import PageShell from "../components/PageShell.jsx";
import { PageHeader } from "../components/ui.jsx";
import Icon from "../data/Icon.jsx";
import { ABOUT } from "../data/pages.js";
import { GUIDE_SECTION, PAGES } from "../data/content.js";

// Bodies are lifted verbatim from the home page's "Why API Touch" cards and
// the guide section; only two headings are new.
const STRENGTHS = [
  ...ABOUT.why.cards,
  { title: "Experienced guides", body: GUIDE_SECTION.points[0].body },
  { title: "Personalized service", body: "Beginners get the full walkthrough, gear to footing, no assumptions made." },
  { title: "Safety & support", body: GUIDE_SECTION.points[1].body },
];

const STRENGTH_ICON = ["2327548604", "535953797", "1118047839", "2784223275", "50407791", "2109778876"];

export default function WhyPage() {
  const page = PAGES["/why-apitouch"];

  useEffect(() => {
    document.title = page.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", page.description);
  }, [page]);

  return (
    <PageShell>
      <section className="container-x flex flex-col gap-12 pt-[120px] pb-[60px]">
        <PageHeader badge={ABOUT.why.badge} title={ABOUT.why.title.join(" ")} sub={ABOUT.why.body} />

        {/* banner with the three mist cards sitting on it, as on the About page */}
        <div className="relative h-[444px] overflow-hidden rounded-lg p-[24px] pt-[240px] max-[809.98px]:h-auto max-[809.98px]:pt-[180px]">
          <img src={ABOUT.why.banner} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="relative z-10 flex gap-6 max-[809.98px]:flex-col">
            {STRENGTHS.slice(0, 3).map((c) => (
              <div key={c.title} className="flex h-[180px] flex-1 flex-col justify-end gap-1 rounded-lg bg-mist p-4">
                <h4 className="t-h4 text-ink">{c.title}</h4>
                <p className="t-body">{c.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* the rest of the strengths */}
        <div className="grid grid-cols-3 gap-6 max-[1099.98px]:grid-cols-2 max-[809.98px]:grid-cols-1">
          {STRENGTHS.slice(3).map((c, i) => (
            <div key={c.title} className="flex flex-col gap-3 rounded-lg bg-mist p-6">
              <Icon id={STRENGTH_ICON[i + 3]} size={36} />
              <h4 className="t-h4 text-ink">{c.title}</h4>
              <p className="t-body">{c.body}</p>
            </div>
          ))}
        </div>

        {/* the people behind those strengths */}
        <div className="flex items-center justify-between gap-6 rounded-lg bg-mist p-6 max-[809.98px]:flex-col max-[809.98px]:items-start">
          <div className="flex items-center gap-4">
            <img src={GUIDE_SECTION.image} alt={GUIDE_SECTION.imageAlt} className="h-[72px] w-[72px] rounded-lg object-cover" />
            <div className="flex flex-col gap-1">
              <p className="t-h4 text-ink">{GUIDE_SECTION.title.join(" ")}</p>
              <p className="t-body">{GUIDE_SECTION.body1}</p>
            </div>
          </div>
          <a href="/about" className="btn btn-dark w-[110px]">
            meet us
          </a>
        </div>
      </section>
    </PageShell>
  );
}
