// Navigation between the two parts of the app:
//   Train (the main page, index.html#verbs): the word group you practise is kept
//     in the address and remembered; a 📖 button opens that group's grammar.
//   Grammar & dictionary (the reference pages): a "← Train on Verbs" button back
//     to training with that group, and a row of tabs with the group's subpages.
// Each group remembers its last grammar subpage. Word groups: src/lang/<code>/groups.js,
// of the current language (src/core/language.js).
import { GROUPS, groupById, LANGUAGE, storageKey } from "./language.js";

const TRAIN = {
  id: "train",
  name: "Train",
  storageKey: storageKey("trainGroup"), // Italian: "verbi.trainGroup"
  pages: GROUPS.map((g) => ({ id: g.id, href: `./#${g.id}`, label: g.name })),
};

/** Train or a word group: { id, name, storageKey, pages }. */
export const sectionById = (id) => (id === "train" ? TRAIN : groupById(id));

const pageIn = (sectionId, id) => sectionById(sectionId).pages.find((p) => p.id === id);

/** The subpage of a section (Train or a group) used last, or its first subpage. */
export function lastPage(sectionId, storage = globalThis.localStorage) {
  try {
    const saved = pageIn(sectionId, storage.getItem(sectionById(sectionId).storageKey));
    if (saved) return saved;
  } catch {
    // Blocked storage: use the first page.
  }
  return sectionById(sectionId).pages[0];
}

export function rememberPage(sectionId, id, storage = globalThis.localStorage) {
  if (!pageIn(sectionId, id)) throw new Error(`Unknown ${sectionId} page: ${id}`);
  try {
    storage.setItem(sectionById(sectionId).storageKey, id);
  } catch {
    // Blocked storage: just not remembered.
  }
}

/**
 * For a section whose subpages are #parts of one page (index.html#verbs,
 * basics.html#essere): the subpage id in the address, or else the one used last.
 */
export function subpageFromHash(sectionId) {
  const id = decodeURIComponent(location.hash.slice(1));
  return pageIn(sectionId, id)?.id ?? lastPage(sectionId).id;
}

/** Where the 📖 button on the Train screen leads: the group's last grammar subpage. */
export const grammarHref = (groupId) => LANGUAGE.dir + lastPage(groupId).href;

// From a grammar page back to the Train screen (in the root).
const trainHref = (groupId) => `${LANGUAGE.dir ? "../" : "./"}#${groupId}`;

/**
 * Fill <nav id="nav"> on a grammar page: "← Train on Verbs" and a row of tabs
 * with the group's subpages. `pageId` is remembered as the group's last subpage.
 * Safe to call again when the subpage changes.
 */
export function renderGrammarNav(nav, groupId, pageId) {
  rememberPage(groupId, pageId);
  const group = groupById(groupId);
  const here = (yes) => (yes ? ' aria-current="page"' : "");
  nav.innerHTML = `
    <a class="train-link" href="${trainHref(group.id)}">← Train on ${group.name}</a>
    <div class="subnav" aria-label="${group.name}">
      ${group.pages.map((p) => `<a href="${p.href}"${here(p.id === pageId)}>${p.label}</a>`).join("")}
    </div>`;
}
