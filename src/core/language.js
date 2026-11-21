// The languages of the app and which one is in use.
//
// Each language has a settings object in src/lang/<code>/language.js:
// { code, name, englishName, speech, prefix, dir, groups, flag }. Its storage
// keys start with `prefix`, so every language keeps its own ratings, progress
// and settings; its grammar pages live in `dir` (Italian: the root, others:
// "<code>/").
//
// A grammar page says its language in <body data-lang="de">, and makes it the
// current one. The Train screen uses the language chosen last (Italian at first).
import { LANGUAGE as it } from "../lang/it/language.js";
import { LANGUAGE as de } from "../lang/de/language.js";
import { LANGUAGE as fr } from "../lang/fr/language.js";

export const LANGUAGES = [it, de, fr];
export const LANGUAGE_KEY = "verbi.language"; // the language chosen last

const byCode = (code) => LANGUAGES.find((l) => l.code === code);

/** The language of this page, or on the Train screen the one chosen last. */
export function languageFor(doc = globalThis.document, storage = globalThis.localStorage) {
  const fromPage = byCode(doc?.body?.dataset.lang);
  if (fromPage) return fromPage;
  try {
    return byCode(storage?.getItem(LANGUAGE_KEY)) ?? LANGUAGES[0];
  } catch {
    return LANGUAGES[0]; // blocked storage
  }
}

/** Make `code` the language the Train screen uses. */
export function chooseLanguage(code, storage = globalThis.localStorage) {
  if (!byCode(code)) throw new Error(`Unknown language: ${code}`);
  try {
    storage.setItem(LANGUAGE_KEY, code);
  } catch {
    // Blocked storage: not remembered.
  }
}

/** The language in use on this page. */
export const LANGUAGE = languageFor();

/** A storage key of the current language: "verbi.ratings", "de.ratings". */
export const storageKey = (name, language = LANGUAGE) => language.prefix + name;

/** The word groups of the current language. */
export const GROUPS = LANGUAGE.groups;
export const groupById = (id) => GROUPS.find((g) => g.id === id);

/** The cards of every group of the current language, by group id. */
export function cardsByGroup() {
  return Object.fromEntries(GROUPS.map((g) => [g.id, g.cards()]));
}
