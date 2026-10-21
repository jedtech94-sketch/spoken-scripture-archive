import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { getBook } from "@/data/books";
import { usePref } from "@/lib/prefs";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/bookmarks")({
  head: () => ({
    meta: [
      { title: "Bookmarks — Chikuni Study Bible" },
      { name: "description", content: "Your saved verses in the Chikuni Study Bible." },
      { property: "og:title", content: "Bookmarks — Chikuni Study Bible" },
      { property: "og:description", content: "Your saved verses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Bookmarks,
});

export interface Mark { book: string; chapter: number; verse: number; text: string }

function Bookmarks() {
  const [marks, setMarks] = usePref<Mark[]>("bookmarks", []);
  return (
    <AppShell>
      <div className="px-4 pt-8">
        <h1 className="font-display text-4xl font-semibold">Saved verses</h1>
        {!marks.length && <p className="mt-4 text-sm text-muted-foreground">Tap any verse while reading, then the bookmark icon to save it here.</p>}
        <ul className="mt-4 space-y-2">
          {marks.map((m, i) => (
            <li key={i} className="flex gap-2 rounded-xl border bg-card p-3">
              <Link to="/read/$bookId/$chapter" params={{ bookId: m.book, chapter: String(m.chapter) }} className="flex-1">
                <p className="text-xs font-bold text-primary">{getBook(m.book)?.name} {m.chapter}:{m.verse}</p>
                <p className="mt-1 font-scripture text-sm">{m.text}</p>
              </Link>
              <button aria-label="Remove" onClick={() => setMarks(marks.filter((_, j) => j !== i))} className="text-muted-foreground"><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
