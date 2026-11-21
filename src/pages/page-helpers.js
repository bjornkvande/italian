// Shared building blocks for the reference pages (verbs, Basics, and future word
// groups): escaping, inline Markdown, tables and rating colours.
import { currentLevels, ratingClass } from "./rating-colors.js";

/** Escape text for use in HTML. */
export const escape = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** Inline Markdown from the dictionary notes: **bold** and *italic*. */
export const md = (s) => escape(s)
  .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  .replace(/\*(.+?)\*/g, "<em>$1</em>");

/**
 * A table in a sideways-scrolling wrapper.
 * head: column titles (or null for none).
 * rows: arrays of cell HTML, or { attrs, cells } to give a row attributes (e.g. a colour).
 */
export const table = (cls, head, rows) => `
  <div class="table-wrap"><table class="${cls}">
    ${head ? `<thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>` : ""}
    <tbody>${rows.map((r) => (Array.isArray(r) ? `<tr>${r.join("")}</tr>` : `<tr${r.attrs}>${r.cells.join("")}</tr>`)).join("")}</tbody>
  </table></div>`;

/**
 * Rating colours for a page. Call refresh() at the start of every render, then
 * colour(cardId) gives ` class="r3"` for a rated card ("" when not rated).
 * Extra classes can be merged in: colour(id, "it") → ` class="it r3"`.
 */
export function ratingColours() {
  let levels = new Map();
  return {
    refresh() { levels = currentLevels(); },
    colour(cardId, extra = "") {
      const cls = [extra, ratingClass(levels, cardId)].filter(Boolean).join(" ");
      return cls ? ` class="${cls}"` : "";
    },
  };
}
