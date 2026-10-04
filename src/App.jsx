import { useEffect, useState } from "react";
import { useSectionReveal } from "./motion.js";
import Home from "./pages/Home.jsx";
import HikesPage from "./pages/HikesPage.jsx";
import TourDetailPage from "./pages/TourDetailPage.jsx";
import DestinationsPage from "./pages/DestinationsPage.jsx";
import DestinationDetailPage from "./pages/DestinationDetailPage.jsx";
import ExperiencesPage from "./pages/ExperiencesPage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import PlanTripPage from "./pages/PlanTripPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import WhyPage from "./pages/WhyPage.jsx";
import GalleryPage from "./pages/GalleryPage.jsx";
import ReviewsPage from "./pages/ReviewsPage.jsx";
import JournalPage from "./pages/JournalPage.jsx";
import BlogDetailPage from "./pages/BlogDetailPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import FaqPage from "./pages/FaqPage.jsx";
import { TermsPage, PrivacyPage, CancellationPage } from "./pages/LegalPage.jsx";

/** "/tours.html" | "/tours/" | "/tours"  ->  "/tours" */
function normalize(path) {
  let p = path.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p || "/";
}

/** The two renamed sections keep working at their old URLs. */
const ALIASES = [
  [/^\/hikes(\/|$)/, "/tours$1"],
  [/^\/journal(\/|$)/, "/blog$1"],
];

function resolve(path) {
  let p = normalize(path);
  for (const [re, to] of ALIASES) if (re.test(p)) p = p.replace(re, to);
  return p;
}

const ROUTES = [
  { path: "/", Page: Home },
  { path: "/tours", Page: HikesPage },
  { path: "/tours/:slug", Page: TourDetailPage },
  { path: "/destinations", Page: DestinationsPage },
  { path: "/destinations/:slug", Page: DestinationDetailPage },
  { path: "/experiences", Page: ExperiencesPage },
  { path: "/services", Page: ServicesPage },
  { path: "/plan-your-trip", Page: PlanTripPage },
  { path: "/about", Page: AboutPage },
  { path: "/why-apitouch", Page: WhyPage },
  { path: "/gallery", Page: GalleryPage },
  { path: "/reviews", Page: ReviewsPage },
  { path: "/blog", Page: JournalPage },
  { path: "/blog/:slug", Page: BlogDetailPage },
  { path: "/contact", Page: ContactPage },
  { path: "/faq", Page: FaqPage },
  { path: "/terms-of-service", Page: TermsPage },
  { path: "/privacy-policy", Page: PrivacyPage },
  { path: "/cancellation-refund", Page: CancellationPage },
];

function match(path) {
  const parts = path.split("/").filter(Boolean);
  for (const route of ROUTES) {
    const rp = route.path.split("/").filter(Boolean);
    if (rp.length !== parts.length) continue;
    const ok = rp.every((seg, i) => seg.startsWith(":") || seg === parts[i]);
    if (ok) return route;
  }
  return null;
}

export default function App() {
  const [path, setPath] = useState(() => {
    const p = resolve(window.location.pathname);
    if (p !== normalize(window.location.pathname)) {
      window.history.replaceState({}, "", p + window.location.search + window.location.hash);
    }
    return p;
  });

  useEffect(() => {
    const onPop = () => setPath(resolve(window.location.pathname));

    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      const url = new URL(a.href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      e.preventDefault();
      if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
        window.history.pushState({}, "", url.pathname + url.search + url.hash);
        setPath(resolve(url.pathname));
        window.scrollTo(0, 0);
      } else if (url.hash) {
        document.querySelector(url.hash)?.scrollIntoView();
      }
    };

    window.addEventListener("popstate", onPop);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const route = match(path);
  const Page = route?.Page ?? Home;

  // Section-by-section scroll reveals, re-armed on every route change.
  useSectionReveal(path);

  return (
    <div className="relative min-h-screen bg-cream text-ink">
      <Page />
    </div>
  );
}
