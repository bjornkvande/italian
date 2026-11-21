// The French word groups: the list the navigation, the training and the tests
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
    description: "Pronouns, être, avoir, articles, numbers, greetings…",
    storageKey: "fr.basicsPage",
    pages: BASICS_PAGES.map((p) => ({ id: p.id, href: `basics.html#${p.id}`, label: p.label })),
    cards: () => basicsCards(),
    difficulties: {
      beginner: { description: "Pronouns, greetings, être, avoir, le/la/un/une, numbers, days", include: inTopics("beginner") },
      intermediate: { description: "+ object pronouns, possessives, du/de la, prepositions, questions, small words, months", include: inTopics("intermediate") },
      advanced: { description: "Everything, + y and en, reflexive verbs, au/du…, telling the time, ordinals", include: null },
    },
  },
  {
    id: "adjectives",
    name: "Adjectives",
    description: "Common adjectives and their forms",
    storageKey: "fr.adjectivesPage",
    pages: ADJECTIVE_PAGES.map((p) => ({ id: p.id, href: `adjectives.html#${p.id}`, label: p.label })),
    cards: () => adjectiveCards(),
    difficulties: {
      beginner: { description: "Base form (grand)", include: formIn(["base"]) },
      intermediate: { description: "+ feminine (grande)", include: formIn(["base", "fsg"]) },
      advanced: { description: "All forms, + plurals (grands, grandes)", include: null },
    },
  },
  {
    id: "adverbs",
    name: "Adverbs",
    description: "Common adverbs: how, how much, when, opinion",
    storageKey: "fr.adverbsPage",
    pages: ADVERB_PAGES.map((p) => ({ id: p.id, href: `adverbs.html#${p.id}`, label: p.label })),
    cards: () => adverbCards(),
    difficulties: {
      beginner: { description: "The most common (bien, très, peut-être…)", include: formIn(["beginner"]) },
      intermediate: { description: "+ more common ones (-ment, d'habitude, en fait…)", include: formIn(["beginner", "intermediate"]) },
      advanced: { description: "All of them (autrefois, à peine, d'ailleurs…)", include: null },
    },
  },
  {
    id: "nouns",
    name: "Nouns",
    description: "Everyday nouns with le/la, by theme",
    storageKey: "fr.nounsPage",
    pages: NOUN_PAGES.map((p) => ({ id: p.id, href: `nouns.html#${p.id}`, label: p.label })),
    cards: () => nounCards(),
    difficulties: {
      beginner: { description: "The most common nouns, with le/la", include: (c) => c.form === "sg" && c.level === "beginner" },
      intermediate: { description: "All nouns, + regular plurals", include: (c) => c.form === "sg" || !c.irregular },
      advanced: { description: "All nouns and plurals", include: null },
    },
  },
  {
    id: "verbs",
    name: "Verbs",
    description: "Présent, passé composé, imparfait, futur, conditionnel",
    storageKey: "fr.verbPage",
    pages: [
      { id: "er", href: "er.html", label: "-er" },
      { id: "ir", href: "ir.html", label: "-ir" },
      { id: "re", href: "re.html", label: "-re" },
      { id: "irregular", href: "irregular.html", label: "Irregular" },
    ],
    cards: () => verbs.flatMap(cardsFor),
    difficulties: {
      beginner: { description: "Infinitives", include: formIn(["infinitif"]) },
      intermediate: { description: "Infinitives + présent + passé composé (the spoken past)", include: formIn(["infinitif", "present", "passe"]) },
      advanced: { description: "All tenses", include: null },
    },
  },
];

export const groupById = (id) => GROUPS.find((g) => g.id === id);

/** The cards of every group, by group id. */
export function cardsByGroup() {
  return Object.fromEntries(GROUPS.map((g) => [g.id, g.cards()]));
}
