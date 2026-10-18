import { useEffect, useState } from "react";

// LocalStorage-backed state; reads after hydration to avoid SSR mismatch.
export function usePref<T>(name: string, initial: T) {
  const [val, setVal] = useState<T>(initial);
  useEffect(() => {
    const raw = localStorage.getItem("csb:" + name);
    if (raw) try { setVal(JSON.parse(raw)); } catch { /* ignore */ }
    const on = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d.name === name) setVal(d.value);
    };
    window.addEventListener("csb-pref", on);
    return () => window.removeEventListener("csb-pref", on);
  }, [name]);
  const update = (v: T | ((p: T) => T)) => {
    setVal((prev) => {
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      localStorage.setItem("csb:" + name, JSON.stringify(next));
      queueMicrotask(() => window.dispatchEvent(new CustomEvent("csb-pref", { detail: { name, value: next } })));
      return next;
    });
  };
  return [val, update] as const;
}

export type HighlightColor = "gold" | "rose" | "sage" | "sky";
export const HIGHLIGHTS: HighlightColor[] = ["gold", "rose", "sage", "sky"];
