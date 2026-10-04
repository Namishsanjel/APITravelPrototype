import Navbar from "./Navbar.jsx";
import Faq from "./Faq.jsx";
import Footer from "./Footer.jsx";

/**
 * Shell shared by the index pages: dark navbar over the cream background,
 * the page body, the FAQ block the original puts on every listing page,
 * and the footer.
 */
export default function PageShell({ children, faq = true }) {
  return (
    <>
      <Navbar variant="dark" />
      <main>
        {children}
        {faq ? <Faq /> : null}
      </main>
      <Footer />
    </>
  );
}
