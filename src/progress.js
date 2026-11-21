// Progress on the Train screen: how many cards you know, out of how many.
// A card counts as known at rating 4 or 5, judged like the page colours: the
// weaker of its two directions (src/rating-colors.js).
import { ratingLevels } from "./rating-colors.js";

export const KNOWN_FROM = 4;

/** How many of `cards` are known, given the stored rating records. */
export function progress(cards, records) {
  const levels = ratingLevels(records);
  const ids = new Set(cards.map((c) => c.id)); // a card shared by two groups counts once
  let known = 0;
  for (const id of ids) if ((levels.get(id) ?? 0) >= KNOWN_FROM) known++;
  return { known, total: ids.size };
}

/** "47 / 312" with thousands separators. */
export const fraction = ({ known, total }) => `${known.toLocaleString("en")} / ${total.toLocaleString("en")}`;
