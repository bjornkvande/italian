// French adverbs from dictionary/fr/adverbs.csv. They never change, so each
// is one card. Many are made from an adjective with -ment (lent → lentement);
// time words that are in the Basics (souvent, toujours, déjà…) stay there.
//
// adverbs.csv columns:
//   topic    which subpage it's on (see ADVERB_PAGES)
//   adverb   the adverb or short expression (bien, de temps en temps)
//   english  its meaning
//   level    beginner | intermediate | advanced: from which level it's practised
//   from     for -ment adverbs, the adjective it's made from (lent → lentement)
//   note     optional note on the page (*italic* and **bold** allowed)
import adverbsCSV from "../../../dictionary/fr/adverbs.csv?raw";
import { parseCSV } from "../../core/csv.js";
import { adjectives, feminine } from "./adjectives.js";

export const ADVERBS_CSV = adverbsCSV;
export const adverbs = parseCSV(adverbsCSV);

// The subpages (fr/adverbs.html#id), in order.
export const ADVERB_PAGES = [
  { id: "manner", label: "How", title: "How: manner" },
  { id: "degree", label: "How much", title: "How much: degree" },
  { id: "when", label: "When", title: "When: time" },
  { id: "opinion", label: "Opinion", title: "Opinion and certainty" },
];

export const LEVELS = ["beginner", "intermediate", "advanced"];

/**
 * The -ment adverb of an adjective: -ant → -amment, -ent → -emment (récemment)
 * for words of more than one syllable;
 * after a vowel the masculine + -ment (vraiment, poliment); otherwise the
 * feminine + -ment (lentement, heureusement, doucement).
 */
export function menteFrom(adjective) {
  const syllables = (adjective.match(/[aeiouyéèêâîôû]+/g) ?? []).length;
  if (syllables > 1 && adjective.endsWith("ant")) return adjective.slice(0, -3) + "amment";
  if (syllables > 1 && adjective.endsWith("ent")) return adjective.slice(0, -3) + "emment"; // but lent → lentement
  if (/[éiu]$/.test(adjective)) return adjective + "ment";
  const row = adjectives.find((a) => a.adjective === adjective) ?? { adjective };
  return feminine(row) + "ment";
}

/** The card id of an adverb: "adverbs.bien". */
export const adverbCardId = (a) => `adverbs.${a.adverb}`;

/** One card per adverb; form is its level, which the difficulties filter on. */
export function adverbCards(rows = adverbs) {
  const label = (a) => ADVERB_PAGES.find((p) => p.id === a.topic).label.toLowerCase();
  return ADVERB_PAGES.flatMap((p) => rows.filter((a) => a.topic === p.id)).map((a) => ({
    id: adverbCardId(a), form: a.level, kind: "Adverb", heading: `Adverb · ${label(a)}`, it: a.adverb, en: a.english,
  }));
}
