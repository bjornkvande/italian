// German Basics: pronouns, sein/haben, articles and cases, prepositions,
// numbers and other small everyday words, from dictionary/de/basics.csv.
// Within each topic the most used words come first.
//
// basics.csv columns:
//   topic    one of the topic ids below; decides where the row appears
//   german   the German side of the card (ich, den Mann, Ich habe Hunger.)
//   english  the other side (I, the man (accusative), I'm hungry.)
//   note     optional note on the Basics page (*italic* and **bold** allowed)
//
// Card ids: "basics.<topic>.<german>" (basics.pronouns.ich). German ratings are
// stored under their own keys (de.ratings), so they never mix with Italian.
//
// The Präsens of sein and haben isn't in basics.csv: it comes from the verbs
// (topics with `verb`), so those forms exist once and share their ratings with
// the verb cards.
import basicsCSV from "../../../dictionary/de/basics.csv?raw";
import { parseCSV } from "../../core/csv.js";
import { verbs } from "./verbs.js";
import { cardsFor } from "./conjugate.js";

// Page and card order. kind: the heading on a card's German side; heading: on
// its English side. intro: a short explanation above the topic's table.
export const TOPICS = [
  { id: "pronouns", title: "Subject pronouns", kind: "Pronoun", heading: "Pronoun · subject" },
  { id: "accusative-pronouns", title: "Accusative pronouns: mich, dich, ihn…", kind: "Pronoun", heading: "Pronoun · accusative",
    intro: "For the direct object: *mich, dich, ihn, sie, es, uns, euch, sie, Sie*." },
  { id: "dative-pronouns", title: "Dative pronouns: mir, dir, ihm…", kind: "Pronoun", heading: "Pronoun · dative",
    intro: "For *to someone*, and after verbs like *helfen, danken, gefallen*: *mir, dir, ihm, ihr, ihm, uns, euch, ihnen, Ihnen*." },
  { id: "reflexive", title: "Reflexive pronouns", kind: "Pronoun", heading: "Pronoun · reflexive",
    intro: "Like the accusative pronouns, except *sich* for *er, sie, es, sie* and *Sie*. Many everyday verbs are reflexive: *sich freuen, sich setzen, sich treffen*." },
  { id: "possessives", title: "Possessives", kind: "Possessive", heading: "Possessive" },
  { id: "greetings", title: "Greetings and courtesy", kind: "Greeting", heading: "Greeting · courtesy" },
  { id: "yes-no", title: "Yes, no and not", kind: "Small word", heading: "Small word · yes, no, not" },
  { id: "sein", title: "Sein – to be", verb: "sein", kind: "Verb", heading: "Verb · Präsens" },
  { id: "sein-phrases", title: "Phrases with sein", kind: "Phrase", heading: "Phrase · with sein" },
  { id: "haben", title: "Haben – to have", verb: "haben", kind: "Verb", heading: "Verb · Präsens" },
  { id: "haben-phrases", title: "Phrases with haben", kind: "Phrase", heading: "Phrase · with haben" },
  { id: "definite", title: "The: der, die, das", kind: "Article", heading: "Article · the",
    intro: "Every noun is masculine (*der*), feminine (*die*) or neuter (*das*), so learn the article with the noun. The plural is always *die*. These are the forms for the subject (the nominative); below, how they change with the case." },
  { id: "indefinite", title: "A, an: ein, eine; no: kein", kind: "Article", heading: "Article · a, an, no",
    intro: "*ein* for masculine and neuter, *eine* for feminine; there is no plural *a*. *kein* (no, not a) changes the same way and has a plural, *keine*." },
  { id: "accusative", title: "The accusative: den, einen", kind: "Article", heading: "Article · accusative",
    intro: "The direct object is in the accusative. Only the masculine changes: *der → den*, *ein → einen*, *kein → keinen*. Feminine, neuter and plural stay as they are." },
  { id: "dative", title: "The dative: dem, der, den", kind: "Article", heading: "Article · dative",
    intro: "For *to someone*, and after *mit, von, zu, bei, nach, aus, seit*: *der/das → dem*, *die → der*, plural *die → den* + *-n* on the noun; *ein → einem*, *eine → einer*. (The genitive, *des Mannes*, is mostly written; in speech *von* + dative is used.)" },
  { id: "prep-acc", title: "Prepositions with the accusative", kind: "Preposition", heading: "Preposition · + accusative",
    intro: "Always followed by the accusative: *für dich*, *ohne mich*, *durch den Park*." },
  { id: "prep-dat", title: "Prepositions with the dative", kind: "Preposition", heading: "Preposition · + dative",
    intro: "Always followed by the dative: *mit dem Bus*, *bei mir*, *nach der Arbeit*." },
  { id: "prep-two", title: "Two-way prepositions", kind: "Preposition", heading: "Preposition · two-way",
    intro: "Dative for where something is (*Ich bin in der Stadt*), accusative for where it goes (*Ich gehe in die Stadt*)." },
  { id: "contractions", title: "Preposition + article", kind: "Preposition", heading: "Preposition + article",
    intro: "A preposition and *dem*, *der* or *das* often merge into one word." },
  { id: "place", title: "Place words", kind: "Place word", heading: "Place word" },
  { id: "questions", title: "Question words", kind: "Question word", heading: "Question word",
    intro: "In a question the verb comes second, right after the question word: *Wo wohnst du?*" },
  { id: "demonstratives", title: "This and that", kind: "Demonstrative", heading: "Demonstrative" },
  { id: "indefinites", title: "Some, all and none", kind: "Indefinite", heading: "Indefinite · some, all, none" },
  { id: "connectors", title: "Small connecting words", kind: "Connecting word", heading: "Connecting word",
    intro: "*und, aber, oder, denn, sondern* keep the normal word order; *weil, dass, wenn, ob, als* send the verb to the end of the clause." },
  { id: "time", title: "Time words", kind: "Time word", heading: "Time word" },
  { id: "time-units", title: "Units of time", kind: "Time word", heading: "Time word · unit" },
  { id: "clock", title: "Telling the time", kind: "Time", heading: "Time · clock",
    intro: "*halb* counts towards the next hour: *halb vier* = 3:30. In timetables and the news the 24-hour clock is used: *fünfzehn Uhr dreißig* = 15:30." },
  { id: "numbers", title: "Numbers", kind: "Number", heading: "Number" },
  { id: "ordinals", title: "Ordinal numbers", kind: "Number", heading: "Number · ordinal" },
  { id: "days", title: "Days of the week", kind: "Day", heading: "Day of the week" },
  { id: "months", title: "Months", kind: "Month", heading: "Month" },
  { id: "seasons", title: "Seasons", kind: "Season", heading: "Season" },
];

// The subpages of the Basics page (de/basics.html#id), each with its topics.
// Every topic belongs to exactly one subpage.
export const BASICS_PAGES = [
  { id: "pronouns", label: "Pronouns", topics: ["pronouns", "accusative-pronouns", "dative-pronouns", "reflexive", "possessives"] },
  { id: "greetings", label: "Greetings", topics: ["greetings", "yes-no"] },
  { id: "sein", label: "Sein", topics: ["sein", "sein-phrases"] },
  { id: "haben", label: "Haben", topics: ["haben", "haben-phrases"] },
  { id: "articles", label: "Articles & cases", topics: ["definite", "indefinite", "accusative", "dative"] },
  { id: "prepositions", label: "Prepositions & place", topics: ["prep-acc", "prep-dat", "prep-two", "contractions", "place"] },
  { id: "questions", label: "Questions", topics: ["questions"] },
  { id: "small-words", label: "Small words", topics: ["demonstratives", "indefinites", "connectors", "time", "time-units"] },
  { id: "numbers", label: "Numbers & time", topics: ["numbers", "ordinals", "clock", "days", "months", "seasons"] },
];

// Which topics each difficulty practises (null = all of them).
const BEGINNER_TOPICS = ["pronouns", "greetings", "yes-no", "sein", "sein-phrases", "haben", "haben-phrases",
  "definite", "indefinite", "numbers", "days"];
export const BASICS_DIFFICULTY_TOPICS = {
  beginner: BEGINNER_TOPICS,
  intermediate: [...BEGINNER_TOPICS, "accusative", "dative", "accusative-pronouns", "dative-pronouns", "possessives",
    "prep-acc", "prep-dat", "prep-two", "place", "questions", "demonstratives", "indefinites", "connectors",
    "time", "months", "seasons"],
  advanced: null, // + reflexive, contractions, units of time, clock, ordinals
};

export const BASICS_CSV = basicsCSV;
export const basicsRows = parseCSV(basicsCSV);

/** The id of a Basics card: "basics.pronouns.ich". The Basics page uses it to colour rows. */
export const basicsCardId = (topicId, german) => `basics.${topicId}.${german}`;

/** The topic of a Basics card: "basics.days.Montag" → days; "sein.praesens.0" → sein. */
export function basicsTopicOf(card) {
  const [first, second] = card.id.split(".");
  return first === "basics" ? second : first;
}

/** The Präsens cards of a verb (ich bin = I am, ...). */
export function presentCards(infinitive) {
  const verb = verbs.find((v) => v.infinitive === infinitive);
  if (!verb) throw new Error(`${infinitive} is not in the verb dictionary`);
  return cardsFor(verb).filter((c) => c.form === "praesens");
}

/** The cards of one topic, in order. `it` is the German side (see src/core/train.js). */
export function topicCards(topic, rows = basicsRows) {
  if (topic.verb) return presentCards(topic.verb);
  return rows.filter((r) => r.topic === topic.id).map((r) => ({
    id: basicsCardId(topic.id, r.german),
    form: "basics",
    kind: topic.kind,
    heading: topic.heading,
    it: r.german,
    en: r.english,
  }));
}

/** All Basics cards: every topic, in order. */
export function basicsCards(rows = basicsRows) {
  return TOPICS.flatMap((t) => topicCards(t, rows));
}
