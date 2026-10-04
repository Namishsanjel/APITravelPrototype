import { useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Faq from "../components/Faq.jsx";
import Footer from "../components/Footer.jsx";
import { Eyebrow, SectionHead, HeadCopy, ImgBlur, Words } from "../components/ui.jsx";
import { ABOUT } from "../data/pages.js";
import { PAGES } from "../data/content.js";

export default function AboutPage() {
  const page = PAGES["/about"];

  useEffect(() => {
    document.title = page.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", page.description);
  }, [page]);

  return (
    <>
      <Navbar variant="dark" />
      <main>
        {/* hero: badge + headline left, intro copy right, banner below */}
        <section className="container-x flex flex-col gap-12 pt-[120px] pb-[60px]">
          <div className="flex items-end justify-between">
            <div className="flex w-[560px] flex-col gap-2">
              <Eyebrow>{ABOUT.badge}</Eyebrow>
              <h1 className="t-h1p">
                <Words text={ABOUT.title} />
              </h1>
            </div>
            <p className="t-body w-[706px] text-right">{ABOUT.sub}</p>
          </div>
          <img
            src={ABOUT.banner}
            alt=""
            className="h-[420px] w-full rounded-lg object-cover"
          />
        </section>

        {/* our story: badge column, two paragraphs, square photo */}
        <section className="section-py container-x">
          <div className="flex gap-12">
            <div className="w-[160px] shrink-0">
              <Eyebrow>{ABOUT.story.badge}</Eyebrow>
            </div>
            <div className="flex w-[650px] shrink-0 flex-col gap-4">
              {ABOUT.story.paragraphs.map((t) => (
                <h4 key={t} className="t-h4 text-ink">
                  {t}
                </h4>
              ))}
            </div>
            <div className="relative w-[360px] shrink-0 self-stretch">
              <img
                src={ABOUT.story.image}
                alt=""
                className="absolute inset-0 h-full w-full rounded-lg object-cover"
              />
            </div>
          </div>
        </section>

        {/* why API touch: header + banner holding three mist cards */}
        <section className="section-py container-x flex flex-col gap-12">
          <SectionHead
            badge={ABOUT.why.badge}
            title={ABOUT.why.title}
            leftW={420}
            rightW={846}
          >
            <HeadCopy>{ABOUT.why.body}</HeadCopy>
            <a href="/why-apitouch" className="t-link text-ink underline underline-offset-4">
              All reasons to travel with us
            </a>
          </SectionHead>
          <div className="relative h-[444px] overflow-hidden rounded-lg p-[24px] pt-[240px]">
            <img
              src={ABOUT.why.banner}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="relative z-10 flex gap-6">
              {ABOUT.why.cards.map((c) => (
                <div
                  key={c.title}
                  className="flex h-[180px] flex-1 flex-col justify-end gap-1 rounded-lg bg-mist p-4"
                >
                  <h4 className="t-h4 text-ink">{c.title}</h4>
                  <p className="t-body">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* our guides: 2 x 3 photo cards */}
        <section className="section-py container-x flex flex-col gap-12">
          <SectionHead
            badge={ABOUT.guides.badge}
            title={ABOUT.guides.title}
            leftW={560}
            rightW={706}
          >
            <HeadCopy>{ABOUT.guides.body}</HeadCopy>
          </SectionHead>
          <div className="grid grid-cols-3 gap-6">
            {ABOUT.guides.people.map((g) => (
              <div key={g.name} className="relative h-[501px] overflow-hidden rounded-lg">
                <img src={g.image} alt={g.name} className="absolute inset-0 h-full w-full object-cover" />
                <ImgBlur />
                <div className="absolute inset-0 z-10 flex flex-col justify-end gap-1 p-4">
                  <Eyebrow className="capitalize" color="var(--color-secondary)">
                    {g.role}
                  </Eyebrow>
                  <h4 className="t-h4 text-mist">{g.name}</h4>
                </div>
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
