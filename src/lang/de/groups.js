// The German word groups: the list the navigation, the training and the tests
// read from (same shape as src/lang/it/groups.js, which explains the fields and
// how to add a group).
import { BASICS_PAGES, BASICS_DIFFICULTY_TOPICS, basicsCards, basicsTopicOf } from "./basics.js";
import { ADJECTIVE_PAGES, adjectiveCards } from "./adjectives.js";
import { ADVERB_PAGES, adverbCards } from "./adverbs.js";
import { NOUN_PAGES, nounCards } from "./nouns.js";
import { verbs } from "./verbs.js";
import { cardsFor } from "./conjugate.js";

const formIn = (forms) => (card) => forms.includes(card.form);
const inTopics = (difficulty) => (card) => BASICS_DIFFICULTY_TOPICS[difficulty].includes(basicsTopicOf(card));

export const GROUPS = [
  {
    id: "basics",
    name: "Basics",
    description: "Pronouns, sein, haben, articles, numbers, greetings…",
    storageKey: "de.basicsPage",
    pages: BASICS_PAGES.map((p) => ({ id: p.id, href: `basics.html#${p.id}`, label: p.label })),
    cards: () => basicsCards(),
    difficulties: {
      beginner: { description: "Pronouns, greetings, sein, haben, der/die/das, ein/kein, numbers, days", include: inTopics("beginner") },
      intermediate: { description: "+ cases, object pronouns, possessives, prepositions, questions, small words, months", include: inTopics("intermediate") },
      advanced: { description: "Everything, + reflexive pronouns, zum/im/am…, telling the time, ordinals", include: null },
    },
  },
  {
    id: "adjectives",
    name: "Adjectives",
    description: "Common adjectives and their comparison",
    storageKey: "de.adjectivesPage",
    pages: ADJECTIVE_PAGES.map((p) => ({ id: p.id, href: `adjectives.html#${p.id}`, label: p.label })),
    cards: () => adjectiveCards(),
    difficulties: {
      beginner: { description: "Base form (groß)", include: formIn(["base"]) },
      intermediate: { description: "+ comparative (größer)", include: formIn(["base", "comp"]) },
      advanced: { description: "+ superlative (am größten)", include: null },
    },
  },
  {
    id: "adverbs",
    name: "Adverbs",
    description: "Common adverbs: how, how much, when, opinion",
    storageKey: "de.adverbsPage",
    pages: ADVERB_PAGES.map((p) => ({ id: p.id, href: `adverbs.html#${p.id}`, label: p.label })),
    cards: () => adverbCards(),
    difficulties: {
      beginner: { description: "The most common (gern, sehr, vielleicht…)", include: formIn(["beginner"]) },
      intermediate: { description: "+ more common ones (ziemlich, meistens, hoffentlich…)", include: formIn(["beginner", "intermediate"]) },
      advanced: { description: "All of them (kaum, damals, tatsächlich…)", include: null },
    },
  },
  {
    id: "nouns",
    name: "Nouns",
    description: "Everyday nouns with der/die/das, by theme",
    storageKey: "de.nounsPage",
    pages: NOUN_PAGES.map((p) => ({ id: p.id, href: `nouns.html#${p.id}`, label: p.label })),
    cards: () => nounCards(),
    difficulties: {
      beginner: { description: "The most common nouns, with der/die/das", include: (c) => c.form === "sg" && c.level === "beginner" },
      intermediate: { description: "All nouns, + the plurals of the common ones", include: (c) => c.form === "sg" || c.level === "beginner" },
      advanced: { description: "All nouns and plurals", include: null },
    },
  },
  {
    id: "verbs",
    name: "Verbs",
    description: "Präsens, Perfekt, Präteritum, würde, imperative",
    storageKey: "de.verbPage",
    pages: [
      { id: "regular", href: "regular.html", label: "Regular" },
      { id: "irregular", href: "irregular.html", label: "Irregular" },
      { id: "separable", href: "separable.html", label: "Separable" },
      { id: "modal", href: "modal.html", label: "Modal" },
    ],
    cards: () => verbs.flatMap(cardsFor),
    difficulties: {
      beginner: { description: "Infinitives", include: formIn(["infinitiv"]) },
      intermediate: { description: "Infinitives + Präsens + Perfekt (the spoken past)", include: formIn(["infinitiv", "praesens", "perfekt"]) },
      advanced: { description: "All tenses", include: null },
    },
  },
];

export const groupById = (id) => GROUPS.find((g) => g.id === id);

/** The cards of every group, by group id. */
export function cardsByGroup() {
  return Object.fromEntries(GROUPS.map((g) => [g.id, g.cards()]));
}
