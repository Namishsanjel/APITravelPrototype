import { useEffect } from "react";
import PageShell from "../components/PageShell.jsx";
import { Eyebrow } from "../components/ui.jsx";
import { Reveal } from "../anim.jsx";
import { PLAN_TRIP, DESTINATIONS_ALL } from "../data/newPages.js";
import { CONTACT, PAGES } from "../data/content.js";

function ChevronDown() {
  return (
    <svg className="f-chevron" width="11" height="7" viewBox="0 0 11 7" fill="none" aria-hidden="true">
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

function Field({ label, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-[10px]">
      <label className="f-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Select({ id, name, options }) {
  return (
    <div className="relative">
      <select id={id} name={name} className="f-control f-select">
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown />
    </div>
  );
}

export default function PlanTripPage() {
  const page = PAGES["/plan-your-trip"];
  const { badge, title, sub, info, form } = PLAN_TRIP;
  const destinations = ["Not sure yet", ...DESTINATIONS_ALL.map((d) => d.name)];

  useEffect(() => {
    document.title = page.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", page.description);
  }, [page]);

  return (
    <PageShell faq={false}>
      <section className="contact-sec">
        <div className="contact-card">
          <img
            src={CONTACT.image}
            alt={CONTACT.imageAlt}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="grad-contact absolute inset-0" />

          <div className="contact-grid relative">
            <div className="contact-left">
              <div className="contact-top">
                <Eyebrow color="var(--color-mist)">{badge}</Eyebrow>
                <h1 className="t-h1c mt-2">
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
                </h1>
                <Reveal
                  as="p"
                  effect="far"
                  delay={80 + title.length * 90}
                  className="t-body mt-4 text-mist"
                >
                  {sub}
                </Reveal>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {info.map((i) => (
                  <div key={i.label} className="flex flex-col gap-2">
                    <p className="t-eyebrow capitalize text-mist">{i.label}</p>
                    <p className="t-link capitalize text-sage">{i.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="contact-right">
              <form
                className="flex w-full max-w-[520px] flex-col rounded-lg bg-mist p-6"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="flex flex-col gap-4">
                  <Field label={form.name.label} htmlFor="trip-name">
                    <input
                      id="trip-name"
                      name="name"
                      type="text"
                      className="f-control f-input"
                      placeholder={form.name.placeholder}
                    />
                  </Field>

                  <Field label={form.email.label} htmlFor="trip-email">
                    <input
                      id="trip-email"
                      name="email"
                      type="email"
                      className="f-control f-input"
                      placeholder={form.email.placeholder}
                    />
                  </Field>

                  <Field label={form.destination.label} htmlFor="trip-destination">
                    <Select id="trip-destination" name="destination" options={destinations} />
                  </Field>

                  <Field label={form.date.label} htmlFor="trip-date">
                    <input id="trip-date" name="date" type="date" className="f-control f-input" />
                  </Field>

                  <Field label={form.group.label} htmlFor="trip-group">
                    <Select id="trip-group" name="group" options={form.group.options} />
                  </Field>

                  <Field label={form.preferences.label} htmlFor="trip-preferences">
                    <Select id="trip-preferences" name="preferences" options={form.preferences.options} />
                  </Field>

                  <Field label={form.budget.label} htmlFor="trip-budget">
                    <Select id="trip-budget" name="budget" options={form.budget.options} />
                  </Field>

                  <Field label={form.message.label} htmlFor="trip-message">
                    <textarea
                      id="trip-message"
                      name="message"
                      className="f-control f-textarea"
                      placeholder={form.message.placeholder}
                    />
                  </Field>
                </div>

                <button type="submit" className="btn btn-dark mt-5 h-[51px] w-full">
                  {form.submit}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
