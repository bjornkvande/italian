// The navigation at the top of every page: "Train", "Basics" and "Verbs" tabs.
// Basics and Verbs have subpages: the tab opens the subpage you used last, and
// on those pages a second row of tabs links to all subpages.
// Add new word groups (or tabs) here.
import { BASICS_PAGES } from "./basics.js";

export const VERB_PAGES = [
  { id: "are", href: "are.html", label: "-are" },
  { id: "ere", href: "ere.html", label: "-ere" },
  { id: "ire", href: "ire.html", label: "-ire" },
  { id: "irregular", href: "irregular.html", label: "Irregular" },
];

// Sections with subpages. `key` is where the last used subpage is remembered.
export const SECTIONS = {
  basics: {
    name: "Basics",
    key: "verbi.basicsPage",
    pages: BASICS_PAGES.map((p) => ({ id: p.id, href: `basics.html#${p.id}`, label: p.label })),
  },
  verbs: {
    name: "Verbs",
    key: "verbi.verbPage",
    pages: VERB_PAGES,
  },
};

const pageIn = (section, id) => SECTIONS[section].pages.find((p) => p.id === id);

/** The subpage of a section used last, or its first subpage. */
export function lastPage(section, storage = globalThis.localStorage) {
  try {
    const saved = pageIn(section, storage.getItem(SECTIONS[section].key));
    if (saved) return saved;
  } catch {
    // Blocked storage: use the first page.
  }
  return SECTIONS[section].pages[0];
}

export function rememberPage(section, id, storage = globalThis.localStorage) {
  if (!pageIn(section, id)) throw new Error(`Unknown ${section} page: ${id}`);
  try {
    storage.setItem(SECTIONS[section].key, id);
  } catch {
    // Blocked storage: just not remembered.
  }
}

/**
 * Fill <nav id="nav"> for the current page. `section` is "train", "basics" or
 * "verbs"; `pageId` is the subpage, which is remembered for next time.
 * Safe to call again when the subpage changes.
 */
export function renderNav(nav, section, pageId) {
  if (SECTIONS[section] && pageId) rememberPage(section, pageId);
  const here = (yes) => (yes ? ' aria-current="page"' : "");

  nav.innerHTML = `
    <a class="tab" href="./"${here(section === "train")}>Train</a>
    ${Object.entries(SECTIONS).map(([id, s]) =>
      `<a class="tab" href="${lastPage(id).href}"${here(section === id)}>${s.name}</a>`).join("")}`;

  // On a page with subpages, a second row with all of them, right under the navigation.
  nav.nextElementSibling?.classList.contains("subnav") && nav.nextElementSibling.remove();
  if (SECTIONS[section]) {
    const sub = document.createElement("nav");
    sub.className = "subnav";
    sub.setAttribute("aria-label", SECTIONS[section].name);
    sub.innerHTML = SECTIONS[section].pages
      .map((p) => `<a href="${p.href}"${here(p.id === pageId)}>${p.label}</a>`).join("");
    nav.after(sub);
    // On a narrow phone the row scrolls sideways: bring the current tab into view.
    const current = sub.querySelector('[aria-current="page"]');
    if (current && sub.scrollWidth > sub.clientWidth) {
      sub.scrollLeft = current.offsetLeft - (sub.clientWidth - current.offsetWidth) / 2;
    }
  }
}
