import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CATEGORIES, BOOKS } from "@/data/books";
import { useState } from "react";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "All Books — Chikuni Study Bible" },
      { name: "description", content: "Browse the Old and New Testaments, the Ethiopian deuterocanon and referenced historical texts." },
      { property: "og:title", content: "All Books — Chikuni Study Bible" },
      { property: "og:description", content: "Browse every book in the Chikuni Study Bible." },
    ],
  }),
  component: Library,
});

function Library() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <AppShell>
      <h1 className="px-4 pt-8 font-display text-4xl font-semibold">Books</h1>
      {CATEGORIES.map((c) => (
        <section key={c.id} id={c.id} className="px-4 pt-6">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">{c.title}</h2>
          <div className="divide-y rounded-xl border bg-card">
            {BOOKS.filter((b) => b.category === c.id).map((b) => (
              <div key={b.id}>
                {b.chapters > 1 ? (
                  <button onClick={() => setOpen(open === b.id ? null : b.id)} className="flex w-full justify-between p-3 text-left">
                    <span className="font-medium">{b.name}</span>
                    <span className="text-sm text-muted-foreground">{b.chapters}</span>
                  </button>
                ) : (
                  <Link to="/read/$bookId/$chapter" params={{ bookId: b.id, chapter: "1" }} className="flex justify-between p-3">
                    <span className="font-medium">{b.name}</span>
                    <span className="text-xs text-muted-foreground">{b.apiId ? "1" : "Excerpts"}</span>
                  </Link>
                )}
                {open === b.id && (
                  <div className="grid grid-cols-6 gap-2 px-3 pb-3">
                    {Array.from({ length: b.chapters }, (_, i) => (
                      <Link key={i} to="/read/$bookId/$chapter" params={{ bookId: b.id, chapter: String(i + 1) }} className="rounded-md bg-secondary py-2 text-center text-sm">
                        {i + 1}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </AppShell>
  );
}
