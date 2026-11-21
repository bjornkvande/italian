// French conjugation rules and English translations, used by the flash cards
// and the verb pages. Regular -er, -ir (finir) and -re (vendre) verbs come from
// the rules; irregular verbs list their present, future stem and participle
// (dictionary/fr/verbs-irregular.csv), and the rest follows from those.
import { thirdPerson } from "../../core/english.js";

// Column order in the tables.
export const TENSES = [
  ["present", "Présent"],
  ["passe", "Passé composé"],
  ["imparfait", "Imparfait"],
  ["futur", "Futur simple"],
  ["conditionnel", "Conditionnel"],
  ["imperatif", "Impératif"],
];
const TENSE_NAME = { infinitif: "Infinitif", ...Object.fromEntries(TENSES) };

export const PRONOUNS = ["je", "tu", "il/elle", "nous", "vous", "ils/elles"];
const EN_PRONOUNS = ["I", "you", "he/she", "we", "you all", "they"];
export const AVOIR = ["ai", "as", "a", "avons", "avez", "ont"];
export const ETRE = ["suis", "es", "est", "sommes", "êtes", "sont"];

export const ENDINGS = {
  er: { present: ["e", "es", "e", "ons", "ez", "ent"] },
  ir: { present: ["is", "is", "it", "issons", "issez", "issent"] },
  re: { present: ["s", "s", "", "ons", "ez", "ent"] },
  imparfait: ["ais", "ais", "ait", "ions", "iez", "aient"],
  futur: ["ai", "as", "a", "ons", "ez", "ont"],
  conditionnel: ["ais", "ais", "ait", "ions", "iez", "aient"],
};
export const PARTICIPLE_ENDING = { er: "é", ir: "i", re: "u" };

// The imperative has three forms: tu, nous and vous (rows 1, 3 and 4).
export const IMPERATIF_PERSONS = [1, 3, 4];
const SILENT = [0, 1, 2, 5]; // je, tu, il, ils: endings that aren't pronounced

const listed = (value) => (value ? value.split(";") : null);
const stem = (verb) => verb.infinitive.slice(0, -2);

/** "je" + form, or "j'" before a vowel or a silent h: j'aime, j'habite, j'ai parlé. */
export function withPronoun(person, form) {
  if (person === 0 && /^[aeiouyéèêâîôûœh]/i.test(form)) return `j'${form}`;
  return `${PRONOUNS[person]} ${form}`;
}

// Stem + ending for -er verbs: ç and ge before a and o (commençons, mangeons),
// and the changed stem before a silent ending (achète, appelle, préfère, paie).
function erForm(verb, ending, person) {
  let s = stem(verb);
  if (verb.stem2 && SILENT.includes(person) && ending.startsWith("e") && ending.length <= 3) s = verb.stem2;
  if (/^[ao]/.test(ending)) {
    if (s.endsWith("c")) s = s.slice(0, -1) + "ç";
    else if (s.endsWith("g")) s += "e";
  }
  return s + ending;
}

/** The present (without the pronoun): parle, finis, vends, or as listed. */
export function present(verb, person) {
  if (verb.group === "irregular") return listed(verb.present)[person] || null;
  if (verb.group === "er") return erForm(verb, ENDINGS.er.present[person], person);
  return stem(verb) + ENDINGS[verb.group].present[person];
}

/** The stem of the imparfait: the nous form of the present without -ons (finiss-, buv-), or as listed. */
function imparfaitStem(verb) {
  if (verb.imparfait) return verb.imparfait;
  const nous = present(verb, 3);
  return verb.group === "er" ? stem(verb) : nous.slice(0, -3);
}

/** The future and conditional stem: parler-, finir-, vendr-, achèter-, or as listed (ir-, ser-). */
function futureStem(verb) {
  if (verb.futur) return verb.futur;
  if (verb.group === "re") return verb.infinitive.slice(0, -1);
  if (verb.group === "er" && verb.stem2) {
    // é → è verbs keep é in the future (préférerai); the others use the changed stem (achèterai, paierai).
    const accentOnly = verb.stem2 === stem(verb).replace(/é([^é]*)$/, "è$1");
    return accentOnly ? verb.infinitive : verb.stem2 + "er";
  }
  return verb.infinitive;
}

/** The past participle: parlé, fini, vendu, or as listed. */
export function participle(verb) {
  return verb.participle || stem(verb) + PARTICIPLE_ENDING[verb.group];
}

/** The passé composé without the pronoun: "ai parlé", "suis allé(e)", "sommes allé(e)s". */
export function passeCompose(verb, person) {
  const part = participle(verb);
  if (verb.auxiliary !== "être") return `${AVOIR[person]} ${part}`;
  return `${ETRE[person]} ${part}(e)${person >= 3 ? "s" : ""}`;
}

/** The imperative for tu, nous, vous: parle, finissons, allez; null if not used. */
export function imperatif(verb, person) {
  if (verb.impersonal || verb.imperatif === "-" || !IMPERATIF_PERSONS.includes(person)) return null;
  const own = listed(verb.imperatif);
  if (own) return own[IMPERATIF_PERSONS.indexOf(person)];
  const p = present(verb, person);
  // tu: the present without the s when it ends in -es or -as (parle, ouvre, va).
  return person === 1 && /[ea]s$/.test(p) ? p.slice(0, -1) : p;
}

/** One form without the pronoun: form(verb, "futur", 3) → "parlerons". null when not used. */
export function form(verb, tense, person) {
  if (verb.impersonal && person !== 2) return null;
  switch (tense) {
    case "present": return present(verb, person);
    case "passe": return passeCompose(verb, person);
    case "imparfait": {
      const s = imparfaitStem(verb);
      const ending = ENDINGS.imparfait[person];
      return verb.group === "er" ? erForm(verb, ending, person) : s + ending;
    }
    case "futur": return futureStem(verb) + ENDINGS.futur[person];
    case "conditionnel": return futureStem(verb) + ENDINGS.conditionnel[person];
    case "imperatif": return imperatif(verb, person);
  }
  return null;
}

// English: "I speak", "he/she speaks", "I spoke", "I used to speak", "I will speak", "I would speak".
function english(verb, tense, person) {
  const base = verb.en_base;
  const subject = verb.impersonal ? "it" : EN_PRONOUNS[person];
  switch (tense) {
    case "present": {
      const irregular = listed(verb.en_present)?.[person];
      return `${subject} ${irregular || (verb.impersonal || person === 2 ? thirdPerson(base) : base)}`;
    }
    case "passe": {
      const past = listed(verb.en_past);
      return `${subject} ${past.length === 6 ? past[person] : past[0]}`;
    }
    case "imparfait": return `${subject} used to ${base}`;
    case "futur": return `${subject} will ${base}`;
    case "conditionnel": return `${subject} ${verb.en_conditional || `would ${base}`}`;
  }
  return null;
}

const IMPERATIF_EN = { 1: (v) => `${v}!`, 3: (v) => `let's ${v}!`, 4: (v) => `${v}! (you all, polite)` };
const NBSP = " "; // French puts a no-break space before ! and ?

/** The id of a verb card: "parler.infinitif", "parler.present.1" (tense + person 0–5). */
export function verbCardId(infinitive, tense, person = null) {
  return person === null ? `${infinitive}.${tense}` : `${infinitive}.${tense}.${person}`;
}

// Every card for one verb: { id, form, kind, heading, it, en } (it: the French).
// form is the tense, which the difficulties filter on.
export function cardsFor(verb) {
  const cards = [];
  const add = (tense, person, it, en) =>
    cards.push({ id: verbCardId(verb.infinitive, tense, person), form: tense, kind: "Verb", heading: `Verb · ${TENSE_NAME[tense]}`, it, en });

  add("infinitif", null, verb.infinitive, `to ${verb.en_base}`);
  // Impersonal verbs (il faut, il pleut) only have the il form.
  const persons = verb.impersonal ? [2] : [0, 1, 2, 3, 4, 5];
  for (const [tense] of TENSES.filter(([t]) => t !== "imperatif")) {
    for (const p of persons) {
      const f = form(verb, tense, p);
      if (f) add(tense, p, verb.impersonal ? `il ${f}` : withPronoun(p, f), english(verb, tense, p));
    }
  }
  for (const p of IMPERATIF_PERSONS) {
    const f = imperatif(verb, p);
    if (f) add("imperatif", p, `(${PRONOUNS[p]}) ${f}${NBSP}!`, IMPERATIF_EN[p](verb.en_base));
  }
  return cards;
}
