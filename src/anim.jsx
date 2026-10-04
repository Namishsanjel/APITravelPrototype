import { DUR, useReveal } from "./motion.js";

/**
 * Reveal-on-enter wrapper for anything that isn't already an element:
 *   <Reveal delay={90}><p>…</p></Reveal>
 *
 * For elements that must keep their own box (grid spans, flex children), spread
 * `useReveal()` from motion.js onto them instead of adding a wrapper.
 *
 * @param effect  one of EFFECTS ("fade" by default — containers don't travel)
 * @param delay   ms before the motion starts (staggering)
 * @param dur     ms of motion (1500 by default, as on the original)
 * @param y       shorthand for a custom vertical distance
 */
export function Reveal({
  as: Tag = "div",
  effect = "fade",
  delay = 0,
  dur = DUR,
  y,
  once = true,
  className = "",
  style,
  children,
  ...rest
}) {
  const rv = useReveal({ effect, delay, dur, y, once });

  return (
    <Tag
      {...rv}
      className={`rv ${className}`}
      style={{ ...rv.style, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
