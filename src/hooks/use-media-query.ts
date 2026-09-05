"use client";

import { useEffect, useState } from "react";

/**
 * Subscribes to a CSS media query.
 *
 * Returns `false` on the server and for the first client render, so the markup
 * hydrates identically; the real value lands in the effect. Callers that switch
 * layout on the result should treat `false` as "the wide/default variant".
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);

    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  return matches;
}
