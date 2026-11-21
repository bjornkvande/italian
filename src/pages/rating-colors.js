// Colours for the reference pages, from your flash card ratings.
// A card's colour is the weaker of its two directions (Italian first / English
// first): it only turns green when you know it both ways. If only one direction
// is rated, that one counts. Not rated: no colour.
import { createRatings, DIRECTIONS } from "../core/ratings.js";

/**
 * From all stored ratings ({ "<card id>|<direction>": { last, ... } }) to the
 * colour level of each card: Map card id → 1..5 (the weaker direction).
 */
export function ratingLevels(records) {
  const levels = new Map();
  for (const [key, record] of Object.entries(records)) {
    const sep = key.lastIndexOf("|");
    const id = key.slice(0, sep);
    if (!DIRECTIONS.includes(key.slice(sep + 1)) || !(record?.last >= 1 && record.last <= 5)) continue;
    levels.set(id, Math.min(levels.get(id) ?? 5, record.last));
  }
  return levels;
}

/** The colour levels for the ratings stored in this browser. */
export function currentLevels(storage = globalThis.localStorage) {
  return ratingLevels(createRatings(storage).all());
}

/** The CSS class for a card ("r1" … "r5"), or "" when it's not rated. */
export function ratingClass(levels, cardId) {
  const level = levels.get(cardId);
  return level ? `r${level}` : "";
}

/** A small legend explaining the colours. */
export function legendHTML() {
  return `<p class="legend">Colours show how well you know each form (from your flash card ratings):
    <span class="r1">1</span><span class="r2">2</span><span class="r3">3</span><span class="r4">4</span><span class="r5">5</span>
    <span class="unrated">not rated</span></p>`;
}

/**
 * Run `render` now, and again when the ratings may have changed: when coming
 * back to the page (also via the back button) or when another tab rates a card.
 */
export function rerenderOnRatingChanges(render) {
  window.addEventListener("pageshow", (e) => { if (e.persisted) render(); });
  window.addEventListener("storage", (e) => { if (e.key === null || e.key === "verbi.ratings") render(); });
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") render(); });
}
