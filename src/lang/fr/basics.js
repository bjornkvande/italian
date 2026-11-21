// French Basics: pronouns, être/avoir, articles, prepositions, numbers and
// other small everyday words, from dictionary/fr/basics.csv. Within each topic
// the most used words come first.
//
// basics.csv columns:
//   topic    one of the topic ids below; decides where the row appears
//   french   the French side of the card (je, du pain, J'ai faim.)
//   english  the other side (I, (some) bread, I'm hungry.)
//   note     optional note on the Basics page (*italic* and **bold** allowed)
// French puts a no-break space before ? and ! (Ça va ?).
//
// The présent of être and avoir isn't in basics.csv: it comes from the verbs
// (topics with `verb`), so those forms exist once and share their ratings with
// the verb cards. Card ids: "basics.<topic>.<french>"; French ratings are stored
// under their own keys (fr.ratings).
import basicsCSV from "../../../dictionary/fr/basics.csv?raw";
import { parseCSV } from "../../core/csv.js";
import { verbs } from "./verbs.js";
import { cardsFor } from "./conjugate.js";

// Page and card order. kind: the heading on a card's French side; heading: on
// its English side. intro: a short explanation above the topic's table.
export const TOPICS = [
  { id: "pronouns", title: "Subject pronouns", kind: "Pronoun", heading: "Pronoun · subject" },
  { id: "stressed", title: "Stressed pronouns: moi, toi, lui…", kind: "Pronoun", heading: "Pronoun · stressed" },
  { id: "direct", title: "Direct object pronouns", kind: "Pronoun", heading: "Pronoun · direct object",
    intro: "*me, te, le, la, nous, vous, les*, before the verb: *Je le vois.* = I see him." },
  { id: "indirect", title: "Indirect object pronouns", kind: "Pronoun", heading: "Pronoun · indirect object",
    intro: "For *to someone*: *me, te, lui, nous, vous, leur*: *Je lui parle.* = I'm talking to him (her)." },
  { id: "y-en", title: "Y and en", kind: "Pronoun", heading: "Pronoun · y, en",
    intro: "*y* replaces a place or *à* + a thing (there, to it); *en* replaces *de* + something (some, of it)." },
  { id: "reflexive", title: "Reflexive verbs", kind: "Pronoun", heading: "Pronoun · reflexive",
    intro: "*me, te, se, nous, vous, se* + the verb: *se lever* = to get up, *je me lève*. In the passé composé they take *être*: *je me suis levé*." },
  { id: "possessives", title: "Possessives", kind: "Possessive", heading: "Possessive" },
  { id: "greetings", title: "Greetings and courtesy", kind: "Greeting", heading: "Greeting · courtesy" },
  { id: "yes-no", title: "Yes, no and not", kind: "Small word", heading: "Small word · yes, no, not",
    intro: "The negation goes around the verb: *ne* before, *pas* (or *jamais, rien, plus, personne*) after. *ne* becomes *n'* before a vowel: *Je n'aime pas.*" },
  { id: "etre", title: "Être – to be", verb: "être", kind: "Verb", heading: "Verb · Présent" },
  { id: "etre-phrases", title: "Phrases with être", kind: "Phrase", heading: "Phrase · with être" },
  { id: "avoir", title: "Avoir – to have", verb: "avoir", kind: "Verb", heading: "Verb · Présent" },
  { id: "avoir-phrases", title: "Phrases with avoir", kind: "Phrase", heading: "Phrase · with avoir" },
  { id: "definite", title: "The: le, la, l', les", kind: "Article", heading: "Article · the",
    intro: "Every noun is masculine (*le*) or feminine (*la*); learn the article with the noun. *l'* before a vowel or a silent *h*, and *les* for every plural." },
  { id: "indefinite", title: "A, an: un, une, des", kind: "Article", heading: "Article · a, an",
    intro: "*un* (masculine), *une* (feminine), and *des* in the plural, where English has no article." },
  { id: "partitive", title: "Some: du, de la, des", kind: "Article", heading: "Article · some",
    intro: "For food and other things you don't count: *du* (masculine), *de la* (feminine), *de l'* before a vowel, *des* in the plural. After a negative just *de*." },
  { id: "contractions", title: "à and de + the article", kind: "Preposition", heading: "Preposition + article",
    intro: "*à* and *de* merge with *le* and *les*: *au, aux, du, des*. With *la* and *l'* they stay apart: *à la gare, de l'école*." },
  { id: "prepositions", title: "Prepositions", kind: "Preposition", heading: "Preposition" },
  { id: "place", title: "Place words", kind: "Place word", heading: "Place word",
    intro: "Before a noun most of them take *de*, shown in brackets: *près de la gare*, *à côté du cinéma*." },
  { id: "questions", title: "Question words", kind: "Question word", heading: "Question word",
    intro: "In speech the question word often goes at the end: *Tu vas où ?* More formal: *Où est-ce que tu vas ?* or *Où vas-tu ?*" },
  { id: "demonstratives", title: "This and that", kind: "Demonstrative", heading: "Demonstrative" },
  { id: "indefinites", title: "Some, all and none", kind: "Indefinite", heading: "Indefinite · some, all, none" },
  { id: "connectors", title: "Small connecting words", kind: "Connecting word", heading: "Connecting word" },
  { id: "time", title: "Time words", kind: "Time word", heading: "Time word" },
  { id: "time-units", title: "Units of time", kind: "Time word", heading: "Time word · unit" },
  { id: "clock", title: "Telling the time", kind: "Time", heading: "Time · clock",
    intro: "*Il est* + the hour + *heure(s)*, then the minutes: *trois heures dix*. *et quart, et demie, moins le quart* for the quarters." },
  { id: "numbers", title: "Numbers", kind: "Number", heading: "Number" },
  { id: "ordinals", title: "Ordinal numbers", kind: "Number", heading: "Number · ordinal" },
  { id: "days", title: "Days of the week", kind: "Day", heading: "Day of the week" },
  { id: "months", title: "Months", kind: "Month", heading: "Month" },
  { id: "seasons", title: "Seasons", kind: "Season", heading: "Season" },
];

// The subpages of the Basics page (fr/basics.html#id), each with its topics.
// Every topic belongs to exactly one subpage.
export const BASICS_PAGES = [
  { id: "pronouns", label: "Pronouns", topics: ["pronouns", "stressed", "direct", "indirect", "y-en", "reflexive", "possessives"] },
  { id: "greetings", label: "Greetings", topics: ["greetings", "yes-no"] },
  { id: "etre", label: "Être", topics: ["etre", "etre-phrases"] },
  { id: "avoir", label: "Avoir", topics: ["avoir", "avoir-phrases"] },
  { id: "articles", label: "Articles", topics: ["definite", "indefinite", "partitive"] },
  { id: "prepositions", label: "Prepositions & place", topics: ["prepositions", "contractions", "place"] },
  { id: "questions", label: "Questions", topics: ["questions"] },
  { id: "small-words", label: "Small words", topics: ["demonstratives", "indefinites", "connectors", "time", "time-units"] },
  { id: "numbers", label: "Numbers & time", topics: ["numbers", "ordinals", "clock", "days", "months", "seasons"] },
];

// Which topics each difficulty practises (null = all of them).
const BEGINNER_TOPICS = ["pronouns", "greetings", "yes-no", "etre", "etre-phrases", "avoir", "avoir-phrases",
  "definite", "indefinite", "numbers", "days"];
export const BASICS_DIFFICULTY_TOPICS = {
  beginner: BEGINNER_TOPICS,
  intermediate: [...BEGINNER_TOPICS, "stressed", "direct", "indirect", "possessives", "partitive", "prepositions",
    "place", "questions", "demonstratives", "indefinites", "connectors", "time", "months", "seasons"],
  advanced: null, // + y and en, reflexive verbs, au/du…, units of time, the clock, ordinals
};

export const BASICS_CSV = basicsCSV;
export const basicsRows = parseCSV(basicsCSV);

/** The id of a Basics card: "basics.pronouns.je". The Basics page uses it to colour rows. */
export const basicsCardId = (topicId, french) => `basics.${topicId}.${french}`;

/** The topic of a Basics card: "basics.days.lundi" → days; "être.present.0" → être. */
export function basicsTopicOf(card) {
  const [first, second] = card.id.split(".");
  if (first === "basics") return second;
  return TOPICS.find((t) => t.verb === first)?.id ?? first;
}

/** The présent cards of a verb (je suis = I am, ...). */
export function presentCards(infinitive) {
  const verb = verbs.find((v) => v.infinitive === infinitive);
  if (!verb) throw new Error(`${infinitive} is not in the verb dictionary`);
  return cardsFor(verb).filter((c) => c.form === "present");
}

/** The cards of one topic, in order. `it` is the French side (see src/core/train.js). */
export function topicCards(topic, rows = basicsRows) {
  if (topic.verb) return presentCards(topic.verb);
  return rows.filter((r) => r.topic === topic.id).map((r) => ({
    id: basicsCardId(topic.id, r.french), form: "basics", kind: topic.kind, heading: topic.heading, it: r.french, en: r.english,
  }));
}

/** All Basics cards: every topic, in order. */
export function basicsCards(rows = basicsRows) {
  return TOPICS.flatMap((t) => topicCards(t, rows));
}
