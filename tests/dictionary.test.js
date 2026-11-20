// Checks that dictionary/verbs.csv is well-formed, so a typo in a new row
// fails here instead of producing wrong forms in the app.
import { describe, it, expect } from "vitest";
import verbsCSV from "../dictionary/verbs.csv?raw";
import { parseCSV, parseRows, verbs } from "../src/csv.js";

const COLUMNS = ["infinitive", "english", "group", "auxiliary", "participle", "en_base", "en_past", "impersonal", "note"];
const GROUP_ENDING = { "are": "are", "ere": "ere", "ire-dormire": "ire", "ire-finire": "ire" };

describe("parseCSV", () => {
  it("handles quoted commas, escaped quotes, CRLF and a trailing newline", () => {
    const text = 'a,b,c\r\n1,"x, y","say ""hi"""\r\n2,,\n';
    expect(parseCSV(text)).toEqual([
      { a: "1", b: "x, y", c: 'say "hi"' },
      { a: "2", b: "", c: "" },
    ]);
  });
});

describe("dictionary/verbs.csv", () => {
  it("has the expected columns", () => {
    expect(verbsCSV.split(/\r?\n/)[0].split(",")).toEqual(COLUMNS);
  });

  it("every row has exactly one field per column", () => {
    for (const r of parseRows(verbsCSV)) {
      expect(r.length, `row "${r[0]}" has ${r.length} fields`).toBe(COLUMNS.length);
    }
  });

  it("has no duplicate verbs", () => {
    const names = verbs.map((v) => v.infinitive);
    expect(names.length).toBe(new Set(names).size);
  });

  it.each(verbs.map((v) => [v.infinitive, v]))("%s is valid", (_, v) => {
    expect(Object.keys(GROUP_ENDING)).toContain(v.group);
    expect(v.infinitive.endsWith(GROUP_ENDING[v.group])).toBe(true);
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
