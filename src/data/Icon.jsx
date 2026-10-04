import icons from "./icons.json";

/**
 * Renders one of the SVG symbols lifted out of the original index.html.
 * The extracted paths have stroke-width 1.5 baked in (Framer's default);
 * pass `sw` to override it where the original used a different --pgex8v.
 */
export default function Icon({ id, size = 24, sw, className = "", style }) {
  let svg = icons[id];
  if (!svg) return null;
  if (sw) svg = svg.replace(/stroke-width="[\d.]+"/g, `stroke-width="${sw}"`);
  return (
    <span
      className={`icon-svg ${className}`}
      style={{ display: "block", width: size, height: size, flex: "none", ...style }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
