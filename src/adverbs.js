// Adverbs: from dictionary/adverbs.csv. They never change form, so each adverb
// is one card. Adverbs that are already in the Basics (oggi, sempre, mai, anche,
// sì, no, and the place words qui, sopra, davanti, ...) stay there;
// tests/adverbs.test.js checks there are no duplicates.
//
// adverbs.csv columns:
//   topic    which subpage it's on (see ADVERB_PAGES)
//   adverb   the adverb or short expression (bene, di solito)
//   english  its meaning
//   level    beginner | intermediate | advanced: from which level it's practised
//   from     for -mente adverbs, the adjective it's made from (lento → lentamente)
//   note     optional note on the page (*italic* and **bold** allowed)
import adverbsCSV from "../dictionary/adverbs.csv?raw";
import { parseCSV } from "./csv.js";

export const ADVERBS_CSV = adverbsCSV;
export const adverbs = parseCSV(adverbsCSV);

// The subpages (adverbs.html#id), in order.
export const ADVERB_PAGES = [
  { id: "manner", label: "How", title: "How: manner" },
  { id: "degree", label: "How much", title: "How much: degree" },
  { id: "when", label: "When", title: "When: time" },
  { id: "opinion", label: "Opinion", title: "Opinion and certainty" },
];

export const LEVELS = ["beginner", "intermediate", "advanced"];

/**
 * The -mente adverb made from an adjective: the feminine form + -mente
 * (lento → lentamente), but adjectives in -le/-re drop the e (facile →
 * facilmente, regolare → regolarmente).
 */
export function menteFrom(adjective) {
  if (adjective.endsWith("o")) return adjective.slice(0, -1) + "amente";
  if (/[lr]e$/.test(adjective)) return adjective.slice(0, -1) + "mente";
  return adjective + "mente";
}

/** The card id of an adverb: "adverbs.bene". The page uses it to colour rows. */
export const adverbCardId = (adv) => `adverbs.${adv.adverb}`;

/** All adverb cards, in subpage order. tenseKey is the level it belongs to. */
export function adverbCards(rows = adverbs) {
  return ADVERB_PAGES.flatMap((p) => rows.filter((a) => a.topic === p.id)).map((a) => ({
    id: adverbCardId(a),
    tenseKey: a.level,
    tense: "Adverb",
    it: a.adverb,
    en: a.english,
  }));
}
