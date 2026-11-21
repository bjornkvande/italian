// German adjectives from dictionary/de/adjectives.csv. After sein, werden and
// bleiben an adjective never changes (Das Haus ist groß), so the cards are the
// base form, the comparative (größer) and the superlative (am größten), worked
// out from the rules below. The endings before a noun (der große Tisch) are on
// the reference subpage, not cards.
//
// adjectives.csv columns:
//   topic        which subpage it's on (see ADJECTIVE_PAGES)
//   adjective    the base form (groß)
//   english      its meaning; the English comparison comes from src/core/english.js
//   umlaut       "yes" if the comparison takes an umlaut (alt → älter, am ältesten)
//   comparative  only if irregular (gut → besser); "-" for no comparison (colours)
//   superlative  only if irregular (am besten, am größten)
//   note         optional note on the page (*italic* and **bold** allowed)
import adjectivesCSV from "../../../dictionary/de/adjectives.csv?raw";
import { parseCSV } from "../../core/csv.js";
import { englishComparison } from "../../core/english.js";

export const ADJECTIVES_CSV = adjectivesCSV;
export const adjectives = parseCSV(adjectivesCSV);

// The subpages (de/adjectives.html#id), in order. "endings" is reference only.
export const ADJECTIVE_PAGES = [
  { id: "common", label: "Common", title: "Common adjectives" },
  { id: "character", label: "Character", title: "People and character" },
  { id: "feelings", label: "Feelings", title: "Feelings and states" },
  { id: "things", label: "Things & weather", title: "Things, food and weather" },
  { id: "colours", label: "Colours", title: "Colours" },
  { id: "endings", label: "Comparison & endings", title: "Comparison and endings" },
];

/** alt → ält, groß → größ: the last a, o or u gets an umlaut. */
export function umlaut(word) {
  return word.replace(/[aou](?=[^aou]*$)/, (v) => ({ a: "ä", o: "ö", u: "ü" })[v]);
}

/** The comparative: klein → kleiner, alt → älter, dunkel → dunkler, teuer → teurer; null if none. */
export function comparative(a) {
  if (a.comparative === "-") return null;
  if (a.comparative) return a.comparative;
  const w = a.umlaut === "yes" ? umlaut(a.adjective) : a.adjective;
  if (w.endsWith("el")) return w.slice(0, -2) + "ler";
  if (/(au|eu)er$/.test(w)) return w.slice(0, -2) + "rer";
  if (w.endsWith("e")) return w + "r";
  return w + "er";
}

/** The superlative: am kleinsten, am ältesten (-esten after d, t, s, ß, z, sch), am müdesten; null if none. */
export function superlative(a) {
  if (a.comparative === "-") return null;
  if (a.superlative) return a.superlative;
  const w = a.umlaut === "yes" ? umlaut(a.adjective) : a.adjective;
  if (w.endsWith("e")) return `am ${w}sten`;
  return `am ${w}${/(d|t|s|ß|z|x|sch)$/.test(w) ? "esten" : "sten"}`;
}

/** The English side: [big, bigger, the biggest] (or just [red]). */
export function englishForms(a) {
  if (a.comparative === "-") return [a.english];
  const parts = a.english.split(", ").map(englishComparison);
  return [a.english, parts.map((p) => p[0]).join(", "), `the ${parts.map((p) => p[1]).join(", the ")}`];
}

/** Card id: "adjectives.groß", "adjectives.groß.comp", "adjectives.groß.sup". */
export const adjectiveCardId = (a, form = "base") => `adjectives.${a.adjective}${form === "base" ? "" : "." + form}`;

/** All adjective cards: base, comparative and superlative; form decides the difficulty. */
export function adjectiveCards(rows = adjectives) {
  const label = (a) => ADJECTIVE_PAGES.find((p) => p.id === a.topic).label;
  return ADJECTIVE_PAGES.flatMap((p) => rows.filter((a) => a.topic === p.id)).flatMap((a) => {
    const [en, enComp, enSup] = englishForms(a);
    const card = (form, heading, it, english) => ({ id: adjectiveCardId(a, form), form, kind: "Adjective", heading: `Adjective · ${heading}`, it, en: english });
    const cards = [card("base", label(a), a.adjective, en)];
    if (comparative(a)) cards.push(card("comp", "comparative", comparative(a), enComp), card("sup", "superlative", superlative(a), enSup));
    return cards;
  });
}
