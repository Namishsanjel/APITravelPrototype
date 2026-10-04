import { CONTACT } from "../data/content.js";
import { Eyebrow } from "./ui.jsx";
import { Reveal } from "../anim.jsx";

function ChevronDown() {
  return (
    <svg
      className="f-chevron"
      width="11"
      height="7"
      viewBox="0 0 11 7"
      fill="none"
      aria-hidden="true"
    >
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

export default function Contact() {
  const { badge, title, image, imageAlt, info, form } = CONTACT;

  return (
    <section className="contact-sec">
      {/* photo card with the copy on the left and the booking form on the right */}
      <div className="contact-card">
        <img src={image} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover" />
        <div className="grad-contact absolute inset-0" />

        <div className="contact-grid relative">
          <div className="contact-left">
            <div className="contact-top">
              <Eyebrow color="var(--color-secondary)">{badge}</Eyebrow>
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
                <Field label={form.name.label} htmlFor="contact-name">
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    className="f-control f-input"
                    placeholder={form.name.placeholder}
                  />
                </Field>

                <Field label={form.email.label} htmlFor="contact-email">
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    className="f-control f-input"
                    placeholder={form.email.placeholder}
                  />
                </Field>

                <Field label={form.hike.label} htmlFor="contact-hike">
                  <div className="relative">
                    <select id="contact-hike" name="hike" className="f-control f-select">
                      {form.hike.options.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                    <ChevronDown />
                  </div>
                </Field>

                <Field label={form.date.label} htmlFor="contact-date">
                  <input id="contact-date" name="date" type="date" className="f-control f-input" />
                </Field>

                <Field label={form.message.label} htmlFor="contact-message">
                  <textarea
                    id="contact-message"
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
  );
}
