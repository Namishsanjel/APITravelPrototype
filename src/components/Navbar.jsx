import { useEffect, useRef, useState } from "react";
import { NAV_LINKS, IMG } from "../data/content.js";
import { DESTINATIONS_ALL, DESTINATIONS_PAGE } from "../data/newPages.js";
import { HIKES_ALL, HIKES_PAGE } from "../data/hikes.js";
import { TOUR_DETAILS } from "../data/tourDetails.js";
import { ImgBlur } from "./ui.jsx";
import { useReveal } from "../motion.js";

/** The 11x7 chevron the booking form's select already uses, pointed down. */
function ChevronDown({ className = "" }) {
  return (
    <svg className={className} width="11" height="7" viewBox="0 0 11 7" fill="none" aria-hidden="true">
      <path
        d="M1 1 5.5 5.6 10 1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Regions read "Country · Area"; the list already shows the country. */
function areaOf(dest) {
  return dest.region.split("·").pop().trim();
}

/**
 * Destination preview — the destinations page card (photo + grad-card +
 * ImgBlur + glass region chip + name + cream CTA) at menu size, with the
 * page's body copy set beside the name.
 */
function DestinationPreview({ dest }) {
  return (
    <a href={`/destinations/${dest.slug}`} className="relative flex-1 rounded-lg bg-mist p-1">
      <div className="relative h-[380px] w-full overflow-hidden rounded max-[1099.98px]:h-[340px]">
        <img src={dest.image} alt={dest.alt} className="absolute inset-0 h-full w-full object-cover" />
        <div className="grad-card absolute inset-0" />
        <ImgBlur />
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-6">
          <div className="flex gap-2">
            <span className="chip">{dest.region}</span>
          </div>
          <div className="flex items-end justify-between gap-8">
            <div className="flex flex-col gap-3">
              <h3 className="t-h3l text-mist">{dest.name}</h3>
              <p className="t-body w-[430px] text-mist max-[1099.98px]:hidden">{dest.body}</p>
            </div>
            <span className="btn btn-cream w-[104px]">explore</span>
          </div>
        </div>
      </div>
    </a>
  );
}

/**
 * Destinations mega-menu: the page's continent groups down the left (name +
 * area, in the order the page files them), the hovered destination's card
 * filling the right, and the banner the page closes with underneath. Flush
 * with the nav bar above it — the bar itself turns white while this is open,
 * so the two read as one panel.
 */
function DestinationsMenu({ onNavigate }) {
  const [active, setActive] = useState(DESTINATIONS_ALL[0].slug);
  const groups = DESTINATIONS_PAGE.groups
    .map((group) => DESTINATIONS_ALL.filter((d) => d.continent === group))
    .filter((list) => list.length);
  const total = groups.reduce((n, list) => n + list.length, 0);
  const current = DESTINATIONS_ALL.find((d) => d.slug === active) ?? DESTINATIONS_ALL[0];

  return (
    <div id="nav-destinations-menu" className="absolute inset-x-0 top-full max-[809.98px]:hidden">
      <div className="menu-in flex max-h-[calc(100vh-116px)] flex-col gap-5 overflow-y-auto rounded-b-lg bg-white p-6 shadow-[0_30px_70px_-30px_rgba(6,12,8,0.55)]">
        <div className="flex gap-5">
          <nav className="flex w-[360px] shrink-0 flex-col max-[1099.98px]:w-[280px]">
            {groups.flat().map((d) => (
              <a
                key={d.slug}
                href={`/destinations/${d.slug}`}
                onClick={onNavigate}
                onMouseEnter={() => setActive(d.slug)}
                onFocus={() => setActive(d.slug)}
                aria-current={d.slug === current.slug ? "true" : undefined}
                className={`flex flex-1 items-center justify-between gap-3 rounded-lg px-3 transition-colors ${
                  d.slug === current.slug ? "bg-mist" : "hover:bg-mist/60"
                }`}
              >
                <span className={`t-h5 ${d.slug === current.slug ? "text-primary" : "text-ink"}`}>{d.name}</span>
                <span className="t-eyebrow text-smoke">{areaOf(d)}</span>
              </a>
            ))}
          </nav>

          <DestinationPreview dest={current} />
        </div>

        <div className="flex items-center justify-between gap-6 border-t border-ink/10 pt-5">
          <div className="flex items-center gap-6">
            <p className="t-eyebrow text-smoke">
              {total} destinations · {groups.length} continents
            </p>
            <a href="/destinations" onClick={onNavigate} className="t-link text-ink underline underline-offset-4">
              All destinations
            </a>
          </div>
          <a href="/tours" onClick={onNavigate} className="btn btn-dark w-[150px]">
            Browse all tours
          </a>
        </div>
      </div>
    </div>
  );
}

/** Tours grouped by their difficulty chip; "All" is a filter, not a level. */
const DIFFICULTIES = HIKES_PAGE.filters.filter((f) => f !== "All");

/**
 * Package preview — the tours page card (photo + grad-card + ImgBlur +
 * chips + name + price + cream CTA) at menu size, mirroring the destination
 * preview above. Price comes from the tour's own detail page where we have one.
 */
function PackagePreview({ pkg }) {
  const detail = TOUR_DETAILS[pkg.slug];
  return (
    <a href={pkg.href} className="relative flex-1 rounded-lg bg-mist p-1">
      <div className="relative h-[380px] w-full overflow-hidden rounded max-[1099.98px]:h-[340px]">
        <img src={pkg.image} alt={pkg.alt} className="absolute inset-0 h-full w-full object-cover" />
        <div className="grad-card absolute inset-0" />
        <ImgBlur />
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-6">
          <div className="flex gap-2">
            {pkg.chips.map((c) => (
              <span key={c} className="chip">
                {c}
              </span>
            ))}
          </div>
          <div className="flex items-end justify-between gap-8">
            <div className="flex flex-col gap-3">
              <h3 className="t-h3l text-mist">{pkg.title}</h3>
              {detail?.price ? (
                <p className="t-body text-mist max-[1099.98px]:hidden">{detail.price}</p>
              ) : null}
            </div>
            <span className="btn btn-cream w-[104px]">explore</span>
          </div>
        </div>
      </div>
    </a>
  );
}

/**
 * Packages mega-menu, built to the same shape as the destinations one: the
 * tours down the left (name + duration, grouped by difficulty), the hovered
 * tour's card filling the right, and the closing banner underneath.
 */
function PackagesMenu({ onNavigate }) {
  const [active, setActive] = useState(HIKES_ALL[0].slug);
  const groups = DIFFICULTIES.map((level) => HIKES_ALL.filter((p) => p.chips[0] === level)).filter(
    (list) => list.length
  );
  const current = HIKES_ALL.find((p) => p.slug === active) ?? HIKES_ALL[0];

  return (
    <div id="nav-packages-menu" className="absolute inset-x-0 top-full max-[809.98px]:hidden">
      <div className="menu-in flex max-h-[calc(100vh-116px)] flex-col gap-5 overflow-y-auto rounded-b-lg bg-white p-6 shadow-[0_30px_70px_-30px_rgba(6,12,8,0.55)]">
        <div className="flex gap-5">
          <nav className="flex w-[360px] shrink-0 flex-col max-[1099.98px]:w-[280px]">
            {groups.flat().map((p) => (
              <a
                key={p.slug}
                href={p.href}
                onClick={onNavigate}
                onMouseEnter={() => setActive(p.slug)}
                onFocus={() => setActive(p.slug)}
                aria-current={p.slug === current.slug ? "true" : undefined}
                className={`flex flex-1 items-center justify-between gap-3 rounded-lg px-3 transition-colors ${
                  p.slug === current.slug ? "bg-mist" : "hover:bg-mist/60"
                }`}
              >
                <span className={`t-h5 ${p.slug === current.slug ? "text-primary" : "text-ink"}`}>{p.title}</span>
                <span className="t-eyebrow text-smoke">{p.chips[1]}</span>
              </a>
            ))}
          </nav>

          <PackagePreview pkg={current} />
        </div>

        <div className="flex items-center justify-between gap-6 border-t border-ink/10 pt-5">
          <div className="flex items-center gap-6">
            <p className="t-eyebrow text-smoke">
              {HIKES_ALL.length} packages · {groups.length} difficulty levels
            </p>
            <a href="/tours" onClick={onNavigate} className="t-link text-ink underline underline-offset-4">
              All packages
            </a>
          </div>
          <a href="/plan-your-trip" onClick={onNavigate} className="btn btn-dark w-[150px]">
            Plan your trip
          </a>
        </div>
      </div>
    </div>
  );
}

/** menu key -> the panel it opens, keyed for aria-controls. */
const MENUS = {
  destinations: DestinationsMenu,
  packages: PackagesMenu,
};

/**
 * variant "light" (default): light links + white logo — over the hero image (home).
 * variant "dark": ink links + dark logo — on the cream page background (inner pages).
 */
export default function Navbar({ variant = "light" }) {
  const dark = variant === "dark";
  // which menu is open, or null — a key into MENUS rather than a flag, so the
  // bar only ever has one panel up but can swap between them
  const [openMenu, setOpenMenu] = useState(null);
  const rv = useReveal({ effect: "fade" });
  const shell = useRef(null);
  // one trigger per menu, so Escape can hand focus back to the right one
  const triggers = useRef({});
  // set only while Escape moves focus back onto a trigger, whose onFocus would
  // otherwise re-open the panel we just closed
  const suppressOpen = useRef(false);

  const open = openMenu !== null;

  // the open panel is white all the way up, so the bar switches to the cream
  // page's colours (dark logo, ink links) instead of the light-on-photo ones
  const logo = dark || open ? IMG.logoDark : IMG.logo;
  const link = dark || open ? "text-ink hover:text-primary" : "text-mist hover:text-sage";

  const close = () => setOpenMenu(null);

  // Escape and outside clicks close the panel; the pointer/keyboard handlers on
  // the container itself keep it open while you travel from the trigger into it.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setOpenMenu(null);
      // only pull focus back to the trigger when it was inside the panel —
      // focusing it from elsewhere would re-open through onFocus
      const active = document.activeElement;
      if (active && shell.current?.contains(active)) {
        // focus() dispatches synchronously, so the flag is consumed by this
        // onFocus and cleared again before we return
        suppressOpen.current = true;
        triggers.current[openMenu]?.focus();
        suppressOpen.current = false;
      }
    };
    const onDown = (e) => {
      if (shell.current && !shell.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, openMenu]);

  const Panel = openMenu ? MENUS[openMenu] : null;

  return (
    <header {...rv} className="rv absolute inset-x-0 top-2 z-50 h-[76px] max-[809.98px]:h-[68px]">
      <div
        ref={shell}
        className={`container-x relative flex h-full items-center ${
          open ? "rounded-t-lg bg-white shadow-[0_30px_70px_-30px_rgba(6,12,8,0.55)]" : ""
        }`}
        onMouseLeave={close}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) close();
        }}
      >
        <a href="/" aria-label="API Touch" className="shrink-0">
          <img
            src={logo}
            alt="API Touch"
            className="block h-[42px] w-[84px] object-contain max-[809.98px]:h-[36px] max-[809.98px]:w-[72px]"
          />
        </a>
        <div className="ml-auto flex items-center gap-6 max-[809.98px]:hidden">
          <nav className="flex items-center gap-6">
            {NAV_LINKS.map((l) =>
              l.menu && MENUS[l.menu] ? (
                <button
                  key={l.label}
                  ref={(el) => {
                    triggers.current[l.menu] = el;
                  }}
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={openMenu === l.menu}
                  aria-controls={`nav-${l.menu}-menu`}
                  onMouseEnter={() => setOpenMenu(l.menu)}
                  onFocus={() => {
                    if (suppressOpen.current) return;
                    setOpenMenu(l.menu);
                  }}
                  onClick={() => setOpenMenu((o) => (o === l.menu ? null : l.menu))}
                  className={`t-link flex cursor-pointer items-center gap-[6px] border-0 bg-transparent p-0 transition-colors ${link}`}
                >
                  {l.label}
                  <ChevronDown
                    className={`transition-transform duration-200 ${openMenu === l.menu ? "rotate-180" : ""}`}
                  />
                </button>
              ) : (
                <a
                  key={l.label}
                  href={l.href}
                  onMouseEnter={close}
                  className={`t-link ${link}`}
                >
                  {l.label}
                </a>
              ),
            )}
          </nav>
          <a href="/plan-your-trip" onMouseEnter={close} className="btn btn-dark w-[140px] normal-case">
            Plan your trip
          </a>
        </div>

        {Panel ? <Panel onNavigate={close} /> : null}

        {/* mobile: two-bar menu trigger (measured 39x36, bars 18x1 / gap 6) */}
        <button
          type="button"
          aria-label="Open menu"
          className="ml-auto hidden h-[36px] w-[39px] flex-col items-center justify-center gap-[6px] bg-transparent p-0 max-[809.98px]:flex"
        >
          <span className="block h-px w-[18px] bg-ink" />
          <span className="block h-px w-[18px] bg-ink" />
        </button>
      </div>
    </header>
  );
}