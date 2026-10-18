import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CATEGORIES, BOOKS, getBook } from "@/data/books";
import { usePref } from "@/lib/prefs";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chikuni Study Bible — Read, Study & Listen Offline" },
      { name: "description", content: "A study Bible with KJV, BSB, WEB and ASV, the Ethiopian deuterocanon, cross-references and offline reading." },
      { property: "og:title", content: "Chikuni Study Bible" },
      { property: "og:description", content: "Four translations, the Ethiopian canon, cross-references and offline audio reading." },
    ],
  }),
  component: Home,
});

function Home() {
  const [last] = usePref<{ book: string; chapter: number } | null>("last", null);
  const lastBook = last && getBook(last.book);
  return (
    <AppShell>
      <header className="bg-hero px-6 pb-10 pt-14 text-primary-foreground dark:text-foreground">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">✣ Study Bible ✣</p>
        <h1 className="mt-2 font-display text-5xl font-semibold leading-none">Chikuni</h1>
        <p className="mt-3 max-w-xs text-sm opacity-85">Scripture in four translations, with the books of the Ethiopian canon.</p>
        <Link
          to="/read/$bookId/$chapter"
          params={{ bookId: lastBook ? lastBook.id : "genesis", chapter: String(last?.chapter ?? 1) }}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-accent-foreground"
        >
          {lastBook ? `Continue ${lastBook.name} ${last!.chapter}` : "Begin at Genesis 1"} <ChevronRight className="h-4 w-4" />
        </Link>
      </header>
      <section className="space-y-3 px-4 py-6">
        {CATEGORIES.map((c) => (
          <Link key={c.id} to="/library" hash={c.id} className="flex items-center justify-between rounded-xl border bg-card p-4">
            <div>
              <h2 className="font-display text-2xl font-semibold text-primary">{c.title}</h2>
              <p className="text-sm text-muted-foreground">{c.subtitle} · {BOOKS.filter((b) => b.category === c.id).length} books</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
