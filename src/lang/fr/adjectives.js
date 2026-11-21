// French adjectives from dictionary/fr/adjectives.csv. An adjective agrees
// with its noun: masculine or feminine, singular or plural (grand, grande,
// grands, grandes). The forms come from the rules below; the CSV lists only
// the exceptions.
//
// adjectives.csv columns:
//   topic      which subpage it's on (see ADJECTIVE_PAGES)
//   adjective  the masculine singular (grand)
//   english    its meaning
//   feminine   only if irregular (belle, longue); "=" for an adjective that never changes (marron)
//   plural     only if the masculine plural is irregular (bleus)
//   note       optional note on the page (*italic* and **bold** allowed)
import adjectivesCSV from "../../../dictionary/fr/adjectives.csv?raw";
import { parseCSV } from "../../core/csv.js";

export const ADJECTIVES_CSV = adjectivesCSV;
export const adjectives = parseCSV(adjectivesCSV);

// The subpages (fr/adjectives.html#id), in order. "comparison" is reference only.
export const ADJECTIVE_PAGES = [
  { id: "common", label: "Common", title: "Common adjectives" },
  { id: "character", label: "Character", title: "People and character" },
  { id: "feelings", label: "Feelings", title: "Feelings and states" },
  { id: "things", label: "Things & weather", title: "Things, food and weather" },
  { id: "colours", label: "Colours", title: "Colours" },
  { id: "comparison", label: "Comparison & position", title: "Comparison and position" },
];

const FEMININE_ENDINGS = [["eux", "euse"], ["if", "ive"], ["f", "ve"], ["er", "ère"], ["eil", "eille"], ["el", "elle"], ["en", "enne"], ["on", "onne"], ["et", "ette"]];

/** The feminine: grande, sérieuse, sportive, chère, bonne, violette; -e stays (rouge); or as listed. */
export function feminine(a) {
  if (a.feminine === "=") return a.adjective;
  if (a.feminine) return a.feminine;
  const w = a.adjective;
  if (w.endsWith("e")) return w;
  const rule = FEMININE_ENDINGS.find(([m]) => w.endsWith(m));
  return rule ? w.slice(0, -rule[0].length) + rule[1] : w + "e";
}

/** The masculine plural: grands; unchanged after -s, -x (gris, heureux); -eau → -eaux; -al → -aux; or as listed. */
export function masculinePlural(a) {
  if (a.feminine === "=") return a.adjective;
  if (a.plural) return a.plural;
  const w = a.adjective;
  if (/[sx]$/.test(w)) return w;
  if (w.endsWith("eau")) return w + "x";
  if (w.endsWith("al")) return w.slice(0, -2) + "aux";
  return w + "s";
}

/** All four forms: { msg, fsg, mpl, fpl }. */
export function adjectiveForms(a) {
  const fsg = feminine(a);
  return { msg: a.adjective, fsg, mpl: masculinePlural(a), fpl: a.feminine === "=" ? fsg : fsg + "s" };
}

/** Card id: "adjectives.grand", "adjectives.grand.f", ".mpl", ".fpl", or ".pl" for a shared plural. */
export const adjectiveCardId = (a, form = "base") => `adjectives.${a.adjective}${form === "base" ? "" : "." + (form === "fsg" ? "f" : form)}`;

const LABEL = { fsg: "f. sing.", mpl: "m. pl.", fpl: "f. pl.", pl: "pl." };

/**
 * The cards of one adjective: the base form, then each form that differs:
 * grand → grande, grands, grandes; rouge → rouges (pl.); marron → just marron.
 * form ("base", "fsg", "pl", "mpl", "fpl") decides the difficulty.
 */
export function cardsOf(a) {
  const f = adjectiveForms(a);
  const card = (form, it) => ({
    id: adjectiveCardId(a, form),
    form, kind: "Adjective", heading: "Adjective", it, en: form === "base" ? a.english : `${a.english} (${LABEL[form]})`,
  });
  const cards = [card("base", f.msg)];
  if (f.fsg !== f.msg) cards.push(card("fsg", f.fsg));
  if (f.mpl === f.fpl) { if (f.mpl !== f.msg) cards.push(card("pl", f.mpl)); }
  else cards.push(card("mpl", f.mpl), card("fpl", f.fpl));
  return cards;
}

/** All adjective cards, subpage by subpage. */
export function adjectiveCards(rows = adjectives) {
  return ADJECTIVE_PAGES.flatMap((p) => rows.filter((a) => a.topic === p.id)).flatMap(cardsOf);
}
