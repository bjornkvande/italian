// The Basics: pronouns, essere/avere, prepositions, numbers and other small
// everyday words, from dictionary/it/basics.csv.
//
// basics.csv columns:
//   topic    one of the topic ids below; decides where the row appears
//   italian  the Italian side of the card (io, del, ho fame)
//   english  the other side (I, di + il, I am hungry)
//   note     optional note on the Basics page (*italic* and **bold** allowed)
//
// articles.csv holds the articles with an example noun (lo zaino = the
// backpack). Columns: topic, italian, english, noun, gender (m/f), number
// (sg/pl), note. tests/it/articles.test.js checks each article against the rules
// in src/lang/it/articles.js.
//
// pronouns.csv holds the object, reflexive and stressed pronouns as example
// phrases, since a pronoun only makes sense in a sentence. Columns: topic, pronoun (lo), meaning (him, it (m.)), italian
// (lo vedo), english (I see him), note. Each phrase is a card like the rows above.
//
// The presente of essere and avere isn't in basics.csv: it comes from
// verbs-irregular.csv (topics with `verb`), so those forms exist only once,
// and share their ratings with the verb cards.
import basicsCSV from "../../../dictionary/it/basics.csv?raw";
import pronounsCSV from "../../../dictionary/it/pronouns.csv?raw";
import articlesCSV from "../../../dictionary/it/articles.csv?raw";
import { parseCSV } from "../../core/csv.js";
import { verbs } from "./verbs.js";
import { cardsFor } from "./conjugate.js";

// Page and card order. `verb`: include that verb's presente before the rows.
export const TOPICS = [
  // kind: the heading on a card's Italian side; heading: on its English side.
  { id: "pronouns", title: "Subject pronouns", kind: "Pronoun", heading: "Pronoun · subject" },
  { id: "direct", title: "Direct object pronouns", pronouns: true, kind: "Pronoun", heading: "Pronoun · direct object" },
  { id: "indirect", title: "Indirect object pronouns", pronouns: true, kind: "Pronoun", heading: "Pronoun · indirect object" },
  { id: "reflexive", title: "Reflexive pronouns", pronouns: true, kind: "Pronoun", heading: "Pronoun · reflexive" },
  { id: "stressed", title: "Stressed pronouns (after prepositions)", pronouns: true, kind: "Pronoun", heading: "Pronoun · stressed" },
  { id: "definite", title: "The: il, lo, l', la, i, gli, le", kind: "Article", heading: "Article · the",
    intro: "Masculine: *il*; *lo* before *z*, *s* + consonant, *gn*, *ps*, *y*; *l'* before a vowel. Plural *i* and *gli*. Feminine: *la*, *l'* before a vowel, plural *le*." },
  { id: "indefinite", title: "A, an: un, uno, una, un'", kind: "Article", heading: "Article · a, an",
    intro: "Masculine: *un*, and *uno* where *the* would be *lo*. Feminine: *una*, and *un'* before a vowel." },
  { id: "partitive", title: "Some: del, dello, della, dei…", kind: "Article", heading: "Article · some",
    intro: "*Some* is *di* + the definite article, merged like the prepositions: *del, dello, dell', della, dei, degli, delle*." },
  { id: "essere", title: "Essere – to be", verb: "essere", kind: "Phrase", heading: "Phrase · with essere" },
  { id: "avere", title: "Avere – to have", verb: "avere", kind: "Phrase", heading: "Phrase · with avere" },
  { id: "prepositions", title: "Prepositions", kind: "Preposition", heading: "Preposition" },
  { id: "articulated", title: "Prepositions + article", kind: "Preposition", heading: "Preposition + article" },
  { id: "place", title: "Place words", kind: "Place word", heading: "Place word" },
  { id: "questions", title: "Question words", kind: "Question word", heading: "Question word" },
  { id: "possessives", title: "Possessives", kind: "Possessive", heading: "Possessive" },
  { id: "demonstratives", title: "This and that", kind: "Demonstrative", heading: "Demonstrative" },
  { id: "indefinites", title: "Some, all and none", kind: "Indefinite", heading: "Indefinite · some, all, none" },
  { id: "connectors", title: "Small connecting words", kind: "Connecting word", heading: "Connecting word" },
  { id: "time", title: "Time words", kind: "Time word", heading: "Time word" },
  { id: "time-units", title: "Units of time", kind: "Time word", heading: "Time word · unit" },
  { id: "numbers", title: "Numbers", kind: "Number", heading: "Number" },
  { id: "ordinals", title: "Ordinal numbers", kind: "Number", heading: "Number · ordinal" },
  { id: "days", title: "Days of the week", kind: "Day", heading: "Day of the week" },
  { id: "months", title: "Months", kind: "Month", heading: "Month" },
  { id: "seasons", title: "Seasons", kind: "Season", heading: "Season" },
  { id: "greetings", title: "Greetings and courtesy", kind: "Greeting", heading: "Greeting · courtesy" },
];

// The subpages of the Basics page (basics.html#id), each with its topics.
// Every topic belongs to exactly one subpage.
export const BASICS_PAGES = [
  { id: "pronouns", label: "Pronouns", topics: ["pronouns", "direct", "indirect", "reflexive", "stressed", "possessives"] },
  { id: "greetings", label: "Greetings", topics: ["greetings"] },
  { id: "essere", label: "Essere", topics: ["essere"] },
  { id: "avere", label: "Avere", topics: ["avere"] },
  { id: "articles", label: "Articles", topics: ["definite", "indefinite", "partitive"] },
  { id: "prepositions", label: "Prepositions & place", topics: ["prepositions", "articulated", "place"] },
  { id: "questions", label: "Questions", topics: ["questions"] },
  { id: "small-words", label: "Small words", topics: ["demonstratives", "indefinites", "connectors", "time", "time-units"] },
  { id: "numbers", label: "Numbers & dates", topics: ["numbers", "ordinals", "days", "months", "seasons"] },
];

// Which topics each difficulty practises (null = all of them).
const BEGINNER_TOPICS = ["pronouns", "greetings", "definite", "indefinite", "essere", "avere", "numbers", "days"];
export const BASICS_DIFFICULTY_TOPICS = {
  beginner: BEGINNER_TOPICS,
  intermediate: [...BEGINNER_TOPICS, "direct", "indirect", "reflexive", "stressed",
    "questions", "prepositions", "place", "partitive", "possessives", "demonstratives", "indefinites", "connectors", "time", "months", "seasons"],
  advanced: null,
};

/** The topic a Basics card belongs to: "basics.days.lunedì" → days; "essere.presente.0" → essere. */
export function basicsTopicOf(card) {
  const [first, second] = card.id.split(".");
  return first === "basics" ? second : first;
}

export const BASICS_CSV = basicsCSV;
export const PRONOUNS_CSV = pronounsCSV;
export const pronounRows = parseCSV(pronounsCSV);
export const ARTICLES_CSV = articlesCSV;
export const articleRows = parseCSV(articlesCSV);
// All Basics rows: the words, then the pronoun phrases and the articles. Each row is one card.
export const basicsRows = [...parseCSV(basicsCSV), ...pronounRows, ...articleRows];

/** The id of a Basics card: "basics.pronouns.io". The Basics page uses it to colour rows. */
export function basicsCardId(topicId, italian) {
  return `basics.${topicId}.${italian}`;
}

/** The presente cards of a verb (io sono = I am, ...). */
export function presenteCards(infinitive, allVerbs = verbs) {
  const verb = allVerbs.find((v) => v.infinitive === infinitive);
  if (!verb) throw new Error(`${infinitive} is not in the verb dictionary`);
  return cardsFor(verb).filter((c) => c.form === "presente");
}

/** The cards of one topic, in order. */
export function topicCards(topic, rows = basicsRows, allVerbs = verbs) {
  const fromVerb = topic.verb ? presenteCards(topic.verb, allVerbs) : [];
  const fromRows = rows
    .filter((r) => r.topic === topic.id)
    .map((r) => ({
      id: basicsCardId(topic.id, r.italian),
      form: "basics",
      kind: topic.kind,
      heading: topic.heading,
      it: r.italian,
      en: r.english,
    }));
  return [...fromVerb, ...fromRows];
}

/** All Basics cards: every topic, in order. */
export function basicsCards(rows = basicsRows, allVerbs = verbs) {
  return TOPICS.flatMap((t) => topicCards(t, rows, allVerbs));
}
