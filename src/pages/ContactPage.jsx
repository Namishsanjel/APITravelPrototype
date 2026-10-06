import { useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Contact from "../components/Contact.jsx";
import Faq from "../components/Faq.jsx";
import Footer from "../components/Footer.jsx";
import { PAGES } from "../data/content.js";

export default function ContactPage() {
  const page = PAGES["/contact"];

  useEffect(() => {
    document.title = page.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", page.description);
  }, [page]);

  return (
    <>
      <Navbar variant="dark" />
      <main>
        <Contact />
        <Faq showCta={false} />
      </main>
      <Footer />
    </>
  );
}
