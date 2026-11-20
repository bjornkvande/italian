// The word groups of the app: the one list that the navigation, the training
// and the tests read from.
//
// Each group has:
//   id          short name used in code ("verbs")
//   name        the tab in the navigation ("Verbs")
//   storageKey  where the subpage you used last is remembered
//   pages       its subpages: { id, href, label } (label = tab in the second row)
//   cards()     all its flash cards, as { id, tenseKey, tense, it, en }
//
// Adding a word group (e.g. nouns):
//   1. dictionary/<group>.csv with the words, and a module that turns the rows
//      into cards (like src/basics.js), with stable card ids
//   2. an HTML page per subpage, or one page with #subpages (like basics.html),
//      and a renderer built from src/page-helpers.js (tables, notes, colours)
//   3. an entry below, and a level in src/levels.js to practise it
//   4. tests for the data (tests/groups.test.js already checks the entry)
// Vite picks up every *.html file in the project folder by itself.
import { verbs } from "./csv.js";
import { cardsFor } from "./conjugate.js";
import { BASICS_PAGES, basicsCards } from "./basics.js";
import { ADJECTIVE_PAGES, allAdjectiveCards } from "./adjectives.js";

export const GROUPS = [
  {
    id: "basics",
    name: "Basics",
    storageKey: "verbi.basicsPage",
    pages: BASICS_PAGES.map((p) => ({ id: p.id, href: `basics.html#${p.id}`, label: p.label })),
    cards: () => basicsCards(),
  },
  {
    id: "adjectives",
    name: "Adjectives",
    storageKey: "verbi.adjectivesPage",
    pages: ADJECTIVE_PAGES.map((p) => ({ id: p.id, href: `adjectives.html#${p.id}`, label: p.label })),
    cards: () => allAdjectiveCards(),
  },
  {
    id: "verbs",
    name: "Verbs",
    storageKey: "verbi.verbPage",
    pages: [
      { id: "are", href: "are.html", label: "-are" },
      { id: "ere", href: "ere.html", label: "-ere" },
      { id: "ire", href: "ire.html", label: "-ire" },
      { id: "irregular", href: "irregular.html", label: "Irregular" },
    ],
    cards: () => verbs.flatMap(cardsFor),
  },
];

export const groupById = (id) => GROUPS.find((g) => g.id === id);

/** The cards of every group, by group id: { basics: [...], verbs: [...] }. */
export function cardsByGroup() {
  return Object.fromEntries(GROUPS.map((g) => [g.id, g.cards()]));
}
