// Difficulty levels for the flash cards, and remembering the chosen one.

export const LEVELS = [
  { id: "beginner", name: "Beginner", description: "Infinitives", tenses: ["infinito"] },
  { id: "intermediate", name: "Intermediate", description: "Infinitives + presente", tenses: ["infinito", "presente"] },
  { id: "advanced", name: "Advanced", description: "All tenses", tenses: null }, // every card
];

export const DEFAULT_LEVEL = "beginner";
export const STORAGE_KEY = "verbi.level";

const byId = (id) => LEVELS.find((l) => l.id === id);

/** The cards that belong to a level. */
export function cardsForLevel(cards, levelId) {
  const { tenses } = byId(levelId) ?? byId(DEFAULT_LEVEL);
  return tenses ? cards.filter((c) => tenses.includes(c.tenseKey)) : cards;
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
