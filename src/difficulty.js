// Difficulty for the flash cards: Beginner, Intermediate or Advanced, chosen
// per word group. What you practise is chosen in the Train tab's second row
// (src/nav.js); each group says what the difficulties mean for its cards
// (`difficulties` in src/groups.js).

export const DIFFICULTIES = [
  { id: "beginner", name: "Beginner" },
  { id: "intermediate", name: "Intermediate" },
  { id: "advanced", name: "Advanced" },
];

export const DEFAULT_DIFFICULTY = "beginner";
export const STORAGE_KEY = "verbi.difficulty"; // { basics: "beginner", verbs: "advanced", ... }
const OLD_LEVEL_KEY = "verbi.level"; // before what and how hard were split
const TRAIN_GROUP_KEY = "verbi.trainGroup"; // what you practise (managed by src/nav.js)

const isDifficulty = (id) => DIFFICULTIES.some((d) => d.id === id);

/** The cards of a group at a difficulty. `group` is an entry of src/groups.js. */
export function cardsForDifficulty(cards, group, difficultyId) {
  const { include } = group.difficulties[isDifficulty(difficultyId) ? difficultyId : DEFAULT_DIFFICULTY];
  return include ? cards.filter(include) : cards;
}

function readAll(storage) {
  try {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY));
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

/** The difficulty chosen for a group, or the default. */
export function loadDifficulty(groupId, storage = globalThis.localStorage) {
  const saved = readAll(storage)[groupId];
  return isDifficulty(saved) ? saved : DEFAULT_DIFFICULTY;
}

export function saveDifficulty(groupId, difficultyId, storage = globalThis.localStorage) {
  if (!isDifficulty(difficultyId)) throw new Error(`Unknown difficulty: ${difficultyId}`);
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...readAll(storage), [groupId]: difficultyId }));
  } catch {
    // Blocked storage: just not remembered.
  }
}

/**
 * Carry over the old single level ("basics", "adjectives", "beginner", ...)
 * the first time: it becomes what you practise and, for verbs, the difficulty.
 * Does nothing once the new settings exist.
 */
export function migrateOldLevel(storage = globalThis.localStorage) {
  try {
    const old = storage.getItem(OLD_LEVEL_KEY);
    if (old === null || storage.getItem(TRAIN_GROUP_KEY) !== null) return;
    if (old === "basics" || old === "adjectives") {
      storage.setItem(TRAIN_GROUP_KEY, old);
    } else if (isDifficulty(old)) {
      storage.setItem(TRAIN_GROUP_KEY, "verbs");
      saveDifficulty("verbs", old, storage);
    }
  } catch {
    // Blocked storage: nothing to carry over.
  }
}
