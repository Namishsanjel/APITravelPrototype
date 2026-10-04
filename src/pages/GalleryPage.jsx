import { useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Faq from "../components/Faq.jsx";
import Footer from "../components/Footer.jsx";
import { Eyebrow, Words } from "../components/ui.jsx";
import { Reveal } from "../anim.jsx";
import { stagger } from "../motion.js";
import { GALLERY } from "../data/pages.js";
import { PAGES } from "../data/content.js";

export default function GalleryPage() {
  const page = PAGES["/gallery"];

  useEffect(() => {
    document.title = page.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", page.description);
  }, [page]);

  return (
    <>
      <Navbar variant="dark" />
      <main>
        {/* hero + masonry grid share one section (measured: pt120 / gap48 / pb60) */}
        <section className="container-x flex flex-col gap-12 pt-[120px] pb-[60px]">
          <div className="flex items-end justify-between">
            <div className="flex w-[560px] flex-col gap-2">
              <Eyebrow>{GALLERY.badge}</Eyebrow>
              <h1 className="t-h1p">
                <Words text={GALLERY.title} />
              </h1>
            </div>
            <p className="t-body w-[706px] text-right">{GALLERY.sub}</p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {GALLERY.columns.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-6">
                {col.map((img, i) => (
                  <Reveal
                    as="img"
                    key={img.src}
                    delay={stagger(i) + ci * 60}
                    src={img.src}
                    alt=""
                    loading="lazy"
                    className="w-full rounded-lg object-cover"
                    style={{ aspectRatio: `${img.w} / ${img.h}` }}
                  />
                ))}
              </div>
            ))}
          </div>
        </section>

        <Faq />
      </main>
      <Footer />
    </>
  );
}
