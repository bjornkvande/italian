// Progress on the Train screen: how many card sides you know, out of how many.
// Each card has two directions (Italian first, English first), counted
// separately, so every rating of 4 or 5 on a side that wasn't known yet moves
// the bar. (The page colours instead use a card's weaker direction.)
import { DIRECTIONS } from "./ratings.js";

export const KNOWN_FROM = 4;

/** How many directions of `cards` are known, given the stored rating records. */
export function progress(cards, records) {
  const ids = new Set(cards.map((c) => c.id)); // a card shared by two groups counts once
  let known = 0;
  for (const id of ids) {
    for (const d of DIRECTIONS) if ((records[`${id}|${d}`]?.last ?? 0) >= KNOWN_FROM) known++;
  }
  return { known, total: ids.size * DIRECTIONS.length };
}

/** "47 / 312" with thousands separators. */
export const fraction = ({ known, total }) => `${known.toLocaleString("en")} / ${total.toLocaleString("en")}`;
