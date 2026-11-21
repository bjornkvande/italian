// German conjugation rules and English translations, used by the flash cards
// and the verb pages. Weak verbs come entirely from the rules; strong verbs
// give their changed stems (dictionary/de/verbs-irregular.csv); the auxiliary
// and modal verbs list every form (verbs-modal.csv).
import { thirdPerson } from "../../core/english.js";

// Column order in the tables.
export const TENSES = [
  ["praesens", "Präsens"],
  ["perfekt", "Perfekt"],
  ["praeteritum", "Präteritum"],
  ["konjunktiv", "Konjunktiv II"],
  ["imperativ", "Imperativ"],
];
const TENSE_NAME = { infinitiv: "Infinitiv", ...Object.fromEntries(TENSES) };

export const PRONOUNS = ["ich", "du", "er/sie/es", "wir", "ihr", "sie"];
const EN_PRONOUNS = ["I", "you", "he/she/it", "we", "you all", "they"];
export const HABEN = ["habe", "hast", "hat", "haben", "habt", "haben"];
export const SEIN = ["bin", "bist", "ist", "sind", "seid", "sind"];
export const WUERDE = ["würde", "würdest", "würde", "würden", "würdet", "würden"];

// The imperative has three forms: du, ihr and the polite Sie. In the tables
// they sit in the du, ihr and sie rows.
export const IMPERATIV_PERSONS = [1, 4, 5];

const listed = (value) => (value ? value.split(";") : null);

/** The verb without its separable prefix: anrufen → rufen. */
export const baseOf = (verb) => (verb.prefix ? verb.infinitive.slice(verb.prefix.length) : verb.infinitive);

/** The stem: rufen → ruf, wandern → wander, tun → tu. */
export const stemOf = (infinitive) => (infinitive.endsWith("en") ? infinitive.slice(0, -2) : infinitive.slice(0, -1));

/** An e is added before -st and -t after a stem in -t/-d, or a consonant + m/n (arbeitest, öffnet). */
export function needsE(stem) {
  return /[td]$/.test(stem) || /chn$|chm$/.test(stem) || /[^lrhmnaeiouäöüy][mn]$/.test(stem);
}
const sibilant = (stem) => /(s|ß|z|x)$/.test(stem);
const inseparable = (base) => /^(be|ver|er|ent|emp|ge|zer|miss)/.test(base) || base.endsWith("ieren");
const withPrefix = (verb, form) => (verb.prefix ? `${form} ${verb.prefix}` : form);

function presentForms(verb) {
  const base = baseOf(verb);
  const s = stemOf(base);
  const s2 = verb.stem2 || null;
  const e = needsE(s);
  const ich = base.endsWith("eln") ? s.slice(0, -2) + "le" : s + "e";
  const du = s2 ? s2 + (sibilant(s2) ? "t" : "st") : e ? s + "est" : sibilant(s) ? s + "t" : s + "st";
  const er = s2 ? (s2.endsWith("t") ? s2 : s2 + "t") : e ? s + "et" : s + "t";
  const plural = base.endsWith("en") ? s + "en" : base; // wir and sie: wandern, tun
  const ihr = e ? s + "et" : s + "t";
  return [ich, du, er, plural, ihr, plural];
}

function pastForms(verb) {
  const base = baseOf(verb);
  if (!verb.past) { // weak: stem + -te
    const s = stemOf(base);
    const p = s + (needsE(s) ? "ete" : "te");
    return [p, p + "st", p, p + "n", p + "t", p + "n"];
  }
  const p = verb.past;
  if (p.endsWith("te")) return [p, p + "st", p, p + "n", p + "t", p + "n"]; // mixed: brachte, dachte
  const td = /[td]$/.test(p);
  const plural = p.endsWith("e") ? p + "n" : p + "en";
  return [p, p + (td || sibilant(p) ? "est" : "st"), p, plural, p + (td ? "et" : "t"), plural];
}

/** The Partizip II: gemacht, gearbeitet, besucht, studiert, eingekauft, or as listed (gesprochen). */
export function participle(verb) {
  if (verb.participle) return verb.participle;
  const base = baseOf(verb);
  const s = stemOf(base);
  const core = s + (needsE(s) ? "et" : "t");
  return (verb.prefix ?? "") + (inseparable(base) ? core : "ge" + core);
}

function imperativeDu(verb) {
  const base = baseOf(verb);
  const s = stemOf(base);
  // e → i/ie verbs use the changed stem (sprich!, lies!); a → ä verbs don't (fahr!).
  if (verb.stem2 && /i/.test(verb.stem2) && !/i/.test(s)) return verb.stem2;
  if (base.endsWith("eln")) return s.slice(0, -2) + "le";
  if (needsE(s) || base.endsWith("ern")) return s + "e";
  return s;
}

/**
 * One form without its pronoun: form(verb, "praesens", 1) → "rufst an".
 * Perfekt: "habe angerufen"; imperativ (persons 1, 4, 5): "ruf an", "ruft an",
 * "rufen Sie an". null when the verb has no such form.
 */
export function form(verb, tense, person) {
  const i = person;
  if (verb.group === "modal") {
    if (tense === "perfekt") return verb.participle ? `${(verb.auxiliary === "sein" ? SEIN : HABEN)[i]} ${verb.participle}` : null;
    if (tense === "imperativ") {
      const forms = listed(verb.imperativ);
      return forms ? forms[IMPERATIV_PERSONS.indexOf(i)] ?? null : null;
    }
    return listed(verb[tense])?.[i] ?? null;
  }
  switch (tense) {
    case "praesens": return withPrefix(verb, presentForms(verb)[i]);
    case "praeteritum": return withPrefix(verb, pastForms(verb)[i]);
    case "perfekt": return perfekt(verb, i);
    case "konjunktiv": return `${WUERDE[i]} ${verb.infinitive}`;
    case "imperativ": {
      if (verb.impersonal || verb.imperativ === "no" || !IMPERATIV_PERSONS.includes(i)) return null;
      if (i === 1) return withPrefix(verb, imperativeDu(verb));
      if (i === 4) return withPrefix(verb, presentForms(verb)[4]);
      return withPrefix(verb, `${presentForms(verb)[3]} Sie`);
    }
  }
  return null;
}

/** Perfekt without the pronoun: "habe gemacht", "bin gegangen", "bin / habe gefahren". */
export function perfekt(verb, person, both = " / ") {
  const part = verb.group === "modal" ? verb.participle : participle(verb);
  if (!part) return null;
  const aux = verb.auxiliary === "sein" ? [SEIN] : verb.auxiliary === "haben" ? [HABEN] : [SEIN, HABEN];
  return `${aux.map((a) => a[person]).join(both)} ${part}`;
}

// English: "I speak", "he/she/it speaks", "I spoke", "I would speak".
function english(verb, tense, person) {
  const subject = verb.impersonal ? "it" : EN_PRONOUNS[person];
  switch (tense) {
    case "praesens": {
      const irregular = listed(verb.en_presente)?.[person];
      return `${subject} ${irregular ?? (verb.impersonal || person === 2 ? thirdPerson(verb.en_base) : verb.en_base)}`;
    }
    case "perfekt":
    case "praeteritum": {
      const past = listed(verb.en_past);
      return `${subject} ${past.length === 6 ? past[person] : past[0]}`;
    }
    case "konjunktiv":
      return `${subject} ${verb.en_konjunktiv || `would ${verb.en_base}`}`;
  }
  return null;
}

const IMPERATIV_EN = { 1: (v) => `${v}!`, 4: (v) => `${v}! (you all)`, 5: (v) => `${v}! (polite)` };

/** The id of a verb card: "machen.infinitiv", "machen.praesens.1" (tense + person 0–5). */
export function verbCardId(infinitive, tense, person = null) {
  return person === null ? `${infinitive}.${tense}` : `${infinitive}.${tense}.${person}`;
}

// Every card for one verb: { id, form, kind, heading, it, en } (it: the German).
// form is the tense, which the difficulties filter on.
export function cardsFor(verb) {
  const cards = [];
  const add = (tense, person, it, en) =>
    cards.push({ id: verbCardId(verb.infinitive, tense, person), form: tense, kind: "Verb", heading: `Verb · ${TENSE_NAME[tense]}`, it, en });

  add("infinitiv", null, verb.infinitive, `to ${verb.en_base}`);
  // Impersonal verbs (regnen) only have the es form.
  const persons = verb.impersonal ? [2] : [0, 1, 2, 3, 4, 5];
  for (const [tense] of TENSES.filter(([t]) => t !== "imperativ")) {
    for (const p of persons) {
      const f = form(verb, tense, p);
      if (f) add(tense, p, `${verb.impersonal ? "es" : PRONOUNS[p]} ${f}`, english(verb, tense, p));
    }
  }
  if (!verb.impersonal) {
    for (const p of IMPERATIV_PERSONS) {
      const f = form(verb, "imperativ", p);
      if (f) add("imperativ", p, `${p === 5 ? "" : `(${PRONOUNS[p]}) `}${f}!`, IMPERATIV_EN[p](verb.en_base));
    }
  }
  return cards;
}
