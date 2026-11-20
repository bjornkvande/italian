// Nouns: from dictionary/nouns.csv, in themes (one subpage each). You write the
// singular, its gender and its meaning; the article (src/articles.js) and the
// plurals, Italian and English, come from rules, with columns for exceptions.
//
// nouns.csv columns:
//   topic          which subpage (theme) it's on (see NOUN_PAGES)
//   noun           the singular (formaggio)
//   gender         m or f
//   english        its meaning, without "the" (cheese)
//   plural         only when the rules get it wrong (uomo → uomini);
//                  "-" when it's normally not used in the plural (il pane)
//   plural_gender  only when the plural changes gender (l'uovo → le uova: f)
//   en_plural      only when the English plural isn't regular (man → men)
//   level          beginner | intermediate
//   note           optional note on the page (*italic* and **bold** allowed)
import nounsCSV from "../dictionary/nouns.csv?raw";
import { parseCSV } from "./csv.js";
import { definiteArticle, withArticle } from "./articles.js";

export const NOUNS_CSV = nounsCSV;
export const nouns = parseCSV(nounsCSV);

// The subpages (nouns.html#id), in order.
export const NOUN_PAGES = [
  { id: "everyday", label: "Everyday", title: "Everyday nouns" },
  { id: "people", label: "People & family", title: "People and family" },
  { id: "home", label: "Home", title: "At home" },
  { id: "food", label: "Food & drink", title: "Food and drink" },
  { id: "city", label: "City & travel", title: "City and travel" },
];

const ACCENTED = /[àèéìòù]$/;
const VOWELS = "aeiouàèéìòù";

/**
 * The Italian plural by the rules:
 *   unchanged: an accented last vowel (città), a final consonant (bar, film),
 *     feminine -o (foto, moto), -i and -ie (crisi, serie)
 *   -o → -i (libro → libri); -co/-go → -chi/-ghi (parco → parchi) unless the
 *     dictionary says otherwise (amico → amici); -io → -i (negozio → negozi)
 *   -a: masculine → -i (problema → problemi); feminine → -e (casa → case),
 *     -ca/-ga → -che/-ghe (banca → banche), -cia/-gia → -ce/-ge after a
 *     consonant (arancia → arance), -cie/-gie after a vowel (camicia → camicie)
 *   -e → -i (chiave → chiavi)
 */
export function pluralOf(noun, gender) {
  const last = noun.at(-1);
  if (ACCENTED.test(noun) || !VOWELS.includes(last) || /(i|ie)$/.test(noun)) return noun;
  const stem = noun.slice(0, -1);
  if (last === "o") {
    if (gender === "f") return noun; // la foto, la moto
    if (/[cg]$/.test(stem)) return stem + "hi";
    if (stem.endsWith("i")) return stem; // negozio → negozi
    return stem + "i";
  }
  if (last === "a") {
    if (gender === "m") return stem + "i"; // il problema → i problemi
    if (/[cg]$/.test(stem)) return stem + "he";
    if (/[cg]i$/.test(stem)) return VOWELS.includes(stem.at(-3)) ? stem + "e" : stem.slice(0, -1) + "e";
    return stem + "e";
  }
  return stem + "i"; // -e
}

/** The English plural by the rules: -es after s/x/z/ch/sh, -ies after a consonant + y, else -s. */
export function englishPlural(word) {
  if (/(s|x|z|ch|sh)$/.test(word)) return word + "es";
  if (/[^aeiou]y$/.test(word)) return word.slice(0, -1) + "ies";
  return word + "s";
}

/**
 * Everything a noun shows: { singular: "il formaggio", plural: "i formaggi" or
 * null, enSingular: "the cheese", enPlural: "the cheeses" or null, irregular }.
 * `irregular` means the plural comes from the dictionary instead of the rules.
 */
export function nounForms(n) {
  const singular = withArticle(definiteArticle(n.noun, n.gender, "sg"), n.noun);
  if (n.plural === "-") return { singular, plural: null, enSingular: `the ${n.english}`, enPlural: null, irregular: false };
  const pl = n.plural || pluralOf(n.noun, n.gender);
  const plGender = n.plural_gender || n.gender;
  return {
    singular,
    plural: withArticle(definiteArticle(pl, plGender, "pl"), pl),
    enSingular: `the ${n.english}`,
    enPlural: `the ${n.en_plural || englishPlural(n.english)}`,
    irregular: Boolean(n.plural || n.plural_gender),
  };
}

/** Card ids: "nouns.formaggio" (singular) and "nouns.formaggio.pl" (plural). */
export const nounCardId = (n, plural = false) => `nouns.${n.noun}${plural ? ".pl" : ""}`;

/**
 * Cards: the singular with its article, and the plural as its own card.
 * form is "sg" or "pl"; with `level` and `irregular` it decides the difficulty.
 */
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
