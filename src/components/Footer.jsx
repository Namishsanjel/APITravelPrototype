import { FOOTER, IMG } from "../data/content.js";

export default function Footer() {
  const { title, body, cta, ctaHref, background, backgroundAlt, subline, copyright, columns } = FOOTER;

  return (
    <footer className="relative overflow-hidden bg-cream">
      <img src={background} alt={backgroundAlt} className="footer-bg-mask absolute inset-0 h-full w-full object-cover" />
      <div className="footer-bg-mask grad-footer absolute inset-0" />

      <div className="container-x relative">
        {/* closing call to action */}
        <div className="pt-[300px] text-center">
          <h2 className="t-h2 text-mist">
            {title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="mx-auto mt-4 w-[420px] font-body text-[16px] leading-[22.4px] text-mist [text-wrap:balance] [will-change:transform] max-[809.98px]:w-full">
            {body}
          </p>
          <a href={ctaHref} className="btn btn-cream mt-4 w-[129px]">
            {cta}
          </a>
        </div>

        {/* company info + sitemaps */}
        <div className="mt-[120px] flex justify-between max-[809.98px]:flex-col max-[809.98px]:gap-12">
          <div className="w-[520px] max-[809.98px]:w-full">
            <img
              src={IMG.logo}
              alt="API Touch"
              className="block h-[46px] w-[92px] object-contain max-[809.98px]:h-[40px] max-[809.98px]:w-[80px]"
            />
            <p className="t-body mt-4 text-sage [will-change:transform]">{subline}</p>
            <p className="mt-4 font-body text-[16px] leading-[16px] text-mist">{copyright}</p>
          </div>

          {/* 4 columns x 160px + 3 x 16px gap */}
          <div className="flex w-[688px] gap-4 max-[809.98px]:w-full max-[809.98px]:flex-wrap max-[809.98px]:gap-12">
            {columns.map((col) => (
              <div
                key={col.label}
                className="w-[160px] max-[809.98px]:w-auto max-[809.98px]:[flex:1_1_155px]"
              >
                <p className="t-eyebrow text-mist">{col.label}</p>
                <div className="mt-4 flex flex-col gap-4">
                  {col.links.map((l) =>
                    /* no href yet — kept in the tab order and announced as a
                       disabled link, but it navigates nowhere */
                    l.href ? (
                      <a key={l.label} href={l.href} className="t-link text-mist">
                        {l.label}
                      </a>
                    ) : (
                      <a
                        key={l.label}
                        role="link"
                        aria-disabled="true"
                        tabIndex={0}
                        title={`${l.label} — coming soon`}
                        className="t-link text-mist/60"
                      >
                        {l.label}
                      </a>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* oversized brand mark */}
        <div className="logomark-mask mt-[60px]">
          <img src={IMG.logo} alt="" className="mx-auto block h-[150px] w-[300px] object-contain" />
          <div className="h-[133.75px] max-[809.98px]:h-0" />
        </div>
      </div>
    </footer>
  );
}
