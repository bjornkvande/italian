// The Basics: pronouns, essere/avere, prepositions, numbers and other small
// everyday words, from dictionary/basics.csv.
//
// basics.csv columns:
//   topic    one of the topic ids below; decides where the row appears
//   italian  the Italian side of the card (io, del, ho fame)
//   english  the other side (I, di + il, I am hungry)
//   note     optional note on the Basics page (*italic* and **bold** allowed)
//
// The presente of essere and avere isn't in basics.csv: it comes from
// verbs-irregular.csv (topics with `verb`), so those forms exist only once,
// and share their ratings with the verb cards.
import basicsCSV from "../dictionary/basics.csv?raw";
import { parseCSV, verbs } from "./csv.js";
import { cardsFor } from "./conjugate.js";

// Page and card order. `verb`: include that verb's presente before the rows.
export const TOPICS = [
  { id: "pronouns", title: "Subject pronouns" },
  { id: "essere", title: "Essere – to be", verb: "essere" },
  { id: "avere", title: "Avere – to have", verb: "avere" },
  { id: "prepositions", title: "Prepositions" },
  { id: "articulated", title: "Prepositions + article" },
  { id: "questions", title: "Question words" },
  { id: "possessives", title: "Possessives" },
  { id: "demonstratives", title: "This and that" },
  { id: "connectors", title: "Small connecting words" },
  { id: "time", title: "Time words" },
  { id: "time-units", title: "Units of time" },
  { id: "numbers", title: "Numbers" },
  { id: "ordinals", title: "Ordinal numbers" },
  { id: "days", title: "Days of the week" },
  { id: "months", title: "Months" },
  { id: "seasons", title: "Seasons" },
  { id: "greetings", title: "Greetings and courtesy" },
];

// The subpages of the Basics page (basics.html#id), each with its topics.
// Every topic belongs to exactly one subpage.
export const BASICS_PAGES = [
  { id: "pronouns", label: "Pronouns", topics: ["pronouns", "possessives"] },
  { id: "greetings", label: "Greetings", topics: ["greetings"] },
  { id: "essere", label: "Essere", topics: ["essere"] },
  { id: "avere", label: "Avere", topics: ["avere"] },
  { id: "prepositions", label: "Prepositions", topics: ["prepositions", "articulated"] },
  { id: "questions", label: "Questions", topics: ["questions"] },
  { id: "small-words", label: "Small words", topics: ["demonstratives", "connectors", "time", "time-units"] },
  { id: "numbers", label: "Numbers & dates", topics: ["numbers", "ordinals", "days", "months", "seasons"] },
];

export const BASICS_CSV = basicsCSV;
export const basicsRows = parseCSV(basicsCSV);

/** The id of a Basics card: "basics.pronouns.io". The Basics page uses it to colour rows. */
export function basicsCardId(topicId, italian) {
  return `basics.${topicId}.${italian}`;
}

/** The presente cards of a verb (io sono = I am, ...). */
export function presenteCards(infinitive, allVerbs = verbs) {
  const verb = allVerbs.find((v) => v.infinitive === infinitive);
  if (!verb) throw new Error(`${infinitive} is not in the verb dictionary`);
  return cardsFor(verb).filter((c) => c.tenseKey === "presente");
}

/** The cards of one topic, in order. */
export function topicCards(topic, rows = basicsRows, allVerbs = verbs) {
  const fromVerb = topic.verb ? presenteCards(topic.verb, allVerbs) : [];
  const fromRows = rows
    .filter((r) => r.topic === topic.id)
    .map((r) => ({
      id: basicsCardId(topic.id, r.italian),
      tenseKey: "basics",
      tense: topic.title,
      it: r.italian,
      en: r.english,
    }));
  return [...fromVerb, ...fromRows];
}

/** All Basics cards: every topic, in order. */
export function basicsCards(rows = basicsRows, allVerbs = verbs) {
  return TOPICS.flatMap((t) => topicCards(t, rows, allVerbs));
}
