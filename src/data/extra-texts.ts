// Partial public-domain excerpts (R.H. Charles 1913/1917, KJV Apocrypha 1611, Jasher 1840).
// These books are not covered by the live translation source, so only key passages ship.
export interface ExtraText {
  heading: string;
  source: string;
  verses: { n: number; text: string }[];
}

export const EXTRA_TEXTS: Record<string, ExtraText> = {
  "1-enoch": {
    heading: "Chapter 1 — The Coming Judgement",
    source: "R. H. Charles, 1917",
    verses: [
      { n: 1, text: "The words of the blessing of Enoch, wherewith he blessed the elect and righteous, who will be living in the day of tribulation, when all the wicked and godless are to be removed." },
      { n: 2, text: "And he took up his parable and said—Enoch a righteous man, whose eyes were opened by God, saw the vision of the Holy One in the heavens, which the angels showed me, and from them I heard everything, and from them I understood as I saw, but not for this generation, but for a remote one which is for to come." },
      { n: 3, text: "Concerning the elect I said, and took up my parable concerning them: The Holy Great One will come forth from His dwelling," },
      { n: 4, text: "And the eternal God will tread upon the earth, (even) on Mount Sinai, and appear from His camp, and appear in the strength of His might from the heaven of heavens." },
      { n: 9, text: "And behold! He cometh with ten thousands of His holy ones to execute judgement upon all, and to destroy all the ungodly: and to convict all flesh of all the works of their ungodliness which they have ungodly committed, and of all the hard things which ungodly sinners have spoken against Him." },
    ],
  },
  jubilees: {
    heading: "Chapter 2 — The Days of Creation",
    source: "R. H. Charles, 1913",
    verses: [
      { n: 1, text: "And the angel of the presence spake to Moses according to the word of the Lord, saying: Write the complete history of the creation, how in six days the Lord God finished all His works and all that He created, and kept Sabbath on the seventh day and hallowed it for all ages." },
      { n: 2, text: "For on the first day He created the heavens which are above and the earth and the waters and all the spirits which serve before Him—the angels of the presence, and the angels of sanctification, and the angels of the spirit of fire, and the angels of the spirit of the winds…" },
    ],
  },
  "3-meqabyan": {
    heading: "Summary — full text not available",
    source: "Ethiopian canon (Ge'ez)",
    verses: [
      { n: 1, text: "Third Meqabyan is a short book of the Ethiopian Orthodox canon, distinct from the Greek Maccabees, offering exhortations on repentance, the resurrection, and the justice of God." },
      { n: 2, text: "No verified English translation of this book could be sourced: it survives fully only in Ge'ez, and no public-domain English rendering exists. Rather than include an unverified text, only this summary is shown." },
    ],
  },
  judith: {
    heading: "Chapter 13 (excerpt)",
    source: "KJV Apocrypha, 1611",
    verses: [
      { n: 7, text: "Then she came to the pillar of the bed, which was at Holofernes' head, and took down his fauchion from thence," },
      { n: 8, text: "And approached to his bed, and took hold of the hair of his head, and said, Strengthen me, O Lord God of Israel, this day." },
    ],
  },
  tobit: {
    heading: "Chapter 12 (excerpt)",
    source: "KJV Apocrypha, 1611",
    verses: [
      { n: 8, text: "Prayer is good with fasting and alms and righteousness. A little with righteousness is better than much with unrighteousness. It is better to give alms than to lay up gold:" },
      { n: 15, text: "I am Raphael, one of the seven holy angels, which present the prayers of the saints, and which go in and out before the glory of the Holy One." },
    ],
  },
  sirach: {
    heading: "Chapter 1 (excerpt)",
    source: "KJV Apocrypha, 1611",
    verses: [
      { n: 1, text: "All wisdom cometh from the Lord, and is with him for ever." },
      { n: 14, text: "To fear the Lord is the beginning of wisdom: and it was created with the faithful in the womb." },
    ],
  },
  "wisdom-of-solomon": {
    heading: "Chapter 3 (excerpt)",
    source: "KJV Apocrypha, 1611",
    verses: [
      { n: 1, text: "But the souls of the righteous are in the hand of God, and there shall no torment touch them." },
      { n: 2, text: "In the sight of the unwise they seemed to die: and their departure is taken for misery," },
      { n: 3, text: "And their going from us to be utter destruction: but they are in peace." },
    ],
  },
  "rest-of-esther": {
    heading: "Chapter 13 — Prayer of Mardocheus (excerpt)",
    source: "KJV Apocrypha, 1611",
    verses: [
      { n: 9, text: "Saying, O Lord, Lord, the King Almighty: for the whole world is in thy power, and if thou hast appointed to save Israel, there is no man that can gainsay thee:" },
    ],
  },
  "book-of-jasher": {
    heading: "Chapter 1 (excerpt)",
    source: "J. H. Parry edition, 1887",
    verses: [
      { n: 1, text: "And God said, Let us make man in our image, after our likeness, and God created man in his own image." },
      { n: 2, text: "And God formed man from the ground, and he blew into his nostrils the breath of life, and man became a living soul endowed with speech." },
    ],
  },
  "book-of-josippon": {
    heading: "Summary — full text not available",
    source: "Medieval Hebrew chronicle (10th c.)",
    verses: [
      { n: 1, text: "Josippon is a Hebrew history of the Jewish people from Adam to the fall of the Second Temple, drawing on Josephus and other sources, and was widely read in Ethiopia as Zena Ayhud." },
      { n: 2, text: "No verified English translation of the full chronicle could be sourced: existing English translations are modern and under copyright, and no public-domain rendering exists. Rather than include an unverified text, only this summary is shown." },
    ],
  },
  "testaments-of-the-12-patriarchs": {
    heading: "Testament of Reuben 1 (excerpt)",
    source: "R. H. Charles, 1908",
    verses: [
      { n: 1, text: "The copy of the Testament of Reuben, even the commands which he gave his sons before he died in the hundred and twenty-fifth year of his life." },
    ],
  },
  "lost-reference-summaries": {
    heading: "Books named in Scripture but lost",
    source: "Study notes",
    verses: [
      { n: 1, text: "The Book of the Wars of the LORD — quoted in Numbers 21:14 for a fragment about Waheb in Suphah and the brooks of Arnon." },
      { n: 2, text: "The Book of Jasher (the Upright) — cited in Joshua 10:13 and 2 Samuel 1:18." },
      { n: 3, text: "The Chronicles of Nathan the Prophet and Gad the Seer — 1 Chronicles 29:29." },
      { n: 4, text: "The Epistle from Laodicea — Colossians 4:16." },
    ],
  },
};
