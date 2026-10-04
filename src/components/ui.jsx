import { Fragment } from "react";
import Icon from "../data/Icon.jsx";
import { Reveal } from "../anim.jsx";

/**
 * Title text split into individually revealed words (the hikes page already
 * ships its headline as one span per word, which is how the original hands
 * its titles to the animator). The spaces stay outside the spans so wrapping
 * still happens at word boundaries.
 */
export function Words({ text, delay = 80, step = 80 }) {
  // data ships some titles pre-split into words (hikes), others as strings
  const words = Array.isArray(text) ? text : String(text).split(" ");
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          {i > 0 ? " " : null}
          <Reveal as="span" effect="far" delay={delay + i * step} className="inline-block">
            {word}
          </Reveal>
        </Fragment>
      ))}
    </>
  );
}

/** Small chevron + label line that opens every section header. */
export function Eyebrow({ children, color = "var(--color-ink)", className = "" }) {
  return (
    <div className={`flex items-center gap-[2px] ${className}`} style={{ color }}>
      <Icon id="3166100823" size={12} />
      <span className="t-eyebrow">{children}</span>
    </div>
  );
}

/**
 * The two-column header used by most sections:
 * left  = badge + h2 (explicit line breaks, as in the original),
 * right = copy (+ optional button) bottom-aligned against the h2 baseline.
 */
export function SectionHead({ badge, title, children, leftW = 560, rightW = 706 }) {
  return (
    <div className="flex items-stretch justify-between">
      <div style={{ width: leftW }}>
        <Reveal effect="far">
          <Eyebrow>{badge}</Eyebrow>
        </Reveal>
        <h2 className="t-h2 mt-2">
          {title.map((line, i) => (
            <Reveal
              as="span"
              key={line}
              effect="far"
              delay={80 + i * 90}
              className="block"
            >
              {line}
            </Reveal>
          ))}
        </h2>
      </div>
      <Reveal
        delay={140}
        className="flex flex-col items-end justify-end gap-4 text-right"
        style={{ width: rightW }}
      >
        {children}
      </Reveal>
    </div>
  );
}

/** Right-aligned paragraph inside a SectionHead. */
export function HeadCopy({ children }) {
  return <p className="t-body w-full">{children}</p>;
}

/**
 * The header row every index page opens with (measured off the hikes /
 * journal / gallery / about pages): badge + h1 on the left, right-aligned
 * intro copy bottom-aligned against the headline.
 */
export function PageHeader({ badge, title, sub }) {
  return (
    <div className="flex items-end justify-between max-[809.98px]:flex-col max-[809.98px]:items-start max-[809.98px]:gap-4">
      <div className="flex w-[560px] flex-col gap-2 max-[809.98px]:w-full">
        {badge ? (
          <Reveal effect="far">
            <Eyebrow>{badge}</Eyebrow>
          </Reveal>
        ) : null}
        <h1 className="t-h1p">
          <Words text={title} />
        </h1>
      </div>
      {sub ? (
        <Reveal
          as="p"
          effect="far"
          delay={200}
          className="t-body w-[706px] text-right max-[809.98px]:w-full max-[809.98px]:text-left"
        >
          {sub}
        </Reveal>
      ) : null}
    </div>
  );
}

export function Container({ className = "", children }) {
  return <div className={`container-x ${className}`}>{children}</div>;
}

/**
 * Framer's banded progressive-blur stack: eight backdrop-filter layers whose
 * staggered mask-image gradients each own a horizontal band of the image
 * (blur ramps from ~0 at the top to `max` px at the bottom). Present in the
 * original at rest, so card photos render with a top-sharp/bottom-blurred
 * ramp there — copy it exactly.
 * `max` = largest blur (10 for CMS cards, 6 for included, 8 for guide).
 */
export function ImgBlur({ max = 10, className = "" }) {
  const maskStops = (i) => {
    const pos = [i * 12.5, (i + 1) * 12.5, (i + 2) * 12.5, (i + 3) * 12.5].map((p) => Math.min(p, 100));
    const kinds = ["rgba(0, 0, 0, 0)", "rgb(0, 0, 0)", "rgb(0, 0, 0)", "rgba(0, 0, 0, 0)"];
    const out = [];
    for (let k = 0; k < 4; k++) {
      if (out.length && out[out.length - 1].p === pos[k]) continue;
      out.push({ p: pos[k], c: kinds[k] });
    }
    return `linear-gradient(${out.map((s) => `${s.c} ${s.p}%`).join(', ')})`;
  };
  return (
    <div className={`absolute inset-0 ${className}`} aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="absolute inset-0 rounded"
          style={{
            zIndex: i + 1,
            maskImage: maskStops(i),
            WebkitMaskImage: maskStops(i),
            pointerEvents: "none",
            backdropFilter: `blur(${max / (1 << (7 - i))}px)`,
          }}
        />
      ))}
    </div>
  );
}
