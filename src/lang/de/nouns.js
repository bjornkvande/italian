// German nouns from dictionary/de/nouns.csv, in themes (one subpage each), the
// most used first. Every noun is learned with its article: der, die, das.
//
// nouns.csv columns:
//   topic      which subpage it's on (see NOUN_PAGES)
//   noun       the singular without the article (Tisch)
//   gender     m | f | n: the article der | die | das
//   plural     the plural without the article (Tische); "-" when the noun is
//              normally not used in the plural. German plurals follow no
//              reliable rule, so each is listed (tests/de/nouns.test.js checks
//              the patterns that do hold)
//   english    the singular meaning, without "the" (table)
//   en_plural  only if the English plural isn't the regular one (feet)
//   level      beginner | intermediate: from which level it's practised
//   note       optional note on the page (*italic* and **bold** allowed)
import nounsCSV from "../../../dictionary/de/nouns.csv?raw";
import { parseCSV } from "../../core/csv.js";
import { englishPlural } from "../../core/english.js";

export const NOUNS_CSV = nounsCSV;
export const nouns = parseCSV(nounsCSV);

// The subpages (de/nouns.html#id), in order.
export const NOUN_PAGES = [
  { id: "everyday", label: "Everyday", title: "Everyday nouns" },
  { id: "people", label: "People & family", title: "People and family" },
  { id: "home", label: "Home", title: "At home" },
  { id: "food", label: "Food & drink", title: "Food and drink" },
  { id: "city", label: "City & travel", title: "City and travel" },
];

export const ARTICLES = { m: "der", f: "die", n: "das" };

/** The noun's forms with articles: { singular: "der Tisch", plural: "die Tische" | null, enSingular, enPlural }. */
export function nounForms(n) {
  const plural = n.plural === "-" ? null : n.plural;
  return {
    singular: `${ARTICLES[n.gender]} ${n.noun}`,
    plural: plural ? `die ${plural}` : null,
    enSingular: `the ${n.english}`,
    enPlural: plural ? `the ${n.en_plural || englishPlural(n.english)}` : null,
  };
}

/** The card id: "nouns.Tisch", or "nouns.Tisch.pl" for the plural. */
export const nounCardId = (n, plural = false) => `nouns.${n.noun}${plural ? ".pl" : ""}`;

/**
 * Cards: the singular with its article, and the plural as its own card.
 * form is "sg" or "pl"; with `level` it decides the difficulty.
 */
export function nounCards(rows = nouns) {
  const label = (n) => NOUN_PAGES.find((p) => p.id === n.topic).label;
  return NOUN_PAGES.flatMap((p) => rows.filter((n) => n.topic === p.id)).flatMap((n) => {
    const f = nounForms(n);
    const card = (plural, it, en) => ({
      id: nounCardId(n, plural), form: plural ? "pl" : "sg", kind: "Noun", heading: `Noun · ${label(n)}`, it, en, level: n.level,
    });
    return f.plural ? [card(false, f.singular, f.enSingular), card(true, f.plural, f.enPlural)] : [card(false, f.singular, f.enSingular)];
  });
}
