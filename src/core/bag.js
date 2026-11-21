// A "shuffle bag" for the flash cards: every card comes up once, in random
// order, before any card repeats. When the bag is empty it's filled with all
// the cards again and shaken (shuffled). The cards left in the bag are
// remembered per word group and level, so a reload continues the round.
//
// Stored under one key as JSON: { "<group>.<level>": [card ids left, ...] }

export const STORAGE_KEY = "verbi.bags";

/** A shuffled copy (Fisher–Yates). */
export function shuffle(list, random = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function readAll(storage) {
  try {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY));
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

/**
 * A bag for `cards` (objects with an `id`), remembered under `key`.
 * next() returns the next card.
 */
export function createBag(cards, key, { storage = globalThis.localStorage, random = Math.random } = {}) {
  const byId = new Map(cards.map((c) => [c.id, c]));
  // Continue a saved round, keeping only cards that still exist.
  let left = (readAll(storage)[key] ?? []).filter((id) => byId.has(id));
  let last = null;

  function save() {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify({ ...readAll(storage), [key]: left }));
    } catch {
      // Blocked storage: the round just isn't remembered.
    }
  }

  function refill() {
    left = shuffle([...byId.keys()], random);
    // Cards are taken from the end: don't start the new round with the card just shown.
    if (left.length > 1 && left.at(-1) === last) [left[0], left[left.length - 1]] = [left.at(-1), left[0]];
  }

  return {
    next() {
      if (byId.size === 0) return null;
      if (left.length === 0) refill();
      last = left.pop();
      save();
      return byId.get(last);
    },
    /** How many cards are left in this round. */
    get left() {
      return left.length;
    },
  };
}
