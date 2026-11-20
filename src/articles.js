// The article rules: which article a noun takes, from its gender, number and
// first letters. Used to check the examples on the Articles page, and later to
// give every noun its article.
//
//            masculine                            feminine
//   the      il · lo (z, s+consonant, gn, ps…)    la
//            l' (vowel or h)                      l' (vowel or h)
//   the pl.  i · gli (vowel, z, s+consonant…)      le
//   a, an    un · uno (z, s+consonant…)           una · un' (vowel)
//   some     di + the: del, dello, dell', della, dei, degli, delle

const VOWEL = /^[aeiouàèéìòùh]/i; // h too: l'hotel
// The "special" starts that take lo / uno / gli: z, s + consonant, gn, ps, pn, x, y.
const SPECIAL = /^(z|s[^aeiouàèéìòù]|gn|ps|pn|x|y)/i;

/** The definite article (the): il, lo, l', la, i, gli, le. */
export function definiteArticle(noun, gender, number = "sg") {
  if (gender === "f") return number === "pl" ? "le" : VOWEL.test(noun) ? "l'" : "la";
  if (number === "pl") return VOWEL.test(noun) || SPECIAL.test(noun) ? "gli" : "i";
  if (VOWEL.test(noun)) return "l'";
  return SPECIAL.test(noun) ? "lo" : "il";
}

/** The indefinite article (a, an): un, uno, una, un'. Singular only. */
export function indefiniteArticle(noun, gender) {
  if (gender === "f") return VOWEL.test(noun) ? "un'" : "una";
  return SPECIAL.test(noun) ? "uno" : "un";
}

const DI = { il: "del", lo: "dello", "l'": "dell'", la: "della", i: "dei", gli: "degli", le: "delle" };

/** The partitive (some): di + the definite article, merged (del, dello, ...). */
export function partitiveArticle(noun, gender, number = "sg") {
  return DI[definiteArticle(noun, gender, number)];
}

/** Article + noun, with no space after an apostrophe: "il libro", "l'amico", "un'amica". */
export const withArticle = (article, noun) => (article.endsWith("'") ? article + noun : `${article} ${noun}`);
