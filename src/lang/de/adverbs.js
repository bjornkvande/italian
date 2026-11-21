// German adverbs from dictionary/de/adverbs.csv. They never change, so each is
// one card. Almost any adjective also works as an adverb without a change
// (Er fährt schnell), so those aren't repeated here; time words that are in the
// Basics (heute, oft, nie, …) stay there.
//
// adverbs.csv columns:
//   topic    which subpage it's on (see ADVERB_PAGES)
//   adverb   the adverb or short expression (gern, ab und zu)
//   english  its meaning
//   level    beginner | intermediate | advanced: from which level it's practised
//   note     optional note on the page (*italic* and **bold** allowed)
import adverbsCSV from "../../../dictionary/de/adverbs.csv?raw";
import { parseCSV } from "../../core/csv.js";

export const ADVERBS_CSV = adverbsCSV;
export const adverbs = parseCSV(adverbsCSV);

// The subpages (de/adverbs.html#id), in order.
export const ADVERB_PAGES = [
  { id: "manner", label: "How", title: "How: manner" },
  { id: "degree", label: "How much", title: "How much: degree" },
  { id: "when", label: "When", title: "When: time" },
  { id: "opinion", label: "Opinion", title: "Opinion and certainty" },
];

export const LEVELS = ["beginner", "intermediate", "advanced"];

/** The card id of an adverb: "adverbs.gern". */
export const adverbCardId = (a) => `adverbs.${a.adverb}`;

/** One card per adverb; form is its level, which the difficulties filter on. */
export function adverbCards(rows = adverbs) {
  const label = (a) => ADVERB_PAGES.find((p) => p.id === a.topic).label.toLowerCase();
  return ADVERB_PAGES.flatMap((p) => rows.filter((a) => a.topic === p.id)).map((a) => ({
    id: adverbCardId(a), form: a.level, kind: "Adverb", heading: `Adverb · ${label(a)}`, it: a.adverb, en: a.english,
  }));
}
