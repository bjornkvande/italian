// Levels for the flash cards, and remembering the chosen one.
// Each level practises the cards of one word group (src/groups.js), optionally
// only some tenses. The verb levels each include the one before.

export const LEVELS = [
  { id: "basics", name: "Basics", description: "Pronouns, essere, avere, prepositions, numbers…", group: "basics" },
  { id: "beginner", name: "Beginner", description: "Infinitives", group: "verbs", tenses: ["infinito"] },
  { id: "intermediate", name: "Intermediate", description: "Infinitives + presente", group: "verbs", tenses: ["infinito", "presente"] },
  { id: "advanced", name: "Advanced", description: "All tenses", group: "verbs" }, // every verb card
];

export const DEFAULT_LEVEL = "beginner";
export const STORAGE_KEY = "verbi.level";

const byId = (id) => LEVELS.find((l) => l.id === id);

/** The cards that belong to a level. `decks`: the cards per group, { basics: [...], verbs: [...] }. */
export function cardsForLevel(decks, levelId) {
  const level = byId(levelId) ?? byId(DEFAULT_LEVEL);
  const cards = decks[level.group] ?? [];
  return level.tenses ? cards.filter((c) => level.tenses.includes(c.tenseKey)) : cards;
}

/** The level saved in storage, or the default if none (or an unknown one) is saved. */
export function loadLevel(storage = globalThis.localStorage) {
  try {
    const saved = storage.getItem(STORAGE_KEY);
    if (byId(saved)) return saved;
  } catch {
    // Blocked storage: use the default.
  }
  return DEFAULT_LEVEL;
}

export function saveLevel(levelId, storage = globalThis.localStorage) {
  if (!byId(levelId)) throw new Error(`Unknown level: ${levelId}`);
  try {
    storage.setItem(STORAGE_KEY, levelId);
  } catch {
    // Blocked storage: the level just isn't remembered.
  }
}
