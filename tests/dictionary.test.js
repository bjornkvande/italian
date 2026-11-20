// Checks that the dictionary files are well-formed, so a typo in a new row
// fails here instead of producing wrong forms in the app.
import { describe, it, expect } from "vitest";
import { DICTIONARY_FILES, parseCSV, parseRows, verbs } from "../src/csv.js";

const COMMON = ["infinitive", "english", "auxiliary", "participle", "en_base", "en_past", "impersonal", "note"];
const COLUMNS_PER_FILE = {
  "verbs-are.csv": COMMON,
  "verbs-ere.csv": COMMON,
  "verbs-ire.csv": ["infinitive", "english", "isc", ...COMMON.slice(2)],
};
const ENDING_PER_FILE = { "verbs-are.csv": "are", "verbs-ere.csv": "ere", "verbs-ire.csv": "ire" };

describe("parseCSV", () => {
  it("handles quoted commas, escaped quotes, CRLF and a trailing newline", () => {
    const text = 'a,b,c\r\n1,"x, y","say ""hi"""\r\n2,,\n';
    expect(parseCSV(text)).toEqual([
      { a: "1", b: "x, y", c: 'say "hi"' },
      { a: "2", b: "", c: "" },
    ]);
  });
});

describe.each(Object.entries(DICTIONARY_FILES))("dictionary/%s", (file, { text }) => {
  const rows = parseCSV(text);
  const COLUMNS = COLUMNS_PER_FILE[file];

  it("has the expected columns", () => {
    expect(parseRows(text)[0]).toEqual(COLUMNS);
  });

  it("every row has exactly one field per column", () => {
    for (const r of parseRows(text)) {
      expect(r.length, `row "${r[0]}" has ${r.length} fields`).toBe(COLUMNS.length);
    }
  });

  it("is not empty", () => {
    expect(rows.length).toBeGreaterThan(0);
  });

  it.each(rows.map((v) => [v.infinitive, v]))("%s is valid", (_, v) => {
    expect(v.infinitive.endsWith(ENDING_PER_FILE[file]), `${v.infinitive} doesn't belong in ${file}`).toBe(true);
    if ("isc" in v) expect(["", "yes"]).toContain(v.isc);
    expect(v.infinitive).toMatch(/^[a-z]+$/);
    expect(["avere", "essere", "avere/essere"]).toContain(v.auxiliary);
    expect(v.english).toMatch(/^to /);
    expect(v.en_base).toMatch(/^[a-z][a-z ]*$/);
    expect(v.en_base).not.toMatch(/^to /);
    expect(v.en_past).toMatch(/^[a-z][a-z ]*$/);
    expect(["", "yes"]).toContain(v.impersonal);
    if (v.participle) expect(v.participle).toMatch(/^[a-z]+o$/);

    // Markdown in notes: ** and * must come in pairs, or the page shows stray asterisks.
    const singles = v.note.replace(/\*\*/g, "").split("*").length - 1;
    expect(v.note.split("**").length % 2, "unbalanced ** in note").toBe(1);
    expect(singles % 2, "unbalanced * in note").toBe(0);
  });
});

describe("all dictionary files together", () => {
  it("have no duplicate verbs, also across files", () => {
    const names = verbs.map((v) => v.infinitive);
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    expect(dupes).toEqual([]);
  });
});
