import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { getBook } from "@/data/books";
import { searchAll, countCached, type Hit } from "@/lib/bible";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — Chikuni Study Bible" },
      { name: "description", content: "Search the full text of every chapter saved on your device, offline." },
      { property: "og:title", content: "Search — Chikuni Study Bible" },
      { property: "og:description", content: "Offline full-text search across your saved chapters." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { q?: string } => (typeof s.q === "string" ? { q: s.q } : {}),
  component: SearchPage,
});

function SearchPage() {
  const { q: initialQ } = Route.useSearch();
  const [q, setQ] = useState(initialQ ?? "");
  useEffect(() => { if (initialQ) setQ(initialQ); }, [initialQ]);
  const [hits, setHits] = useState<Hit[]>([]);
  const [count, setCount] = useState(0);
  useEffect(() => { countCached().then(setCount); }, []);
  useEffect(() => {
    const t = setTimeout(() => searchAll(q).then(setHits), 200);
    return () => clearTimeout(t);
  }, [q]);
  return (
    <AppShell>
      <div className="px-4 pt-8">
        <h1 className="font-display text-4xl font-semibold">Search</h1>
        <p className="mt-1 text-sm text-muted-foreground">Searches {count} saved chapters plus the extra books — works offline.</p>
        <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. light, shepherd, Enoch" className="mt-4 h-12 bg-card" />
        <ul className="mt-4 space-y-2">
          {hits.map((h, i) => (
            <li key={i}>
              <Link to="/read/$bookId/$chapter" params={{ bookId: h.book, chapter: String(h.chapter) }} className="block rounded-xl border bg-card p-3">
                <p className="text-xs font-bold text-primary">{getBook(h.book)?.name} {h.chapter}:{h.verse} · {h.tr}</p>
                <p className="mt-1 font-scripture text-sm">{h.text}</p>
              </Link>
            </li>
          ))}
          {q.length > 1 && !hits.length && <p className="text-sm text-muted-foreground">No matches yet. Open more chapters to include them in search.</p>}
        </ul>
      </div>
    </AppShell>
  );
}
