// The German verbs, from dictionary/de/, one file per page; the file decides
// the group. Vite bundles the CSV as text.
//
// verbs-regular.csv (weak verbs: every form from the rules in conjugate.js):
//   infinitive, english (shown on the pages), auxiliary (haben | sein | sein/haben),
//   en_base (English base form for the cards: speak), en_past (spoke),
//   impersonal ("yes": only the es form, es regnet), note,
//   imperativ ("no": no imperative in use, e.g. heißen)
// verbs-irregular.csv (strong and mixed verbs) adds:
//   stem2       the du/er stem when its vowel changes (sprich, fähr, läuf), else empty
//   past        the Präteritum ich/er form (sprach, ging, brachte)
//   participle  the Partizip II (gesprochen)
//   en_presente optional: six English present forms (am called;are called;...)
//   en_past may be six forms (was called;were called;...)
// verbs-separable.csv: like verbs-irregular.csv, plus `prefix` (an in anrufen);
//   past and participle empty for a weak verb. stem2/past are the base verb's.
// verbs-modal.csv (sein, haben, werden, the modals, wissen): every form listed,
//   praesens/praeteritum/konjunktiv as ich;du;er/sie/es;wir;ihr;sie, imperativ
//   as du;ihr;Sie; empty when not used. en_konjunktiv: the English of the
//   Konjunktiv II (could, would like).
//
// tests/de/verbs.test.js checks every row and the forms against German grammar.
import regularCSV from "../../../dictionary/de/verbs-regular.csv?raw";
import irregularCSV from "../../../dictionary/de/verbs-irregular.csv?raw";
import separableCSV from "../../../dictionary/de/verbs-separable.csv?raw";
import modalCSV from "../../../dictionary/de/verbs-modal.csv?raw";
import { parseCSV } from "../../core/csv.js";

export const VERB_FILES = {
  "verbs-regular.csv": { text: regularCSV, group: "regular" },
  "verbs-irregular.csv": { text: irregularCSV, group: "irregular" },
  "verbs-separable.csv": { text: separableCSV, group: "separable" },
  "verbs-modal.csv": { text: modalCSV, group: "modal" },
};

// All verbs in page order: regular, irregular, separable, modal.
export const verbs = Object.values(VERB_FILES).flatMap(({ text, group }) =>
  parseCSV(text).map((row) => ({ ...row, group })),
);
