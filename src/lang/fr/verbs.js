// The French verbs, from dictionary/fr/, one file per page; the file decides
// the group. Vite bundles the CSV as text.
//
// verbs-er.csv (regular -er verbs, every form from the rules in conjugate.js):
//   infinitive, english (shown on the pages), auxiliary (avoir | être),
//   stem2 (the stem before a silent ending when it changes: achèt, appell,
//   préfèr, pai; else empty), en_base (English for the cards: speak),
//   en_past (spoke), note
// verbs-ir.csv (finir type) and verbs-re.csv (vendre type): the same without stem2.
// verbs-irregular.csv:
//   participle, present (je;tu;il;nous;vous;ils), futur (the future and
//   conditional stem: ser, ir, fer), imparfait (only if not from the nous form:
//   être → ét), imperatif (tu;nous;vous when not from the present; "-" for
//   none), en_present (six English forms, am;are;is;...), en_conditional
//   (would like, could, should), impersonal ("yes": only il, il faut)
//
// tests/fr/verbs.test.js checks every row and the forms against French grammar.
import erCSV from "../../../dictionary/fr/verbs-er.csv?raw";
import irCSV from "../../../dictionary/fr/verbs-ir.csv?raw";
import reCSV from "../../../dictionary/fr/verbs-re.csv?raw";
import irregularCSV from "../../../dictionary/fr/verbs-irregular.csv?raw";
import { parseCSV } from "../../core/csv.js";

export const VERB_FILES = {
  "verbs-er.csv": { text: erCSV, group: "er" },
  "verbs-ir.csv": { text: irCSV, group: "ir" },
  "verbs-re.csv": { text: reCSV, group: "re" },
  "verbs-irregular.csv": { text: irregularCSV, group: "irregular" },
};

// All verbs in page order: -er, -ir, -re, irregular.
export const verbs = Object.values(VERB_FILES).flatMap(({ text, group }) =>
  parseCSV(text).map((row) => ({ ...row, group })),
);
