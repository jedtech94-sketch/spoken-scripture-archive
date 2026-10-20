// Complete bundled texts for books not covered by the live translation source.
import { EZRA4 } from "./ezra4";
import { BARUCH4 } from "./baruch4";

export interface BundledBook {
  source: string;
  chapters: Record<number, { n: number; text: string }[]>;
}

export const BUNDLED_TEXTS: Record<string, BundledBook> = {
  "4-ezra": {
    source: "KJV Apocrypha, 1611 (public domain)",
    chapters: EZRA4,
  },
  "4-baruch": {
    source: "R. A. Kraft translation, 1974 (public electronic edition)",
    chapters: BARUCH4,
  },
};
