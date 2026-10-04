import { NAV_LINKS, IMG } from "../data/content.js";
import { useReveal } from "../motion.js";

/**
 * variant "light" (default): light links + white logo — over the hero image (home).
 * variant "dark": ink links + dark logo — on the cream page background (inner pages).
 */
export default function Navbar({ variant = "light" }) {
  const dark = variant === "dark";
  const logo = dark ? IMG.logoDark : IMG.logo;
  const rv = useReveal({ effect: "fade" });

  return (
    <header {...rv} className="rv absolute inset-x-0 top-2 z-50 h-[76px] max-[809.98px]:h-[68px]">
      <div className="container-x flex h-full items-center">
        <a href="/" aria-label="API Touch" className="shrink-0">
          <img
            src={logo}
            alt="API Touch"
            className="block h-[42px] w-[84px] object-contain max-[809.98px]:h-[36px] max-[809.98px]:w-[72px]"
          />
        </a>
        <div className="ml-auto flex items-center gap-6 max-[809.98px]:hidden">
          <nav className="flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={`t-link ${dark ? "text-ink" : "text-mist"}`}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <a href="/contact" className="btn btn-dark w-[140px]">
            Book Your Tour
          </a>
        </div>

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
