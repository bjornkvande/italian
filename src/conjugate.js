// Italian conjugation rules and English translations.
// Used by both the flash cards and the -are/-ere/-ire reference pages.

export const ENDINGS = {
  "are": {
    presente: ["o", "i", "a", "iamo", "ate", "ano"],
    imperfetto: ["avo", "avi", "ava", "avamo", "avate", "avano"],
    futuro: ["erò", "erai", "erà", "eremo", "erete", "eranno"],
    condizionale: ["erei", "eresti", "erebbe", "eremmo", "ereste", "erebbero"],
    imperativo: [null, "a", "i", "iamo", "ate", "ino"],
  },
  "ere": {
    presente: ["o", "i", "e", "iamo", "ete", "ono"],
    imperfetto: ["evo", "evi", "eva", "evamo", "evate", "evano"],
    futuro: ["erò", "erai", "erà", "eremo", "erete", "eranno"],
    condizionale: ["erei", "eresti", "erebbe", "eremmo", "ereste", "erebbero"],
    imperativo: [null, "i", "a", "iamo", "ete", "ano"],
  },
  "ire-dormire": {
    presente: ["o", "i", "e", "iamo", "ite", "ono"],
    imperfetto: ["ivo", "ivi", "iva", "ivamo", "ivate", "ivano"],
    futuro: ["irò", "irai", "irà", "iremo", "irete", "iranno"],
    condizionale: ["irei", "iresti", "irebbe", "iremmo", "ireste", "irebbero"],
    imperativo: [null, "i", "a", "iamo", "ite", "ano"],
  },
  "ire-finire": {
    presente: ["isco", "isci", "isce", "iamo", "ite", "iscono"],
    imperfetto: ["ivo", "ivi", "iva", "ivamo", "ivate", "ivano"],
    futuro: ["irò", "irai", "irà", "iremo", "irete", "iranno"],
    condizionale: ["irei", "iresti", "irebbe", "iremmo", "ireste", "irebbero"],
    imperativo: [null, "isci", "isca", "iamo", "ite", "iscano"],
  },
};

export const PARTICIPLE_ENDING = { "are": "ato", "ere": "uto", "ire-dormire": "ito", "ire-finire": "ito" };
const GERUND_ENDING = { "are": "ando", "ere": "endo", "ire-dormire": "endo", "ire-finire": "endo" };

// Column order in the tables.
export const TENSES = [
  ["presente", "Presente"],
  ["passato", "Passato prossimo"],
  ["imperfetto", "Imperfetto"],
  ["futuro", "Futuro"],
  ["condizionale", "Condizionale"],
  ["imperativo", "Imperativo"],
];
const TENSE_NAME = { infinito: "Infinito", ...Object.fromEntries(TENSES) };

export const PRONOUNS = ["io", "tu", "lui/lei", "noi", "voi", "loro"];
const EN_PRONOUNS = ["I", "you", "he/she", "we", "you all", "they"];
export const AVERE = ["ho", "hai", "ha", "abbiamo", "avete", "hanno"];
const ESSERE = ["sono", "sei", "è", "siamo", "siete", "sono"];

const stem = (inf) => inf.slice(0, -3);

// Stem + ending, with the -are spelling adjustments (cerchi, mangerò, studi).
export function join(verb, ending) {
  const inf = verb.infinitive;
  const s = stem(inf);
  if (verb.group !== "are") return s + ending;
  if (/(c|g)are$/.test(inf) && "ei".includes(ending[0])) return s + "h" + ending;
  if (s.endsWith("i")) {
    if (ending[0] === "i") return s.slice(0, -1) + ending;
    if (ending[0] === "e" && "cg".includes(s.at(-2))) return s.slice(0, -1) + ending;
  }
  return s + ending;
}

export function participle(verb) {
  if (verb.participle) return verb.participle;
  const s = stem(verb.infinitive);
  if (verb.group === "ere" && s.endsWith("c")) return s + "iuto"; // conosciuto
  return s + PARTICIPLE_ENDING[verb.group];
}

export function gerund(verb) {
  return stem(verb.infinitive) + GERUND_ENDING[verb.group];
}

// "ho parlato", "sono arrivato/a", or both joined by `separator` for avere/essere verbs.
export function passatoProssimo(verb, person, separator = " · ") {
  const base = participle(verb).slice(0, -1);
  const withAvere = `${AVERE[person]} ${base}o`;
  // "it rained" (piovere) has no subject to agree with: è piovuto.
  const agreement = verb.impersonal && person === 2 ? "o" : person < 3 ? "o/a" : "i/e";
  const withEssere = `${ESSERE[person]} ${base}${agreement}`;
  if (verb.auxiliary === "avere") return withAvere;
  if (verb.auxiliary === "essere") return withEssere;
  return `${withAvere}${separator}${withEssere}`;
}

// One form; null where it doesn't exist (imperativo io).
export function form(verb, tense, person) {
  if (tense === "passato") return passatoProssimo(verb, person);
  const ending = ENDINGS[verb.group][tense][person];
  return ending === null ? null : join(verb, ending);
}

// The note about -are spelling changes, or "" if there is none.
export function spellingNote(verb) {
  const inf = verb.infinitive;
  if (verb.group !== "are") return "";
  if (/(c|g)are$/.test(inf)) return "-care/-gare: adds **h** before *e*/*i* to keep the hard sound";
  if (/(ci|gi)are$/.test(inf)) return "-ciare/-giare: drops the **i** before *e*/*i*";
  if (/iare$/.test(inf)) return `-iare: no double **i** (*tu ${join(verb, "i")}*, not *${stem(inf)}i*)`;
  return "";
}

// ---------------------------------------------------------------- flash cards

// Imperativo: tu, Lei (polite), noi, voi. The Loro form is left out (rare in speech).
const IMPERATIVO_PERSONS = [
  { index: 1, it: "(tu)", en: (v) => `${v}!` },
  { index: 2, it: "(Lei)", en: (v) => `${v}! (polite)` },
  { index: 3, it: "(noi)", en: (v) => `let's ${v}!` },
  { index: 4, it: "(voi)", en: (v) => `${v}! (you all)` },
];

// English present: "he/she speaks", "grows up", "studies", "watches".
function thirdPerson(base) {
  const [first, ...rest] = base.split(" ");
  let word;
  if (/(s|sh|ch|x|z|o)$/.test(first)) word = first + "es";
  else if (/[^aeiou]y$/.test(first)) word = first.slice(0, -1) + "ies";
  else word = first + "s";
  return [word, ...rest].join(" ");
}

function english(verb, tense, person) {
  const base = verb.en_base;
  const subject = verb.impersonal ? "it" : EN_PRONOUNS[person];
  switch (tense) {
    case "presente":
      return `${subject} ${verb.impersonal || person === 2 ? thirdPerson(base) : base}`;
    case "passato":
      return `${subject} ${verb.en_past}`;
    case "imperfetto":
      return `${subject} used to ${base}`;
    case "futuro":
      return `${subject} will ${base}`;
    case "condizionale":
      return `${subject} would ${base}`;
  }
}

// Every card for one verb: { id, tenseKey, tense, it, en }.
// The id ("parlare.presente.1") stays the same as long as the verb, tense and
// person do, so stored ratings keep pointing at the right card.
// tenseKey (infinito, presente, passato, ...) is what the difficulty levels filter on.
export function cardsFor(verb) {
  const cards = [];
  const add = (id, tenseKey, it, en) =>
    cards.push({ id: `${verb.infinitive}.${id}`, tenseKey, tense: TENSE_NAME[tenseKey], it, en });

  add("infinito", "infinito", verb.infinitive, `to ${verb.en_base}`);

  // Impersonal verbs (piovere) only use the lui/lei form, without a pronoun.
  const persons = verb.impersonal ? [2] : [0, 1, 2, 3, 4, 5];
  for (const tense of ["presente", "passato", "imperfetto", "futuro", "condizionale"]) {
    for (const p of persons) {
      const f = tense === "passato" ? passatoProssimo(verb, p, " / ") : form(verb, tense, p);
      const it = verb.impersonal ? f : `${PRONOUNS[p]} ${f}`;
      add(`${tense}.${p}`, tense, it, english(verb, tense, p));
    }
  }

  if (!verb.impersonal) {
    for (const { index, it, en } of IMPERATIVO_PERSONS) {
      add(`imperativo.${index}`, "imperativo", `${it} ${form(verb, "imperativo", index)}!`, en(verb.en_base));
    }
  }
  return cards;
}
