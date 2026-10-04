import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Faq from "../components/Faq.jsx";
import Footer from "../components/Footer.jsx";
import { Eyebrow, ImgBlur, Words } from "../components/ui.jsx";
import Icon from "../data/Icon.jsx";
import { useReveal, stagger } from "../motion.js";
import { HIKES_PAGE, HIKES_ALL } from "../data/hikes.js";
import { DESTINATIONS_ALL, EXPERIENCE_BY_TOUR } from "../data/newPages.js";
import { TOUR_DETAILS } from "../data/tourDetails.js";

function HikeCard({ hike, className = "", index = null }) {
  const rv = useReveal({ delay: index == null ? 0 : stagger(index) });

  return (
    <div
      {...rv}
      className={`rv relative rounded-lg bg-mist p-1 [will-change:transform] ${className}`}
    >
      <div className="relative h-full w-full overflow-hidden rounded">
        <img src={hike.image} alt={hike.alt} className="absolute inset-0 h-full w-full object-cover" />
        <div className="grad-card absolute inset-0" />
        <ImgBlur />
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-4">
          <div className="flex gap-2">
            {hike.chips.map((c) => (
              <span key={c} className="chip">
                {c}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="t-h3l text-mist">{hike.title}</h3>
            <a href={hike.href} className="btn btn-dark btn-roll w-[113px]">
              <span className="roll">
                <span>learn more</span>
                <span aria-hidden="true">learn more</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/** One labelled row of filter pills, in the listing page's own pill style. */
function FilterRow({ label, options, value, onChange, surface = "bg-mist" }) {
  return (
    <div className="flex items-center gap-3 max-[809.98px]:flex-col max-[809.98px]:items-start">
      <p className="t-eyebrow w-[100px] shrink-0 text-smoke max-[809.98px]:w-auto">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = o === value;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              aria-pressed={on}
              className={`group rounded-lg px-4 py-2 transition-colors duration-200 ${
                on ? "bg-primary" : `${surface} hover:bg-secondary`
              }`}
            >
              <p className={`t-link ${on ? "text-mist" : "text-smoke group-hover:text-primary"}`}>{o}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The whole filter set lives behind one "filters" button: the panel opens
 * underneath it with every pill group, and closes on outside click or Escape.
 */
function FilterMenu({ groups, onReset }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = groups.filter((g) => g.value !== "All").length;

  return (
    <div className="relative z-30" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-3 rounded-lg bg-mist px-4 py-3 transition-colors duration-200 hover:bg-secondary"
      >
        <span className="t-link text-ink">filters</span>
        {active > 0 ? (
          <span className="t-eyebrow flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-mist">
            {active}
          </span>
        ) : null}
        <span className={`block transition-transform duration-300 ${open ? "rotate-90" : ""}`}>
          <Icon id="3166100823" size={10} />
        </span>
      </button>

      {open ? (
        <div className="menu-in absolute left-0 top-[calc(100%+8px)] flex max-h-[60vh] w-[560px] max-w-[calc(100vw-32px)] flex-col gap-3 overflow-y-auto rounded-lg bg-mist p-4 shadow-[0_16px_40px_rgba(40,40,40,0.14)]">
          {groups.map((g) => (
            <FilterRow
              key={g.label}
              label={g.label}
              options={g.options}
              value={g.value}
              onChange={g.set}
              surface="bg-cream"
            />
          ))}
          <div className="flex items-center justify-end border-t border-sage pt-3">
            <button
              type="button"
              onClick={() => {
                onReset();
                setOpen(false);
              }}
              className="t-link text-smoke transition-colors duration-200 hover:text-primary"
            >
              reset filters
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * The listing mosaic: every group of five cards reads as one block — a large
 * card spanning two rows on the left, four small cards in a 2x2 on the right
 * (the large card is twice the width of a small one). Phones stack the block
 * into single-column cards of one uniform height.
 */
const CARD_LARGE =
  "col-span-2 row-span-2 h-[600px] max-[809.98px]:col-span-1 max-[809.98px]:row-span-1 max-[809.98px]:h-[420px]";
const CARD_SMALL = "h-[288px] max-[809.98px]:h-[420px]";

const destinationOf = (slug) => DESTINATIONS_ALL.find((d) => d.tours.includes(slug))?.name ?? "Other";

function priceOf(slug) {
  const raw = TOUR_DETAILS[slug]?.price ?? "";
  const m = raw.match(/\$([\d.]+)K?/);
  if (!m) return 0;
  const n = Number.parseFloat(m[1]);
  return raw.includes("K") ? n * 1000 : n;
}

const budgetOf = (slug) => {
  const n = priceOf(slug);
  if (n < 700) return "Under $700";
  if (n < 1000) return "$700 – $1,000";
  return "$1,000+";
};

const typeOf = (slug) => EXPERIENCE_BY_TOUR[slug] ?? "adventure";
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const BUDGETS = ["Under $700", "$700 – $1,000", "$1,000+"];

export default function HikesPage() {
  const [difficulty, setDifficulty] = useState("All");
  const [destination, setDestination] = useState("All");
  const [duration, setDuration] = useState("All");
  const [budget, setBudget] = useState("All");
  const [travelType, setTravelType] = useState("All");

  useEffect(() => {
    document.title = HIKES_PAGE.documentTitle;
  }, []);

  const options = useMemo(() => {
    const uniq = (list) => [...new Set(list)];
    return {
      destinations: ["All", ...uniq(HIKES_ALL.map((h) => destinationOf(h.slug)))],
      durations: ["All", ...uniq(HIKES_ALL.map((h) => h.chips[1]))],
      budgets: ["All", ...BUDGETS],
      types: ["All", ...uniq(HIKES_ALL.map((h) => cap(typeOf(h.slug))))],
    };
  }, []);

  const groups = [
    { label: "Difficulty", options: HIKES_PAGE.filters, value: difficulty, set: setDifficulty },
    { label: "Destination", options: options.destinations, value: destination, set: setDestination },
    { label: "Duration", options: options.durations, value: duration, set: setDuration },
    { label: "Budget", options: options.budgets, value: budget, set: setBudget },
    { label: "Travel type", options: options.types, value: travelType, set: setTravelType },
  ];

  const list = HIKES_ALL.filter((h) => {
    if (difficulty !== "All" && h.chips[0] !== difficulty) return false;
    if (destination !== "All" && destinationOf(h.slug) !== destination) return false;
    if (duration !== "All" && h.chips[1] !== duration) return false;
    if (budget !== "All" && budgetOf(h.slug) !== budget) return false;
    if (travelType !== "All" && typeOf(h.slug) !== travelType.toLowerCase()) return false;
    return true;
  });

  const reset = () => {
    setDifficulty("All");
    setDestination("All");
    setDuration("All");
    setBudget("All");
    setTravelType("All");
  };

  return (
    <>
      <Navbar variant="dark" />
      <main>
        <section className="container-x flex flex-col gap-6 pt-[120px]">
          {/* header row: badge + h1 (left), right-aligned intro copy */}
          <div className="flex items-end justify-between">
            <div className="flex w-[560px] flex-col gap-2">
              <Eyebrow>{HIKES_PAGE.badge}</Eyebrow>
              <h1 className="t-h1p">
                <Words text={HIKES_PAGE.title} />
              </h1>
            </div>
            <p className="t-body w-[706px] text-right">{HIKES_PAGE.sub}</p>
          </div>

          {/* filters (collapsed into one dropdown) + gallery-style grid */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
              <FilterMenu groups={groups} onReset={reset} />
              <p className="t-eyebrow text-smoke">
                {list.length} of {HIKES_ALL.length} tours
              </p>
            </div>

            {list.length ? (
              <div className="grid auto-rows-[288px] grid-cols-4 gap-6 max-[1099.98px]:grid-cols-2 max-[809.98px]:grid-cols-1 max-[809.98px]:auto-rows-[420px]">
                {list.map((h, i) => (
                  <HikeCard
                    key={h.slug}
                    hike={h}
                    index={i}
                    className={i % 5 === 0 ? CARD_LARGE : CARD_SMALL}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3 rounded-lg bg-mist p-6">
                <p className="t-h4 text-ink">No tours match those filters</p>
                <p className="t-body">Try a wider budget or destination — or reset the filters to see all ten.</p>
                <button type="button" onClick={reset} className="t-link self-start text-smoke">
                  reset filters
                </button>
              </div>
            )}
          </div>
        </section>

        <Faq />
      </main>
      <Footer />
    </>
  );
}
