import { useEffect } from "react";
import PageShell from "../components/PageShell.jsx";
import { PageHeader } from "../components/ui.jsx";
import { FaqList } from "../components/Faq.jsx";
import { FAQ_SECTION, PAGES } from "../data/content.js";
import { CANCELLATION } from "../data/newPages.js";

export default function FaqPage() {
  const page = PAGES["/faq"];

  useEffect(() => {
    document.title = page.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", page.description);
  }, [page]);

  return (
    <PageShell faq={false}>
      <section className="container-x flex flex-col gap-12 pt-[120px] pb-[60px]">
        <PageHeader badge={FAQ_SECTION.badge} title={FAQ_SECTION.title.join(" ")} sub={FAQ_SECTION.body} />

        <FaqList />

        <div className="flex flex-col gap-4 rounded-lg bg-mist p-6">
          <p className="t-h4 text-ink">Booking rules</p>
          <p className="t-body">
            The fine print for bookings, payments and data lives on three pages — read them before you reserve a place.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="/terms-of-service" className="btn btn-dark w-[170px]">
              Terms &amp; Conditions
            </a>
            <a href="/privacy-policy" className="btn btn-cream w-[150px]">
              Privacy Policy
            </a>
            <a href={`/${CANCELLATION.slug}`} className="btn btn-cream w-[230px]">
              Cancellation &amp; Refund
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
