// The word groups of the app: the one list that the navigation, the training
// and the tests read from.
//
// Each group has:
//   id          short name used in code ("verbs")
//   name        the tab in the navigation ("Verbs")
//   description one line for the "what to practise" menu on the Train screen
//   storageKey  where the subpage you used last is remembered
//   pages       its subpages: { id, href, label } (label = tab in the second row)
//   cards()     all its flash cards, as { id, tenseKey, tense, it, en }
//   difficulties  for beginner / intermediate / advanced: a description for the
//               level menu and which cards it includes (include: null = all)
//
// Adding a word group (e.g. nouns):
//   1. dictionary/<group>.csv with the words, and a module that turns the rows
//      into cards (like src/basics.js), with stable card ids
//   2. an HTML page per subpage, or one page with #subpages (like basics.html),
//      and a renderer built from src/page-helpers.js (tables, notes, colours)
//   3. an entry below, with its difficulties
//   4. tests for the data (tests/groups.test.js already checks the entry)
// Vite picks up every *.html file in the project folder by itself.
import { verbs } from "./csv.js";
import { cardsFor } from "./conjugate.js";
import { BASICS_PAGES, BASICS_DIFFICULTY_TOPICS, basicsCards, basicsTopicOf } from "./basics.js";
import { ADJECTIVE_PAGES, allAdjectiveCards } from "./adjectives.js";

// Card filters for the difficulties.
const formIn = (keys) => (card) => keys.includes(card.tenseKey);
const inTopics = (difficulty) => (card) => BASICS_DIFFICULTY_TOPICS[difficulty].includes(basicsTopicOf(card));

export const GROUPS = [
  {
    id: "basics",
    name: "Basics",
    description: "Pronouns, essere, avere, numbers, greetings…",
    storageKey: "verbi.basicsPage",
    pages: BASICS_PAGES.map((p) => ({ id: p.id, href: `basics.html#${p.id}`, label: p.label })),
    cards: () => basicsCards(),
    difficulties: {
      beginner: { description: "Pronouns, greetings, essere, avere, numbers, days", include: inTopics("beginner") },
      intermediate: { description: "+ object pronouns, questions, prepositions, possessives, small words, months", include: inTopics("intermediate") },
      advanced: { description: "Everything, + ci, ne and combined pronouns", include: null },
    },
  },
  {
    id: "adjectives",
    name: "Adjectives",
    description: "Common adjectives and their forms",
    storageKey: "verbi.adjectivesPage",
    pages: ADJECTIVE_PAGES.map((p) => ({ id: p.id, href: `adjectives.html#${p.id}`, label: p.label })),
    cards: () => allAdjectiveCards(),
    difficulties: {
      beginner: { description: "Base form (rosso)", include: formIn(["base"]) },
      intermediate: { description: "+ feminine singular (rossa)", include: formIn(["base", "fsg"]) },
      advanced: { description: "All forms, + plurals (rossi, rosse)", include: null },
    },
  },
  {
    id: "verbs",
    name: "Verbs",
    description: "Regular and irregular verbs, every tense",
    storageKey: "verbi.verbPage",
    pages: [
      { id: "are", href: "are.html", label: "-are" },
      { id: "ere", href: "ere.html", label: "-ere" },
      { id: "ire", href: "ire.html", label: "-ire" },
      { id: "irregular", href: "irregular.html", label: "Irregular" },
    ],
    cards: () => verbs.flatMap(cardsFor),
    difficulties: {
      beginner: { description: "Infinitives", include: formIn(["infinito"]) },
      intermediate: { description: "Infinitives + presente", include: formIn(["infinito", "presente"]) },
      advanced: { description: "All tenses", include: null },
    },
  },
];

export const groupById = (id) => GROUPS.find((g) => g.id === id);

/** The cards of every group, by group id: { basics: [...], verbs: [...] }. */
export function cardsByGroup() {
  return Object.fromEntries(GROUPS.map((g) => [g.id, g.cards()]));
}
