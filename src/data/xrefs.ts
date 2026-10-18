export interface Ref { book: string; chapter: number; verse: number; label: string }

// key: `${bookId}.${chapter}.${verse}`
export const XREFS: Record<string, Ref[]> = {
  "genesis.1.1": [
    { book: "john", chapter: 1, verse: 1, label: "John 1:1" },
    { book: "jubilees", chapter: 1, verse: 2, label: "Jubilees 2:2" },
    { book: "hebrews", chapter: 11, verse: 3, label: "Hebrews 11:3" },
  ],
  "genesis.1.26": [{ book: "book-of-jasher", chapter: 1, verse: 1, label: "Jasher 1:1" }],
  "genesis.5.24": [
    { book: "hebrews", chapter: 11, verse: 5, label: "Hebrews 11:5" },
    { book: "1-enoch", chapter: 1, verse: 1, label: "1 Enoch 1:1" },
  ],
  "numbers.21.14": [{ book: "lost-reference-summaries", chapter: 1, verse: 1, label: "Wars of the LORD" }],
  "joshua.10.13": [{ book: "book-of-jasher", chapter: 1, verse: 1, label: "Book of Jasher" }],
  "2-samuel.1.18": [{ book: "lost-reference-summaries", chapter: 1, verse: 2, label: "Book of Jasher" }],
  "john.1.1": [
    { book: "genesis", chapter: 1, verse: 1, label: "Genesis 1:1" },
    { book: "1-john", chapter: 1, verse: 1, label: "1 John 1:1" },
  ],
  "john.3.16": [{ book: "romans", chapter: 5, verse: 8, label: "Romans 5:8" }],
  "jude.1.14": [
    { book: "1-enoch", chapter: 1, verse: 9, label: "1 Enoch 1:9" },
    { book: "genesis", chapter: 5, verse: 24, label: "Genesis 5:24" },
  ],
  "psalms.23.1": [{ book: "john", chapter: 10, verse: 11, label: "John 10:11" }],
  "proverbs.1.7": [{ book: "sirach", chapter: 1, verse: 14, label: "Sirach 1:14" }],
  "revelation.8.3": [{ book: "tobit", chapter: 1, verse: 15, label: "Tobit 12:15" }],
};
