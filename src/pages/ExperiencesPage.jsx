import { useEffect } from "react";
import PageShell from "../components/PageShell.jsx";
import { PageHeader, ImgBlur } from "../components/ui.jsx";
import { EXPERIENCES_PAGE, EXPERIENCES } from "../data/newPages.js";
import { PAGES } from "../data/content.js";

export default function ExperiencesPage() {
  const page = PAGES["/experiences"];

  useEffect(() => {
    document.title = page.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", page.description);
  }, [page]);

  return (
    <PageShell>
      <section className="container-x flex flex-col gap-12 pt-[120px] pb-[60px]">
        <PageHeader badge={EXPERIENCES_PAGE.badge} title={EXPERIENCES_PAGE.title} sub={EXPERIENCES_PAGE.sub} />

        <div className="grid grid-cols-3 gap-6 max-[1099.98px]:grid-cols-2 max-[809.98px]:grid-cols-1">
          {EXPERIENCES.map((x) => (
            <a
              key={x.slug}
              href="/tours"
              className="relative block h-[420px] rounded-lg bg-mist p-1 [will-change:transform]"
            >
              <div className="relative h-full w-full overflow-hidden rounded">
                <img src={x.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="grad-card absolute inset-0" />
                <ImgBlur />
                <div className="absolute inset-0 z-10 flex flex-col justify-end gap-2 p-4">
                  <h3 className="t-h3l text-mist">{x.title}</h3>
                  <p className="t-body text-mist">{x.body}</p>
                  <span className="btn btn-cream mt-2 w-[134px]">browse trips</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
