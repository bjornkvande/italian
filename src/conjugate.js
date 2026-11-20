// Italian conjugation rules and English translations for the flash cards.
// The Italian rules mirror scripts/generate.py, so the cards match the .md tables.

const TENSES = {
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

const PARTICIPLE_ENDING = { "are": "ato", "ere": "uto", "ire-dormire": "ito", "ire-finire": "ito" };

export const TENSE_NAMES = {
  presente: "Presente",
  passato: "Passato prossimo",
  imperfetto: "Imperfetto",
  futuro: "Futuro",
  condizionale: "Condizionale",
  imperativo: "Imperativo",
};

const IT_PRONOUNS = ["io", "tu", "lui/lei", "noi", "voi", "loro"];
const EN_PRONOUNS = ["I", "you", "he/she", "we", "you all", "they"];
const AVERE = ["ho", "hai", "ha", "abbiamo", "avete", "hanno"];
const ESSERE = ["sono", "sei", "è", "siamo", "siete", "sono"];

// Imperativo: tu, Lei (polite), noi, voi. The Loro form is left out (rare in speech).
const IMPERATIVO_PERSONS = [
  { index: 1, it: "(tu)", en: (v) => `${v}!` },
  { index: 2, it: "(Lei)", en: (v) => `${v}! (polite)` },
  { index: 3, it: "(noi)", en: (v) => `let's ${v}!` },
  { index: 4, it: "(voi)", en: (v) => `${v}! (you all)` },
];

const stem = (inf) => inf.slice(0, -3);

// Stem + ending, with the -are spelling adjustments (cerchi, mangerò, studi).
function join(verb, ending) {
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

function participle(verb) {
  if (verb.participle) return verb.participle;
  const s = stem(verb.infinitive);
  if (verb.group === "ere" && s.endsWith("c")) return s + "iuto";
  return s + PARTICIPLE_ENDING[verb.group];
}

function passatoProssimo(verb, person) {
  const base = participle(verb).slice(0, -1);
  const withAvere = `${AVERE[person]} ${base}o`;
  const agreement = verb.impersonal ? "o" : person < 3 ? "o/a" : "i/e";
  const withEssere = `${ESSERE[person]} ${base}${agreement}`;
  if (verb.auxiliary === "avere") return withAvere;
  if (verb.auxiliary === "essere") return withEssere;
  return `${withAvere} / ${withEssere}`;
}

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

// Every card for one verb: { tense, it, en }.
export function cardsFor(verb) {
  const cards = [];
  const endings = TENSES[verb.group];
  // Impersonal verbs (piovere) only use the lui/lei form, without a pronoun.
  const persons = verb.impersonal ? [2] : [0, 1, 2, 3, 4, 5];

  for (const tense of ["presente", "passato", "imperfetto", "futuro", "condizionale"]) {
    for (const p of persons) {
      const form = tense === "passato" ? passatoProssimo(verb, p) : join(verb, endings[tense][p]);
      const it = verb.impersonal ? form : `${IT_PRONOUNS[p]} ${form}`;
      cards.push({ tense: TENSE_NAMES[tense], it, en: english(verb, tense, p) });
    }
  }

  if (!verb.impersonal) {
    for (const { index, it, en } of IMPERATIVO_PERSONS) {
      cards.push({
        tense: TENSE_NAMES.imperativo,
        it: `${it} ${join(verb, endings.imperativo[index])}!`,
        en: en(verb.en_base),
      });
    }
  }
  return cards;
}
