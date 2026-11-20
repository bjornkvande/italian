// Shared helpers for the tests (not a test file itself).
import { expect } from "vitest";
import { parseRows } from "../src/csv.js";

/** A stand-in for the browser's localStorage; `items` shows what was saved. */
export function fakeStorage(initial = {}) {
  const items = { ...initial };
  return {
    items,
    getItem: (k) => (k in items ? items[k] : null),
    setItem: (k, v) => { items[k] = String(v); },
  };
}

/** A dictionary file has exactly these columns, and every row one field per column. */
export function expectCsvShape(csvText, columns) {
  const [header, ...rows] = parseRows(csvText);
  expect(header).toEqual(columns);
  for (const r of rows) expect(r.length, `row "${r.slice(0, 3).join(",")}" has ${r.length} fields`).toBe(columns.length);
}

/** Markdown in a note: ** and * come in pairs, or the page would show stray asterisks. */
export function expectNoteMarkdown(note) {
  const singles = note.replace(/\*\*/g, "").split("*").length - 1;
  expect(note.split("**").length % 2, `unbalanced ** in note: ${note}`).toBe(1);
  expect(singles % 2, `unbalanced * in note: ${note}`).toBe(0);
}
