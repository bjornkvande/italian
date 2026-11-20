// The verbs come straight from the dictionary. Vite bundles the CSV as text,
// and reloads the page when the file changes.
//
// The dictionary folder is the single source of all verbs, one file per group:
// verbs-are.csv, verbs-ere.csv and verbs-ire.csv. The file decides the group.
// Columns:
//   infinitive  the verb (parlare)
//   english     the meaning shown on the reference pages (to speak, to talk)
//   isc         only in verbs-ire.csv: "yes" for the finire type (capisco),
//               empty for the dormire type (dormo)
//   auxiliary   avere | essere | avere/essere
//   participle  only if it differs from the regular form (insistito), otherwise empty
//   en_base     English base form for the flash cards (speak, grow up)
//   en_past     English simple past for the flash cards (spoke, grew up)
//   impersonal  "yes" for weather verbs used only as "it" (piovere), otherwise empty
//   note        optional note shown above the verb's table (*italic* and **bold** allowed)
// Verbs appear on the pages in the same order as in their file.
// tests/dictionary.test.js checks that every row follows these rules.
import areCSV from "../dictionary/verbs-are.csv?raw";
import ereCSV from "../dictionary/verbs-ere.csv?raw";
import ireCSV from "../dictionary/verbs-ire.csv?raw";

// Each file and how its rows get their group. The group is what the
// conjugation rules use: are | ere | ire-dormire | ire-finire.
export const DICTIONARY_FILES = {
  "verbs-are.csv": { text: areCSV, group: () => "are" },
  "verbs-ere.csv": { text: ereCSV, group: () => "ere" },
  "verbs-ire.csv": { text: ireCSV, group: (row) => (row.isc === "yes" ? "ire-finire" : "ire-dormire") },
};

// Minimal CSV parser: handles quoted fields, commas and "" inside quotes.
// Returns the rows as arrays of fields, skipping empty lines.
export function parseRows(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.some(f => f.trim()));
}

// Rows as objects keyed by the header line.
export function parseCSV(text) {
  const [header, ...data] = parseRows(text);
  return data.map(r => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

// All verbs, -are first, then -ere, then -ire, each with its group.
export const verbs = Object.values(DICTIONARY_FILES).flatMap(({ text, group }) =>
  parseCSV(text).map((row) => ({ ...row, group: group(row) })),
);
