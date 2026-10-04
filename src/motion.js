/**
 * Motion hooks ported from the original Framer site: elements start hidden
 * and are revealed once when they scroll into view (Framer's "appear"
 * effects). Measured off the original: containers fade in over ~1.5s with
 * **no** travel, while text blocks rise ~10px as they fade — so `fade` is
 * the default shape and the slide effects are deliberately tiny.
 *
 * Spread `useReveal()` onto an element's own attributes when a wrapper would
 * break the layout (grid spans, flex children), or use `<Reveal>` in
 * anim.jsx for plain wrappers. Both cancel themselves under
 * `prefers-reduced-motion: reduce` via the CSS in index.css.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const REDUCED =
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

export function prefersReducedMotion() {
  return REDUCED ? REDUCED.matches : false;
}

/** Named entrance shapes -> the transform an element animates *from*. */
export const EFFECTS = {
  fade: "none",
  up: "translate3d(0, 10px, 0)",
  far: "translate3d(0, 12px, 0)",
  left: "translate3d(-10px, 0, 0)",
  right: "translate3d(10px, 0, 0)",
  scale: "scale(1.03)",
};

/** Reveals take ~1.5s on the original (measured: 1550ms for a container). */
export const DUR = 1500;

/** Step (ms) between sibling cards/items in a staggered group. */
export const STAGGER = 90;

/** `delay` for item `i` of a staggered group. */
export const stagger = (i, step = STAGGER) => i * step;

/**
 * Two frames of rAF. IntersectionObserver can deliver its first notification
 * before the browser has painted the hidden state, in which case the element
 * would jump straight to its end style and the transition would never run.
 * Waiting two frames guarantees one painted frame at opacity 0 first.
 */
function afterPaint(fn) {
  requestAnimationFrame(() => requestAnimationFrame(fn));
}

/**
 * Fires once when the element enters the viewport. The rootMargin *expands*
 * the viewport downwards: elements start offset below their resting place
 * (up to 72px for the "far" effect), so the trigger line has to sit below the
 * fold or bottom-anchored content — like the hero CTA — would never fire.
 */
export function useInView({ rootMargin = "0px 0px 12% 0px", once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (once) io.disconnect();
            afterPaint(() => setInView(true));
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, once]);

  return [ref, inView];
}

/**
 * Props to spread on an element that should reveal itself:
 *   const rv = useReveal({ delay: 90 });
 *   <div {...rv} className="rv …"> … </div>
 * The `rv` class carries the transition (see index.css); `data-in` flips it on.
 */
export function useReveal({ effect = "fade", delay = 0, dur = DUR, y, once = true } = {}) {
  const [ref, inView] = useInView({ once });
  const from = y != null ? `translate3d(0, ${y}px, 0)` : (EFFECTS[effect] ?? EFFECTS.fade);

  return {
    ref,
    "data-rv": "",
    "data-in": inView ? "true" : "false",
    style: { "--rv-from": from, "--rv-dur": `${dur}ms`, "--rv-delay": `${delay}ms` },
  };
}

/**
 * Page-level reveal, wired once in App.jsx (re-armed on every route change).
 *
 * Measured on the original: sections themselves are never hidden (they sit at
 * opacity 1 the whole time) — it's the blocks *inside* them that fade in as
 * they cross the fold. So this marks every direct child of every top-level
 * block (and of the footer) rather than the sections, which keeps a page's
 * layout/chrome visible while its content arrives.
 *
 * Sections carrying `data-hero` opt out; the hero animates itself in
 * (image zoom + staggered copy) the way the original's load sequence does.
 */
export function useSectionReveal(key) {
  useLayoutEffect(() => {
    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    const roots = [...(main ? main.children : []), ...(footer ? [footer] : [])].filter(
      (el) => !el.hasAttribute("data-hero")
    );

    const targets = [];
    for (const root of roots) {
      if (root.children.length) targets.push(...root.children);
      else targets.push(root);
    }
    if (!targets.length) return undefined;

    for (const el of targets) {
      el.setAttribute("data-rv", "");
      el.setAttribute("data-in", "false");
    }

    if (typeof IntersectionObserver === "undefined") {
      for (const el of targets) el.setAttribute("data-in", "true");
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.unobserve(entry.target);
          afterPaint(() => entry.target.setAttribute("data-in", "true"));
        }
      },
      { rootMargin: "0px 0px 12% 0px" }
    );
    for (const el of targets) io.observe(el);

    return () => io.disconnect();
  }, [key]);
}
