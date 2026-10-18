import { get, set, keys, getMany } from "idb-keyval";
import { getBook, type Translation } from "@/data/books";
import { EXTRA_TEXTS } from "@/data/extra-texts";

export interface Verse { n: number; text: string }
export interface Chapter { verses: Verse[]; heading?: string; source?: string; partial?: boolean }

const clean = (t: string) =>
  t.replace(/<S>\d+<\/S>/g, "").replace(/<sup>.*?<\/sup>/g, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

const key = (tr: string, book: string, ch: number) => `ch:${tr}:${book}:${ch}`;

export async function loadChapter(tr: Translation, bookId: string, ch: number): Promise<Chapter> {
  const book = getBook(bookId);
  if (!book) throw new Error("Unknown book");
  if (!book.apiId) {
    const x = EXTRA_TEXTS[bookId];
    return { verses: x?.verses ?? [], heading: x?.heading, source: x?.source, partial: true };
  }
  const k = key(tr, bookId, ch);
  const cached = await get<Chapter>(k);
  if (cached) return cached;
  const res = await fetch(`https://bolls.life/get-text/${tr}/${book.apiId}/${ch}/`);
  if (!res.ok) throw new Error("Could not load this chapter. Check your connection.");
  const data: { verse: number; text: string }[] = await res.json();
  const chapter = { verses: data.map((v) => ({ n: v.verse, text: clean(v.text) })) };
  await set(k, chapter);
  return chapter;
}

export async function isCached(tr: Translation, bookId: string, ch: number) {
  return !!(await get(key(tr, bookId, ch)));
}

export interface Hit { book: string; chapter: number; verse: number; text: string; tr: string }

export async function searchAll(q: string, limit = 200): Promise<Hit[]> {
  const needle = q.toLowerCase().trim();
  if (needle.length < 2) return [];
  const hits: Hit[] = [];
  for (const [book, x] of Object.entries(EXTRA_TEXTS)) {
    for (const v of x.verses) if (v.text.toLowerCase().includes(needle)) hits.push({ book, chapter: 1, verse: v.n, text: v.text, tr: "—" });
  }
  const all = (await keys()).filter((k) => String(k).startsWith("ch:")) as string[];
  const vals = await getMany<Chapter>(all);
  all.forEach((k, i) => {
    const [, tr = "", book = "", ch = "1"] = k.split(":");
    for (const v of vals[i]?.verses ?? []) {
      if (hits.length >= limit) return;
      if (v.text.toLowerCase().includes(needle)) hits.push({ book, chapter: +ch, verse: v.n, text: v.text, tr });
    }
  });
  return hits;
}

export async function countCached() {
  return (await keys()).filter((k) => String(k).startsWith("ch:")).length;
}
