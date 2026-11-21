// The German word groups: the list the navigation, the training and the tests
// read from (same shape as src/lang/it/groups.js, which explains the fields and
// how to add a group). German starts with the Basics; nouns, verbs, adjectives
// and adverbs follow.
import { BASICS_PAGES, BASICS_DIFFICULTY_TOPICS, basicsCards, basicsTopicOf } from "./basics.js";

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
];

export const groupById = (id) => GROUPS.find((g) => g.id === id);

/** The cards of every group, by group id. */
export function cardsByGroup() {
  return Object.fromEntries(GROUPS.map((g) => [g.id, g.cards()]));
}
