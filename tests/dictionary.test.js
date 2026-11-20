// Checks that the dictionary files are well-formed, so a typo in a new row
// fails here instead of producing wrong forms in the app.
import { describe, it, expect } from "vitest";
import { DICTIONARY_FILES, parseCSV, parseRows, verbs } from "../src/csv.js";

const COMMON = ["infinitive", "english", "auxiliary", "participle", "en_base", "en_past", "impersonal", "note"];
const COLUMNS_PER_FILE = {
  "verbs-are.csv": COMMON,
  "verbs-ere.csv": COMMON,
  "verbs-ire.csv": ["infinitive", "english", "isc", ...COMMON.slice(2)],
  "verbs-irregular.csv": [
    "infinitive", "english", "auxiliary", "participle", "gerund",
    "presente", "imperfetto", "futuro", "condizionale", "imperativo",
    "en_base", "en_past", "en_presente", "en_condizionale", "note",
  ],
};
const ENDING_PER_FILE = { "verbs-are.csv": "are", "verbs-ere.csv": "ere", "verbs-ire.csv": "ire", "verbs-irregular.csv": "" };
const sixForms = (text) => text.split(";").map((f) => f.trim());

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
    expect(v.en_base).toMatch(/^[a-z][a-z ()]*$/);
    expect(v.en_base).not.toMatch(/^to /);
    expect(v.en_past).toMatch(/^[a-z][a-z ();]*$/);
    if ("impersonal" in v) expect(["", "yes"]).toContain(v.impersonal);
    if (v.participle) expect(v.participle).toMatch(/^[a-z]+o$/);

    if (file === "verbs-irregular.csv") {
      expect(v.participle, "irregular verbs need a participle").toMatch(/^[a-z]+o$/);
      expect(v.gerund).toMatch(/^[a-z]+ndo$/);
      for (const tense of ["presente", "imperfetto", "futuro", "condizionale"]) {
        const forms = sixForms(v[tense]);
        expect(forms, `${v.infinitive} ${tense} needs 6 forms`).toHaveLength(6);
        for (const f of forms) expect(f, `${v.infinitive} ${tense}`).toMatch(/^[a-zàèéìòù']+$/);
      }
      if (v.imperativo) {
        const imp = sixForms(v.imperativo);
        expect(imp, `${v.infinitive} imperativo needs ";tu;Lei;noi;voi;Loro"`).toHaveLength(6);
        expect(imp[0], "imperativo has no io form").toBe("");
        for (const f of imp.slice(1)) expect(f).toMatch(/^[a-zàèéìòù'/]+$/);
      }
      if (v.en_presente) expect(sixForms(v.en_presente)).toHaveLength(6);
      expect([1, 6]).toContain(sixForms(v.en_past).length);
    }

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
