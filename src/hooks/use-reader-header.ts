import { useEffect, useState } from "react";

/** Reveal on upward scrolling; accumulate small movements to avoid flicker. */
export function useReaderHeader(resetKey: string) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(false);
    let anchor = window.scrollY;
    const onScroll = () => {
      const y = Math.max(0, window.scrollY);
      if (y <= 80) {
        setHidden(false);
        anchor = y;
        return;
      }
      if (Math.abs(y - anchor) < 12) return;
      const headerFocused = document.activeElement?.closest("[data-reader-header]");
      setHidden(y > anchor && !headerFocused);
      anchor = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [resetKey]);

  return hidden;
}