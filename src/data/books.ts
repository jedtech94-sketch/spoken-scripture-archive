export type Category = "ot" | "nt" | "deutero" | "historical";

export interface Book {
  id: string; // slug
  name: string;
  category: Category;
  chapters: number;
  /** bolls.life numeric book id for canonical books */
  apiId?: number;
}

const OT: [string, number][] = [
  ["Genesis", 50], ["Exodus", 40], ["Leviticus", 27], ["Numbers", 36], ["Deuteronomy", 34],
  ["Joshua", 24], ["Judges", 21], ["Ruth", 4], ["1 Samuel", 31], ["2 Samuel", 24],
  ["1 Kings", 22], ["2 Kings", 25], ["1 Chronicles", 29], ["2 Chronicles", 36], ["Ezra", 10],
  ["Nehemiah", 13], ["Esther", 10], ["Job", 42], ["Psalms", 150], ["Proverbs", 31],
  ["Ecclesiastes", 12], ["Song of Solomon", 8], ["Isaiah", 66], ["Jeremiah", 52], ["Lamentations", 5],
  ["Ezekiel", 48], ["Daniel", 12], ["Hosea", 14], ["Joel", 3], ["Amos", 9],
  ["Obadiah", 1], ["Jonah", 4], ["Micah", 7], ["Nahum", 3], ["Habakkuk", 3],
  ["Zephaniah", 3], ["Haggai", 2], ["Zechariah", 14], ["Malachi", 4],
];
const NT: [string, number][] = [
  ["Matthew", 28], ["Mark", 16], ["Luke", 24], ["John", 21], ["Acts", 28],
  ["Romans", 16], ["1 Corinthians", 16], ["2 Corinthians", 13], ["Galatians", 6], ["Ephesians", 6],
  ["Philippians", 4], ["Colossians", 4], ["1 Thessalonians", 5], ["2 Thessalonians", 3], ["1 Timothy", 6],
  ["2 Timothy", 4], ["Titus", 3], ["Philemon", 1], ["Hebrews", 13], ["James", 5],
  ["1 Peter", 5], ["2 Peter", 3], ["1 John", 5], ["2 John", 1], ["3 John", 1],
  ["Jude", 1], ["Revelation", 22],
];

export const slug = (n: string) => n.toLowerCase().replace(/\s+/g, "-");

export const BOOKS: Book[] = [
  ...OT.map(([name, chapters], i) => ({ id: slug(name), name, chapters, category: "ot" as const, apiId: i + 1 })),
  ...NT.map(([name, chapters], i) => ({ id: slug(name), name, chapters, category: "nt" as const, apiId: i + 40 })),
  ...[
    ["1 Enoch", 1], ["Jubilees", 1], ["4 Ezra", 16], ["3 Meqabyan", 1], ["4 Baruch", 9],
    ["Judith", 1], ["Tobit", 1], ["Sirach", 1], ["Wisdom of Solomon", 1], ["Rest of Esther", 1],
  ].map(([name, chapters]) => ({ id: slug(name as string), name: name as string, chapters: chapters as number, category: "deutero" as const })),
  ...[
    "Book of Jasher", "Book of Josippon", "Testaments of the 12 Patriarchs", "Lost Reference Summaries",
  ].map((name) => ({ id: slug(name), name, chapters: 1, category: "historical" as const })),
];

export const CATEGORIES: { id: Category; title: string; subtitle: string }[] = [
  { id: "ot", title: "Old Testament", subtitle: "Genesis – Malachi" },
  { id: "nt", title: "New Testament", subtitle: "Matthew – Revelation" },
  { id: "deutero", title: "Ethiopian Deuterocanon", subtitle: "Enoch, Jubilees, Meqabyan & more" },
  { id: "historical", title: "Referenced & Historical", subtitle: "Jasher, Josippon, Patriarchs" },
];

export const getBook = (id: string) => BOOKS.find((b) => b.id === id);

export const TRANSLATIONS = ["KJV", "BSB", "WEB", "ASV"] as const;
export type Translation = (typeof TRANSLATIONS)[number];
