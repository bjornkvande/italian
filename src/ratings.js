// How well you know each card, per direction, stored in the browser's localStorage.
//
// Stored under one key as JSON:
//   { version: 1, cards: { "<card id>|<direction>": { last, at, count, history } } }
// where direction is "it-en" (Italian shown, English answered) or "en-it",
// last is the latest rating 1–5, at its time (ms since 1970), count how many
// times the card was rated, and history the latest ratings as [rating, time] pairs.
// This is the data to use later for choosing cards more cleverly than at random.

export const STORAGE_KEY = "verbi.ratings";
const VERSION = 1;
const HISTORY_LENGTH = 10;

export const DIRECTIONS = ["it-en", "en-it"];

const key = (cardId, direction) => `${cardId}|${direction}`;

export function createRatings(storage = globalThis.localStorage) {
  let data = { version: VERSION, cards: {} };

  // Re-read storage before every read and write, so several open tabs (or
  // windows) never overwrite each other's ratings with a stale copy.
  // If storage can't be read, keep using what's in memory.
  function load() {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (raw === null) return;
      const saved = JSON.parse(raw);
      if (saved?.version === VERSION && saved.cards) data = saved;
    } catch {
      // Unreadable or blocked storage: keep the in-memory data.
    }
  }
  load();

  function save() {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage full or blocked (e.g. private mode): keep working in memory.
    }
  }

  return {
    /** The stored record for a card in one direction, or undefined. */
    get(cardId, direction) {
      load();
      return data.cards[key(cardId, direction)];
    },

    /** Record a rating from 1 (no idea) to 5 (knew it perfectly). */
    rate(cardId, direction, rating, now = Date.now()) {
      if (!DIRECTIONS.includes(direction)) throw new Error(`Unknown direction: ${direction}`);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error(`Rating must be 1–5, got ${rating}`);
      load();
      const k = key(cardId, direction);
      const old = data.cards[k];
      data.cards[k] = {
        last: rating,
        at: now,
        count: (old?.count ?? 0) + 1,
        history: [...(old?.history ?? []), [rating, now]].slice(-HISTORY_LENGTH),
      };
      save();
      return data.cards[k];
    },

    /**
     * Change your mind about the rating just given to a card (same visit):
     * replaces the latest rating instead of adding another one.
     */
    correct(cardId, direction, rating, now = Date.now()) {
      load();
      const old = data.cards[key(cardId, direction)];
      if (!old) return this.rate(cardId, direction, rating, now);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error(`Rating must be 1–5, got ${rating}`);
      data.cards[key(cardId, direction)] = {
        ...old,
        last: rating,
        at: now,
        history: [...old.history.slice(0, -1), [rating, now]],
      };
      save();
      return data.cards[key(cardId, direction)];
    },

    /** Every stored record, keyed by "<card id>|<direction>". */
    all() {
      load();
      return data.cards;
    },
  };
}
