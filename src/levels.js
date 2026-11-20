// Levels for the flash cards, and remembering the chosen one.
// Basics is its own set of cards (src/basics.js); the other levels are verb
// cards, each including the one before it.

export const LEVELS = [
  { id: "basics", name: "Basics", description: "Pronouns, essere, avere, prepositions, numbers…", deck: "basics" },
  { id: "beginner", name: "Beginner", description: "Infinitives", tenses: ["infinito"] },
  { id: "intermediate", name: "Intermediate", description: "Infinitives + presente", tenses: ["infinito", "presente"] },
  { id: "advanced", name: "Advanced", description: "All tenses", tenses: null }, // every card
];

export const DEFAULT_LEVEL = "beginner";
export const STORAGE_KEY = "verbi.level";

const byId = (id) => LEVELS.find((l) => l.id === id);

/** The cards that belong to a level: verb cards, or the Basics cards for Basics. */
export function cardsForLevel(verbCards, levelId, basicsCards = []) {
  const level = byId(levelId) ?? byId(DEFAULT_LEVEL);
  if (level.deck === "basics") return basicsCards;
  return level.tenses ? verbCards.filter((c) => level.tenses.includes(c.tenseKey)) : verbCards;
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
