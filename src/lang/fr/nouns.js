// French nouns from dictionary/fr/nouns.csv, in themes (one subpage each), the
// most used first. Every noun is learned with its article: le, la, l'.
//
// nouns.csv columns:
//   topic      which subpage it's on (see NOUN_PAGES)
//   noun       the singular without the article (livre)
//   gender     m | f
//   plural     only if the plural isn't regular (travaux, yeux, grands-pères);
//              "-" when the noun is normally not used in the plural
//   english    the singular meaning, without "the" (book)
//   en_plural  only if the English plural isn't the regular one (feet)
//   level      beginner | intermediate: from which level it's practised
//   note       optional note on the page (*italic* and **bold** allowed)
// Nouns starting with h all have a silent h here (l'homme, l'hôtel).
import nounsCSV from "../../../dictionary/fr/nouns.csv?raw";
import { parseCSV } from "../../core/csv.js";
import { englishPlural } from "../../core/english.js";

export const NOUNS_CSV = nounsCSV;
export const nouns = parseCSV(nounsCSV);

// The subpages (fr/nouns.html#id), in order.
export const NOUN_PAGES = [
  { id: "everyday", label: "Everyday", title: "Everyday nouns" },
  { id: "people", label: "People & family", title: "People and family" },
  { id: "home", label: "Home", title: "At home" },
  { id: "food", label: "Food & drink", title: "Food and drink" },
  { id: "city", label: "City & travel", title: "City and travel" },
];

// Plurals in -x for these -al and -ou nouns are the exceptions to the rules below.
const AL_S = ["bal", "carnaval", "festival", "récital", "régal", "chacal"];
const OU_X = ["bijou", "caillou", "chou", "genou", "hibou", "joujou", "pou"];

/**
 * The French plural by the rules: unchanged after -s, -x, -z (bras, prix);
 * -au, -eau, -eu add -x (cadeaux, jeux); -al → -aux (hôpitaux); else -s.
 */
export function pluralOf(noun) {
  if (/[sxz]$/.test(noun)) return noun;
  if (/(au|eu)$/.test(noun)) return noun + "x";
  if (noun.endsWith("al") && !AL_S.includes(noun)) return noun.slice(0, -2) + "aux";
  if (OU_X.includes(noun)) return noun + "x";
  return noun + "s";
}

/** le, la, or l' before a vowel or a (silent) h. */
export const articleFor = (noun, gender) => (/^[aeiouyéèêâîôûœh]/i.test(noun) ? "l'" : gender === "m" ? "le " : "la ");

/** The noun's forms: { singular: "le livre", plural: "les livres" | null, enSingular, enPlural, irregular }. */
export function nounForms(n) {
  const plural = n.plural === "-" ? null : n.plural || pluralOf(n.noun);
  return {
    singular: articleFor(n.noun, n.gender) + n.noun,
    plural: plural ? `les ${plural}` : null,
    enSingular: `the ${n.english}`,
    enPlural: plural ? `the ${n.en_plural || englishPlural(n.english)}` : null,
    irregular: Boolean(n.plural && n.plural !== "-"),
  };
}

/** The card id: "nouns.livre", or "nouns.livre.pl" for the plural. */
export const nounCardId = (n, plural = false) => `nouns.${n.noun}${plural ? ".pl" : ""}`;

/** Cards: the singular with its article, and the plural as its own card. */
export function nounCards(rows = nouns) {
  const label = (n) => NOUN_PAGES.find((p) => p.id === n.topic).label;
  return NOUN_PAGES.flatMap((p) => rows.filter((n) => n.topic === p.id)).flatMap((n) => {
    const f = nounForms(n);
    const card = (plural, it, en) => ({
      id: nounCardId(n, plural), form: plural ? "pl" : "sg", kind: "Noun", heading: `Noun · ${label(n)}`,
      it, en, level: n.level, irregular: plural && f.irregular,
    });
    return f.plural ? [card(false, f.singular, f.enSingular), card(true, f.plural, f.enPlural)] : [card(false, f.singular, f.enSingular)];
  });
}
