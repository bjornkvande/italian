// The verbs come straight from the dictionary. Vite bundles the CSV as text,
// and reloads the page when the file changes.
//
// dictionary/verbs.csv is the single source of all verbs. Each row has:
//   infinitive  the verb (parlare)
//   english     the meaning shown on the reference pages (to speak, to talk)
//   group       are | ere | ire-dormire | ire-finire
//   auxiliary   avere | essere | avere/essere
//   participle  only if it differs from the regular form (insistito), otherwise empty
//   en_base     English base form for the flash cards (speak, grow up)
//   en_past     English simple past for the flash cards (spoke, grew up)
//   impersonal  "yes" for weather verbs used only as "it" (piovere), otherwise empty
//   note        optional note shown above the verb's table (*italic* and **bold** allowed)
// Verbs appear on the pages in the same order as in the CSV.
// tests/dictionary.test.js checks that every row follows these rules.
import verbsCSV from "../dictionary/verbs.csv?raw";

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

export const verbs = parseCSV(verbsCSV);
