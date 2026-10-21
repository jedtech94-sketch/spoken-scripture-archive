import { act, renderHook, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useReaderHeader } from "@/hooks/use-reader-header";

function scrollTo(y: number) {
  act(() => {
    Object.defineProperty(window, "scrollY", { value: y, configurable: true });
    window.dispatchEvent(new Event("scroll"));
  });
}

afterEach(() => { cleanup(); scrollTo(0); });

describe("Reader header", () => {
  it("hides scrolling down and reveals scrolling up", () => {
    scrollTo(0);
    const { result } = renderHook(() => useReaderHeader("genesis.1"));
    scrollTo(150);
    expect(result.current).toBe(true);
    scrollTo(125);
    expect(result.current).toBe(false);
  });

  it("stays visible near the top", () => {
    const { result } = renderHook(() => useReaderHeader("genesis.1"));
    scrollTo(60);
    expect(result.current).toBe(false);
  });

  it("reveals when the chapter changes", () => {
    const { result, rerender } = renderHook(({ chapter }) => useReaderHeader(chapter), { initialProps: { chapter: "genesis.1" } });
    scrollTo(150);
    expect(result.current).toBe(true);
    rerender({ chapter: "genesis.2" });
    expect(result.current).toBe(false);
  });
});