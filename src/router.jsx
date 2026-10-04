import { createContext, useContext, useEffect, useState } from "react";

/**
 * Minimal history-API router (no dependencies) so every link of the original
 * site keeps its real path (/, /contact, ...) while staying a single React app.
 */
const RouteContext = createContext("/");

function readPath() {
  return window.location.pathname.replace(/\/+$/, "") || "/";
}

export function RouterProvider({ children }) {
  const [path, setPath] = useState(readPath);

  useEffect(() => {
    const onPop = () => setPath(readPath());

    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!a) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download") || a.getAttribute("aria-disabled") === "true") return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//")) return;
      const next = href.split("#")[0].split("?")[0];
      if (next === readPath()) return;
      e.preventDefault();
      window.history.pushState({}, "", href);
      setPath(readPath());
    };

    window.addEventListener("popstate", onPop);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("click", onClick);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [path]);

  return <RouteContext.Provider value={path}>{children}</RouteContext.Provider>;
}

export function useRoute() {
  return useContext(RouteContext);
}
