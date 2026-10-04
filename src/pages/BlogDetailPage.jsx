import { useEffect } from "react";
import PageShell from "../components/PageShell.jsx";
import { PageHeader, ImgBlur } from "../components/ui.jsx";
import JournalPage from "./JournalPage.jsx";
import { BLOG_POSTS } from "../data/blogPosts.js";
import { JOURNAL_PAGE, ABOUT } from "../data/pages.js";

// slug -> photo, taken from the blog index page's own cards
const POST_IMAGE = [JOURNAL_PAGE.featured, ...JOURNAL_PAGE.posts].reduce((map, p) => {
  map[p.href.replace("/blog/", "")] = p.image;
  return map;
}, {});

// author name -> photo, from the About page's guide grid
const AUTHOR_IMAGE = ABOUT.guides.people.reduce((map, g) => {
  map[g.name] = g.image;
  return map;
}, {});

function ExploreCard({ post }) {
  return (
    <a href={post.href} className="relative block h-[503px] overflow-hidden rounded-lg bg-mist p-1">
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
        <h3 className="t-h3l text-mist">{post.title}</h3>
      </div>
    </a>
  );
}

export default function BlogDetailPage() {
  const slug = window.location.pathname.split("/").filter(Boolean).pop() ?? "";
  const post = BLOG_POSTS[slug];
  const image = POST_IMAGE[slug];

  useEffect(() => {
    document.title = `${post ? post.title : "Blog"} — API Touch`;
  }, [post]);

  if (!post) return <JournalPage />;

  const author = post.author;
  const explore = [JOURNAL_PAGE.featured, ...JOURNAL_PAGE.posts]
    .filter((p) => !p.href.endsWith(slug))
    .slice(0, 3);

  return (
    <PageShell>
      <section className="container-x flex flex-col gap-8 pt-[120px]">
        <PageHeader title={post.title} sub={post.intro} />

        <div className="relative h-[423px] overflow-hidden rounded-lg bg-mist p-1 max-[809.98px]:h-[280px]">
          <div className="relative h-full w-full overflow-hidden rounded">
            <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="grad-card absolute inset-0" />
            <ImgBlur />
            <div className="absolute inset-0 z-10 flex gap-2 p-4">
              <span className="chip">{post.tag}</span>
              <span className="chip">{post.read}</span>
              {post.date ? <span className="chip">{post.date}</span> : null}
            </div>
          </div>
        </div>
      </section>

      {/* article body + author card */}
      <section className="container-x flex justify-between gap-8 pb-[60px] pt-12 max-[1099.98px]:flex-col">
        <div className="flex w-[836px] flex-col gap-8 max-[1099.98px]:w-full">
          {post.sections.map((s, i) => (
            <div key={s.heading || i} className="flex flex-col gap-3">
              {s.heading ? <h2 className="t-h5 text-ink">{s.heading}</h2> : null}
              {s.paragraphs.map((p) => (
                <p key={p} className="t-body">
                  {p}
                </p>
              ))}
            </div>
          ))}
          {post.quote ? (
            <blockquote className="border-l-2 border-primary pl-4">
              <p className="t-h4 text-ink">{post.quote}</p>
            </blockquote>
          ) : null}
        </div>

        {author ? (
          <aside className="flex w-[341px] shrink-0 flex-col gap-4 self-start rounded-lg bg-mist p-5 max-[1099.98px]:w-full">
            <p className="t-h5 text-ink">About the Author</p>
            <p className="t-body">{author.bio}</p>
            <div className="flex items-center gap-3 border-t border-smoke/30 pt-4">
              <img src={AUTHOR_IMAGE[author.name]} alt="" className="h-[44px] w-[44px] rounded-md object-cover" />
              <div className="flex flex-col">
                <p className="t-link text-ink">{author.name}</p>
                <p className="t-eyebrow text-smoke">{author.role}</p>
              </div>
            </div>
          </aside>
        ) : null}
      </section>

      <section className="container-x flex flex-col gap-6 pb-[60px]">
        <h2 className="t-h3l text-ink">Explore more</h2>
        <div className="grid grid-cols-3 gap-6 max-[1099.98px]:grid-cols-2 max-[809.98px]:grid-cols-1">
          {explore.map((p) => (
            <ExploreCard key={p.href} post={p} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
