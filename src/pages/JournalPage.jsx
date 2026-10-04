import { useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Faq from "../components/Faq.jsx";
import Footer from "../components/Footer.jsx";
import { Eyebrow, ImgBlur, Words } from "../components/ui.jsx";
import { useReveal, stagger } from "../motion.js";
import { JOURNAL_PAGE } from "../data/pages.js";
import { PAGES } from "../data/content.js";

function PostCard({ post, titleW, index = null }) {
  const rv = useReveal({ delay: index == null ? 0 : stagger(index) });

  return (
    <a
      {...rv}
      href={post.href}
      className="rv relative block h-[480px] overflow-hidden rounded-lg bg-mist p-1"
    >
      {/* image layer: full-bleed, own 4px radius inside the cream frame */}
      <div className="absolute inset-0 overflow-hidden rounded">
        <img src={post.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="grad-card absolute inset-0" />
        <ImgBlur />
      </div>
      <div className="relative z-10 flex h-full flex-col justify-between p-4">
        <div className="flex gap-2">
          <span className="chip">{post.tag}</span>
          <span className="chip">{post.read}</span>
        </div>
        <h3 className="t-h3l text-mist" style={{ width: titleW }}>
          {post.title}
        </h3>
      </div>
    </a>
  );
}

export default function JournalPage() {
  const page = PAGES["/blog"];

  useEffect(() => {
    document.title = page.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", page.description);
  }, [page]);

  const { badge, title, sub, featured, categories, posts } = JOURNAL_PAGE;

  return (
    <>
      <Navbar variant="dark" />
      <main>
        <section className="container-x flex flex-col gap-12 pt-[120px] pb-[60px]">
          {/* header row */}
          <div className="flex items-end justify-between">
            <div className="flex w-[560px] flex-col gap-2">
              <Eyebrow>{badge}</Eyebrow>
              <h1 className="t-h1p">
                <Words text={title} />
              </h1>
            </div>
            <p className="t-body w-[706px] text-right">{sub}</p>
          </div>

          <PostCard post={featured} titleW="420px" />

          {/* categories + post grid */}
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-4">
              <h2 className="t-h2">Categories</h2>
              <div className="flex gap-[10px]">
                {categories.map((c, i) => (
                  <div key={c} className="rounded-lg bg-mist px-4 py-2">
                    <p className={`t-link ${i === 0 ? "text-ink" : "text-smoke"}`}>{c}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {posts.map((p, i) => (
                <PostCard key={p.href} post={p} titleW="366px" index={i} />
              ))}
            </div>
          </div>
        </section>

        <Faq />
      </main>
      <Footer />
    </>
  );
}
