import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Bookmark, Sun, Moon, Download, Check, ArrowLeft, BookOpen, Minus, Plus, ArrowUpRight } from "lucide-react";
import { AppShell, useReaderTheme } from "@/components/AppShell";
import { AudioBar } from "@/components/AudioBar";
import { getBook, TRANSLATIONS, type Translation } from "@/data/books";
import { BUNDLED_TEXTS } from "@/data/bundled-texts";
import { XREFS, type Ref } from "@/data/xrefs";
import { loadChapter, isCached, type Chapter } from "@/lib/bible";
import { usePref, HIGHLIGHTS, type HighlightColor } from "@/lib/prefs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useReaderHeader } from "@/hooks/use-reader-header";
import type { Mark } from "./bookmarks";

export const Route = createFileRoute("/read/$bookId/$chapter")({
  loader: ({ params }) => {
    const book = getBook(params.bookId);
    const ch = Number(params.chapter);
    if (!book || !(ch >= 1 && ch <= book.chapters)) throw notFound();
    return { book, ch };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.book.name} ${loaderData.book.apiId || BUNDLED_TEXTS[loaderData.book.id] ? loaderData.ch : ""}`.trim() : "Reader";
    return {
      meta: [
        { title: `${t} — Chikuni Study Bible` },
        { name: "description", content: `Read ${t} with cross-references, highlights and audio.` },
        { property: "og:title", content: `${t} — Chikuni Study Bible` },
        { property: "og:description", content: `Read ${t} in KJV, BSB, WEB or ASV.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
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
  const multi = !!book.apiId || !!BUNDLED_TEXTS[book.id];
  const title = multi ? `${book.name} ${ch}` : book.name;
  const headerHidden = useReaderHeader(`${book.id}.${ch}`);

  return (
    <AppShell className="reader-shell">
      <header data-reader-header data-hidden={headerHidden} className={`reader-header reader-glass sticky top-0 z-20 transition-transform duration-300 ease-out motion-reduce:transition-none ${headerHidden ? "-translate-y-full" : "translate-y-0"}`} onFocusCapture={(e) => e.currentTarget.classList.remove("-translate-y-full")}>
        <div className="flex min-h-16 items-center gap-3 px-4 sm:px-7">
          <Button asChild variant="ghost" size="icon" className="shrink-0 text-reader-verse" title="Back to books">
            <Link to="/library" aria-label="Back to books"><ArrowLeft /></Link>
          </Button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase text-reader-verse">Chikuni Study Bible</p>
            <p className="truncate font-display text-2xl font-semibold">{title}</p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Reader mode" title={dark ? "Light paper" : "Dark paper"} onClick={() => setDark(!dark)} className="shrink-0 text-reader-verse">{dark ? <Sun /> : <Moon />}</Button>
        </div>
        <div className="flex min-h-12 items-center justify-between gap-2 border-t border-reader-rule/60 px-5 sm:px-9">
          {book.apiId ? (
            <div className="flex items-center gap-2 text-reader-verse">
              <BookOpen className="h-4 w-4" />
              <select aria-label="Translation" value={tr} onChange={(e) => setTr(e.target.value as Translation)} className="h-9 rounded-md border border-reader-gold/40 bg-transparent px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reader-gold">
                {TRANSLATIONS.map((t) => <option className="bg-reader-paper text-reader-ink" key={t}>{t}</option>)}
              </select>
            </div>
          ) : <span className="text-xs text-reader-verse">{data?.partial ? "Selected passages" : "Source edition"}</span>}
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Smaller text" title="Smaller text" disabled={size <= 14} onClick={() => setSize(Math.max(14, size - 1))}><Minus /></Button>
            <span aria-hidden="true" className="font-reader text-lg">Aa</span>
            <Button variant="ghost" size="icon" aria-label="Larger text" title="Larger text" disabled={size >= 30} onClick={() => setSize(Math.min(30, size + 1))}><Plus /></Button>
          </div>
        </div>
      </header>

      <article className="px-7 pb-10 pt-9 sm:px-12 sm:pt-12">
        <div className="mb-8 text-center">
          <BookOpen className="mx-auto mb-3 h-5 w-5 text-reader-gold" strokeWidth={1.25} />
          <h1 className="font-display text-4xl font-semibold leading-tight">{title}</h1>
          <div aria-hidden="true" className="mx-auto mt-5 h-px w-12 bg-reader-gold/60" />
        </div>
        {data?.source && (
          <div className="mb-7 border-l-2 border-reader-gold py-1 pl-4 text-sm">
            <p className="font-semibold">{data.heading}</p>
            <p className="text-muted-foreground">{data.partial ? "Selected passages" : "Full text"} · {data.source}</p>
          </div>
        )}
        {err && <p className="text-destructive">{err}</p>}
        {!data && !err && <p className="text-muted-foreground">Opening scripture…</p>}
        <div className="reader-prose font-reader" style={{ fontSize: size + 2 }}>
          {data?.verses.map((v) => {
            const xr = XREFS[k(v.n)];
            const hl = hls[k(v.n)];
            return (
              <span key={v.n}>
                <span
                  onClick={() => setSel(sel === v.n ? null : v.n)}
                  className={`cursor-pointer rounded-sm ${hl ? hlClass[hl] : ""} ${sel === v.n ? "underline decoration-gold decoration-2 underline-offset-4" : ""} ${reading === v.n ? "bg-muted" : ""}`}
                >
                  <sup className="reader-verse-number font-sans">{v.n}</sup>
                  {v.text}
                </span>
                {xr && (
                   <Button variant="reference" aria-label={`Cross-references for ${title}:${v.n}`} title={`Cross-references for verse ${v.n}`} onClick={() => setRefs({ from: `${title}:${v.n}`, list: xr })} className="mx-1 inline-flex h-6 gap-1 px-2 align-middle font-sans text-[10px] [&_svg]:size-3">
                     <BookOpen strokeWidth={1.5} />{xr.length}
                   </Button>
                )}{" "}
              </span>
            );
          })}
        </div>

        {multi && data && (
          <div className="mt-8 flex items-center justify-between font-sans">
            {ch > 1 ? <Link to="/read/$bookId/$chapter" params={{ bookId: book.id, chapter: String(ch - 1) }} className="flex items-center gap-1 text-primary"><ChevronLeft className="h-4 w-4" />Prev</Link> : <span />}
            {book.apiId ? (
               <Button variant="outline" size="sm" onClick={downloadBook} disabled={dl !== "idle"} className="gap-1 rounded-full border-reader-gold/40 text-reader-verse">
                {dl === "done" ? <><Check className="h-3.5 w-3.5" />Saved offline</> : dl === "busy" ? "Saving…" : <><Download className="h-3.5 w-3.5" />Save {book.name} offline</>}
               </Button>
            ) : <span />}
            {ch < book.chapters ? <Link to="/read/$bookId/$chapter" params={{ bookId: book.id, chapter: String(ch + 1) }} className="flex items-center gap-1 text-primary">Next<ChevronRight className="h-4 w-4" /></Link> : <span />}
          </div>
        )}
      </article>

      {sel !== null && data && (
        <div className="fixed inset-x-3 bottom-[200px] z-40 mx-auto flex max-w-sm items-center justify-around rounded-full border bg-card p-2 shadow-float">
          {HIGHLIGHTS.map((c) => (
             <Button variant="ghost" size="icon" key={c} aria-label={`Highlight ${c}`} title={`Highlight ${c}`} onClick={() => { setHls({ ...hls, [k(sel)]: c }); setSel(null); }} className={`h-8 w-8 rounded-full border ${hlClass[c]}`} />
          ))}
           <Button variant="ghost" size="sm" onClick={() => { const n = { ...hls }; delete n[k(sel)]; setHls(n); setSel(null); }} className="text-xs text-muted-foreground">Clear</Button>
           <Button variant="ghost" size="icon" aria-label="Bookmark" title="Save verse" onClick={() => {
            const text = data.verses.find((v) => v.n === sel)?.text ?? "";
            if (!marks.some((m) => m.book === book.id && m.chapter === ch && m.verse === sel)) setMarks([{ book: book.id, chapter: ch, verse: sel, text }, ...marks]);
            setSel(null);
           }}><Bookmark className="h-5 w-5 text-primary" /></Button>
        </div>
      )}

      <Sheet open={!!refs} onOpenChange={(o) => !o && setRefs(null)}>
         <SheetContent side="bottom" className="reader-sheet inset-x-0 mx-auto max-h-[78dvh] max-w-2xl overflow-y-auto rounded-t-lg border-t-2 border-reader-gold px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4 sm:px-10">
           <div aria-hidden="true" className="mx-auto mb-6 h-1 w-10 rounded-full bg-reader-rule" />
           <SheetHeader className="mb-6 text-left"><SheetTitle className="font-display text-3xl">Cross-references</SheetTitle><SheetDescription className="text-reader-verse">{refs?.from}</SheetDescription></SheetHeader>
           <div className="divide-y divide-reader-rule">
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
     <div className="py-5 first:pt-0">
      <p className="text-sm font-bold text-primary">{r.label}</p>
       <p className="mt-2 font-reader text-xl leading-relaxed">{text ?? "…"}</p>
       <Button asChild variant="link" size="sm" className="mt-2 h-8 px-0 text-xs"><Link to="/read/$bookId/$chapter" params={{ bookId: r.book, chapter: String(r.chapter) }} onClick={onGo}>Open passage<ArrowUpRight /></Link></Button>
    </div>
  );
}
