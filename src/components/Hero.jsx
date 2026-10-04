import { HERO } from "../data/content.js";
import { Eyebrow } from "./ui.jsx";
import { Reveal } from "../anim.jsx";

export default function Hero() {
  return (
    <section data-hero className="relative h-screen min-h-[700px] overflow-hidden bg-cream">
      {/* full-bleed photo inside an 8px cream frame. The original opens with
          the frame's photo easing back from 1.05 to 1 (1.5s, delay 0.1s) —
          it never fades, so this section opts out of the generic reveal. */}
      <div className="absolute inset-2 overflow-hidden rounded-lg">
        <img
          src={HERO.image}
          alt={HERO.imageAlt}
          className="hero-zoom h-full w-full object-cover"
        />
        <div className="grad-hero absolute inset-0" />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 pb-[60px]">
        <div className="container-x flex items-end justify-between">
          <div>
            {/* copy arrives late — the original's load delays run 0.8 → 1.2s */}
            <Reveal effect="up" delay={700}>
              <Eyebrow color="var(--color-secondary)">{HERO.eyebrow}</Eyebrow>
            </Reveal>
            <Reveal effect="up" delay={800}>
              <h1 className="t-h1 mt-2 w-[700px]">{HERO.title}</h1>
            </Reveal>
            {/* flex wrapper keeps the inline-flex button off the line strut,
                so the hero keeps its measured spacing */}
            <Reveal effect="up" delay={1000} className="flex">
              <a href={HERO.ctaHref} className="btn btn-cream mt-2 w-[172px]">
                {HERO.cta}
              </a>
            </Reveal>
          </div>
          <Reveal
            as="p"
            effect="up"
            delay={1200}
            className="w-[420px] text-right font-inter text-[20px] leading-[28px] text-sage"
          >
            {HERO.sub}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
