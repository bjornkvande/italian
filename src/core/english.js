// English word forms for the English side of the cards, shared by every language.

/** English present for he/she/it: "speaks", "grows up", "studies", "watches", "goes". */
export function thirdPerson(base) {
  const [first, ...rest] = base.split(" ");
  let word;
  if (/(s|sh|ch|x|z|o)$/.test(first)) word = first + "es";
  else if (/[^aeiou]y$/.test(first)) word = first.slice(0, -1) + "ies";
  else word = first + "s";
  return [word, ...rest].join(" ");
}

/** The English plural by the rules: -es after s/x/z/ch/sh, -ies after a consonant + y, else -s. */
export function englishPlural(word) {
  if (/(s|x|z|ch|sh)$/.test(word)) return word + "es";
  if (/[^aeiou]y$/.test(word)) return word.slice(0, -1) + "ies";
  return word + "s";
}

const IRREGULAR_COMPARISON = {
  good: ["better", "best"], bad: ["worse", "worst"], far: ["further", "furthest"],
  much: ["more", "most"], many: ["more", "most"], little: ["less", "least"], shy: ["shyer", "shyest"],
};

// Syllables, roughly: groups of vowels, not counting a silent final e (nice, but simple).
const syllables = (word) => (word.match(/[aeiouy]+/g) ?? []).length - (/[^aeiouyl]e$/.test(word) ? 1 : 0);

/**
 * The English comparative and superlative of one adjective: big → [bigger, biggest],
 * happy → [happier, happiest], interesting → [more interesting, most interesting].
 */
export function englishComparison(adjective) {
  const [word, ...rest] = adjective.split(" "); // "light (not heavy)": compare the first word
  const tail = rest.length ? " " + rest.join(" ") : "";
  if (IRREGULAR_COMPARISON[word]) return IRREGULAR_COMPARISON[word].map((f) => f + tail);
  const n = syllables(word);
  let stem = null;
  if (n === 1) {
    if (word.endsWith("e")) stem = word.slice(0, -1);
    else if (/[^aeiou]y$/.test(word)) stem = word.slice(0, -1) + "i";
    else if (/[^aeiou][aeiou][^aeiouwxy]$/.test(word)) stem = word + word.at(-1); // big → bigg-
    else stem = word;
  } else if (n === 2 && /[^aeiou]y$/.test(word)) stem = word.slice(0, -1) + "i"; // happy → happi-
  else if (n === 2 && word.endsWith("le")) stem = word.slice(0, -1); // simple → simpl-
  if (stem === null) return [`more ${word}${tail}`, `most ${word}${tail}`];
  return [`${stem}er${tail}`, `${stem}est${tail}`];
}
