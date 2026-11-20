// Adjectives: from dictionary/adjectives.csv, with their forms worked out from
// the ending. They agree with the noun in gender and number:
//   -o  four forms:  rosso, rossa, rossi, rosse
//   -e  two forms:   grande (m. and f.), grandi
//   invariable:      blu, rosa, viola never change
//
// adjectives.csv columns:
//   topic       which subpage it's on (see ADJECTIVE_PAGES)
//   adjective   the masculine singular (base) form
//   english     its meaning
//   invariable  "yes" if it never changes, otherwise empty
//   m_pl, f_pl  only when the rules below get a plural wrong (simpatico → simpatici)
//   note        optional note on the page (*italic* and **bold** allowed)
//
// comparison.csv holds comparison as phrases and forms (più alto di = taller
// than, bellissimo = very beautiful, migliore = better). Columns: topic (see
// COMPARISON_TOPICS), italian, english, from (for -issimo forms: the adjective,
// checked against superlativeOf), note. Each row is one card.
import adjectivesCSV from "../dictionary/adjectives.csv?raw";
import comparisonCSV from "../dictionary/comparison.csv?raw";
import { parseCSV } from "./csv.js";

export const ADJECTIVES_CSV = adjectivesCSV;
export const adjectives = parseCSV(adjectivesCSV);

// The subpages (adjectives.html#id) and their titles, in order.
export const ADJECTIVE_PAGES = [
  { id: "common", label: "Common", title: "Common adjectives" },
  { id: "colours", label: "Colours", title: "Colours" },
  { id: "character", label: "Character", title: "People and character" },
  { id: "feelings", label: "Feelings", title: "Feelings and states" },
  { id: "comparison", label: "Comparison", title: "Comparison" },
];

// The sections of the Comparison subpage.
export const COMPARISON_TOPICS = [
  { id: "comparing", title: "More, less, as … as" },
  { id: "superlative", title: "The most, and -issimo (very)" },
  { id: "irregular", title: "Better, worse, bigger, smaller" },
];

export const COMPARISON_CSV = comparisonCSV;
export const comparisons = parseCSV(comparisonCSV);

const isVowel = (c) => "aeiouàèéìòù".includes(c);

/**
 * The forms of an adjective: { msg, fsg, mpl, fpl } (masculine/feminine,
 * singular/plural), from the ending, with the m_pl/f_pl columns overriding.
 */
export function adjectiveForms(adj) {
  const base = adj.adjective;
  let forms;
  if (adj.invariable === "yes") {
    forms = { msg: base, fsg: base, mpl: base, fpl: base };
  } else if (base.endsWith("e")) {
    const plural = base.slice(0, -1) + "i";
    forms = { msg: base, fsg: base, mpl: plural, fpl: plural };
  } else if (base.endsWith("o")) {
    const s = base.slice(0, -1); // ross-, bianc-, vecchi-, grigi-
    let mpl = s + "i";
    let fpl = s + "e";
    if (/[cg]$/.test(s)) {
      // bianco → bianchi, bianche; lungo → lunghi, lunghe (keep the hard sound)
      mpl = s + "hi";
      fpl = s + "he";
    } else if (s.endsWith("i")) {
      // vecchio → vecchi (no double i); vecchie
      mpl = s;
      // grigio → grigie (vowel before g), liscio → lisce (consonant before c)
      if (/[cg]i$/.test(s) && !isVowel(s.at(-3))) fpl = s.slice(0, -1) + "e";
    }
    forms = { msg: base, fsg: s + "a", mpl, fpl };
  } else {
    throw new Error(`${base}: adjectives must end in -o or -e, or be marked invariable`);
  }
  if (adj.m_pl) forms.mpl = adj.m_pl;
  if (adj.f_pl) forms.fpl = adj.f_pl;
  return forms;
}

/** "four" (-o), "two" (-e) or "one" (invariable): how many different forms it has. */
export function adjectiveType(adj) {
  if (adj.invariable === "yes") return "one";
  return adj.adjective.endsWith("e") ? "two" : "four";
}

/**
 * The card id of a form: "adjectives.rosso" (base), ".f", ".mpl", ".fpl",
 * or ".pl" for the shared plural of -e adjectives. Forms that are the same
 * word (grande m./f.) share one card. The page uses this to colour each cell.
 */
export function adjectiveCardId(adj, form) {
  const base = `adjectives.${adj.adjective}`;
  const type = adjectiveType(adj);
  if (type === "one" || form === "msg" || (type === "two" && form === "fsg")) return base;
  if (type === "two") return `${base}.pl`;
  return `${base}.${{ fsg: "f", mpl: "mpl", fpl: "fpl" }[form]}`;
}

const LABEL = { fsg: "f. sing.", mpl: "m. pl.", fpl: "f. pl." };

/** The cards of one adjective: the base form, then each different form. */
export function adjectiveCards(adj) {
  const forms = adjectiveForms(adj);
  // tenseKey: "base", "fsg", "mpl", "fpl", or "pl" (the shared plural of -e adjectives).
  const card = (form, it, en, key = form === "msg" ? "base" : form) =>
    ({ id: adjectiveCardId(adj, form), tenseKey: key, kind: "Adjective", tense: "Adjective", it, en });
  const cards = [card("msg", forms.msg, adj.english)];
  const type = adjectiveType(adj);
  if (type === "two") cards.push(card("mpl", forms.mpl, `${adj.english} (pl.)`, "pl"));
  if (type === "four") for (const f of ["fsg", "mpl", "fpl"]) cards.push(card(f, forms[f], `${adj.english} (${LABEL[f]})`));
  return cards;
}

/**
 * The -issimo form (very …): the masculine plural with -i replaced by -issimo
 * (belli → bellissimo, bianchi → bianchissimo, grandi → grandissimo).
 * Invariable adjectives (blu, rosa) have none.
 */
export function superlativeOf(adj) {
  if (adjectiveType(adj) === "one") return null;
  return adjectiveForms(adj).mpl.slice(0, -1) + "issimo";
}

/** The card id of a comparison row: "adjectives.comparison.migliore". */
export const comparisonCardId = (row) => `adjectives.comparison.${row.italian}`;

/** The comparison cards (più alto di = taller than, ...). */
export function comparisonCards(rows = comparisons) {
  return COMPARISON_TOPICS.flatMap((t) => rows.filter((r) => r.topic === t.id)).map((r) => ({
    id: comparisonCardId(r), tenseKey: "comparison", kind: "Adjective", tense: "Adjective · comparison", it: r.italian, en: r.english,
  }));
}

/** All adjective cards, in subpage order, then the comparison cards. */
export function allAdjectiveCards(rows = adjectives) {
  return [...ADJECTIVE_PAGES.flatMap((p) => rows.filter((a) => a.topic === p.id).flatMap(adjectiveCards)), ...comparisonCards()];
}
