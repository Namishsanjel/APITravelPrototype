import { useState } from "react";
import { FAQ_SECTION, FAQS } from "../data/content.js";
import { Eyebrow } from "./ui.jsx";

function PlusIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <path d="M9 17h16M17 9v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.34 6.34 17.66 17.66M17.66 6.34 6.34 17.66"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** The accordion column alone — reused by the FAQ page. */
export function FaqList({ className = "w-[798px] max-[809.98px]:w-full" }) {
  const [open, setOpen] = useState(0);

  return (
    <div className={`flex flex-col gap-4 [will-change:transform] ${className}`}>
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={f.q}
            className="relative min-h-[61px] rounded-lg bg-mist p-4 [will-change:transform]"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="block w-full pr-10 text-left"
              aria-expanded={isOpen}
            >
              <h5 className="t-h5 w-4/5">{f.q}</h5>
            </button>

            {/* answer collapses to zero height instead of unmounting, so it
                can slide open/closed rather than pop */}
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className={`t-body mt-2 transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0"}`}>
                  {f.a}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-label={isOpen ? "Close" : "Open"}
              className="absolute right-[11px] top-[11px] text-ink"
            >
              {/* plus and close share one centre: each cross-fades in place */}
              <span className="relative block h-[34px] w-[34px]">
                <span
                  className={`absolute left-0 top-0 transition-opacity duration-200 ${
                    isOpen ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <PlusIcon />
                </span>
                <span
                  className={`absolute left-[5px] top-[5px] transition-opacity duration-200 ${
                    isOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <CloseIcon />
                </span>
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function Faq({ showCta = true }) {
  const { badge, title, body, cta, ctaHref } = FAQ_SECTION;

  return (
    <section id="faq" className="section-py faq-sec">
      <div className="container-x flex justify-between max-[809.98px]:flex-col max-[809.98px]:gap-8">
        {/* left column */}
        <div className="w-[420px] max-[809.98px]:w-full">
          <Eyebrow>{badge}</Eyebrow>
          <h2 className="t-h2 mt-2">
            {title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="t-body mt-4">{body}</p>
          {/* the contact page turns this off — the CTA links back to /contact,
              so on that page it would only reload the page you're already on */}
          {showCta ? (
            <a href={ctaHref} className="btn btn-dark mt-4 w-[122px]">
              {cta}
            </a>
          ) : null}
          <a href="/faq" className="t-link mt-3 block text-ink underline underline-offset-4">
            Read all FAQs
          </a>
        </div>

        {/* accordion */}
        <FaqList />
      </div>
    </section>
  );
}
