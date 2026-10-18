import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Bookmark, Sun, Moon, Download, Check } from "lucide-react";
import { AppShell, useReaderTheme } from "@/components/AppShell";
import { AudioBar } from "@/components/AudioBar";
import { getBook, TRANSLATIONS, type Translation } from "@/data/books";
import { XREFS, type Ref } from "@/data/xrefs";
import { loadChapter, isCached, type Chapter } from "@/lib/bible";
import { usePref, HIGHLIGHTS, type HighlightColor } from "@/lib/prefs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Mark } from "./bookmarks";

export const Route = createFileRoute("/read/$bookId/$chapter")({
  loader: ({ params }) => {
    const book = getBook(params.bookId);
    const ch = Number(params.chapter);
    if (!book || !(ch >= 1 && ch <= book.chapters)) throw notFound();
    return { book, ch };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.book.name} ${loaderData.book.apiId ? loaderData.ch : ""}`.trim() : "Reader";
    return {
      meta: [
        { title: `${t} — Chikuni Study Bible` },
        { name: "description", content: `Read ${t} with cross-references, highlights and audio.` },
        { property: "og:title", content: `${t} — Chikuni Study Bible` },
        { property: "og:description", content: `Read ${t} in KJV, BSB, WEB or ASV.` },
      ],
    };
  },
  component: Reader,
});

const hlClass: Record<HighlightColor, string> = { gold: "bg-hl-gold", rose: "bg-hl-rose", sage: "bg-hl-sage", sky: "bg-hl-sky" };

function Reader() {
  const { book, ch } = Route.useLoaderData();
  const [tr, setTr] = usePref<Translation>("translation", "KJV");
  const [size, setSize] = usePref("fontSize", 19);
  const [hls, setHls] = usePref<Record<string, HighlightColor>>("highlights", {});
  const [marks, setMarks] = usePref<Mark[]>("bookmarks", []);
  const [, setLast] = usePref<{ book: string; chapter: number } | null>("last", null);
  const [dark, setDark] = useReaderTheme();
  const [data, setData] = useState<Chapter | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  const [reading, setReading] = useState<number | null>(null);
  const [refs, setRefs] = useState<{ from: string; list: Ref[] } | null>(null);
  const [dl, setDl] = useState<"idle" | "busy" | "done">("idle");

  useEffect(() => {
    setData(null); setErr(null); setSel(null);
    setLast({ book: book.id, chapter: ch });
    loadChapter(tr, book.id, ch).then(setData).catch((e) => setErr(e.message));
    if (book.apiId) isCached(tr, book.id, book.chapters).then((c) => setDl(c ? "done" : "idle"));
  }, [tr, book.id, ch]); // eslint-disable-line react-hooks/exhaustive-deps

  const downloadBook = async () => {
    setDl("busy");
    try { for (let i = 1; i <= book.chapters; i++) await loadChapter(tr, book.id, i); setDl("done"); }
    catch { setDl("idle"); }
  };

  const k = (v: number) => `${book.id}.${ch}.${v}`;
  const title = book.apiId ? `${book.name} ${ch}` : book.name;

  return (
    <AppShell>
      <div className="sticky top-0 z-20 flex items-center gap-2 border-b bg-background/95 px-3 py-2 backdrop-blur">
        <Link to="/library" className="min-w-0 flex-1 truncate font-display text-xl font-semibold">{title}</Link>
        {book.apiId && (
          <select aria-label="Translation" value={tr} onChange={(e) => setTr(e.target.value as Translation)} className="rounded-md border bg-card px-2 py-1 text-sm font-semibold">
            {TRANSLATIONS.map((t) => <option key={t}>{t}</option>)}
          </select>
        )}
        <button aria-label="Smaller text" onClick={() => setSize(Math.max(14, size - 1))} className="px-1 text-sm">A↓</button>
        <button aria-label="Larger text" onClick={() => setSize(Math.min(30, size + 1))} className="px-1 text-lg">A↑</button>
        <button aria-label="Reader mode" onClick={() => setDark(!dark)}>{dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>
      </div>

      <article className="px-5 py-6">
        {data?.partial && (
          <div className="mb-5 rounded-lg border border-gold bg-secondary p-3 text-sm">
            <p className="font-semibold">{data.heading}</p>
            <p className="text-muted-foreground">Selected passages · {data.source}</p>
          </div>
        )}
        {err && <p className="text-destructive">{err}</p>}
        {!data && !err && <p className="text-muted-foreground">Opening scripture…</p>}
        <div className="font-scripture leading-relaxed" style={{ fontSize: size }}>
          {data?.verses.map((v) => {
            const xr = XREFS[k(v.n)];
            const hl = hls[k(v.n)];
            return (
              <span key={v.n}>
                <span
                  onClick={() => setSel(sel === v.n ? null : v.n)}
                  className={`cursor-pointer rounded-sm ${hl ? hlClass[hl] : ""} ${sel === v.n ? "underline decoration-gold decoration-2 underline-offset-4" : ""} ${reading === v.n ? "bg-muted" : ""}`}
                >
                  <sup className="mr-1 font-sans text-[0.6em] font-bold text-verse-num">{v.n}</sup>
                  {v.text}
                </span>
                {xr && (
                  <button onClick={() => setRefs({ from: `${title}:${v.n}`, list: xr })} className="mx-1 rounded-full bg-gold px-1.5 align-middle font-sans text-[11px] font-bold text-accent-foreground">
                    ✣ {xr.length}
                  </button>
                )}{" "}
              </span>
            );
          })}
        </div>

        {book.apiId && data && (
          <div className="mt-8 flex items-center justify-between font-sans">
            {ch > 1 ? <Link to="/read/$bookId/$chapter" params={{ bookId: book.id, chapter: String(ch - 1) }} className="flex items-center gap-1 text-primary"><ChevronLeft className="h-4 w-4" />Prev</Link> : <span />}
            <button onClick={downloadBook} disabled={dl !== "idle"} className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs">
              {dl === "done" ? <><Check className="h-3.5 w-3.5" />Saved offline</> : dl === "busy" ? "Saving…" : <><Download className="h-3.5 w-3.5" />Save {book.name} offline</>}
            </button>
            {ch < book.chapters ? <Link to="/read/$bookId/$chapter" params={{ bookId: book.id, chapter: String(ch + 1) }} className="flex items-center gap-1 text-primary">Next<ChevronRight className="h-4 w-4" /></Link> : <span />}
          </div>
        )}
      </article>

      {sel !== null && data && (
        <div className="fixed inset-x-3 bottom-[200px] z-40 mx-auto flex max-w-sm items-center justify-around rounded-full border bg-card p-2 shadow-float">
          {HIGHLIGHTS.map((c) => (
            <button key={c} aria-label={`Highlight ${c}`} onClick={() => { setHls({ ...hls, [k(sel)]: c }); setSel(null); }} className={`h-8 w-8 rounded-full border ${hlClass[c]}`} />
          ))}
          <button onClick={() => { const n = { ...hls }; delete n[k(sel)]; setHls(n); setSel(null); }} className="text-xs text-muted-foreground">Clear</button>
          <button aria-label="Bookmark" onClick={() => {
            const text = data.verses.find((v) => v.n === sel)?.text ?? "";
            if (!marks.some((m) => m.book === book.id && m.chapter === ch && m.verse === sel)) setMarks([{ book: book.id, chapter: ch, verse: sel, text }, ...marks]);
            setSel(null);
          }}><Bookmark className="h-5 w-5 text-primary" /></button>
        </div>
      )}

      <Sheet open={!!refs} onOpenChange={(o) => !o && setRefs(null)}>
        <SheetContent side="right" className="w-[88%] overflow-y-auto">
          <SheetHeader><SheetTitle className="font-display text-2xl">Cross-references · {refs?.from}</SheetTitle></SheetHeader>
          <div className="space-y-4 px-4 pb-8">
            {refs?.list.map((r) => <RefCard key={r.label} r={r} tr={tr} onGo={() => setRefs(null)} />)}
          </div>
        </SheetContent>
      </Sheet>

      {data && <AudioBar verses={data.verses} title={title} onVerse={setReading} />}
    </AppShell>
  );
}

function RefCard({ r, tr, onGo }: { r: Ref; tr: Translation; onGo: () => void }) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    loadChapter(tr, r.book, r.chapter)
      .then((c) => setText(c.verses.find((v) => v.n === r.verse)?.text ?? c.verses[0]?.text ?? ""))
      .catch(() => setText("Available once you're online."));
  }, [r, tr]);
  return (
    <div className="rounded-xl border bg-card p-3">
      <p className="text-sm font-bold text-primary">{r.label}</p>
      <p className="mt-1 font-scripture">{text ?? "…"}</p>
      <Link to="/read/$bookId/$chapter" params={{ bookId: r.book, chapter: String(r.chapter) }} onClick={onGo} className="mt-2 inline-block text-xs font-semibold underline">Open passage</Link>
    </div>
  );
}
