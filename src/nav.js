// The navigation at the top of every page: "Train" and "Verbs" tabs. "Verbs"
// opens the verb page you used last; on the verb pages a second row of tabs
// links to all of them. Add new word groups (or tabs) here.

export const VERB_PAGES = [
  { id: "are", href: "are.html", label: "-are" },
  { id: "ere", href: "ere.html", label: "-ere" },
  { id: "ire", href: "ire.html", label: "-ire" },
  { id: "irregular", href: "irregular.html", label: "Irregular" },
];

export const STORAGE_KEY = "verbi.verbPage";
const byId = (id) => VERB_PAGES.find((p) => p.id === id);

/** The verb page used last, or the first one. */
export function lastVerbPage(storage = globalThis.localStorage) {
  try {
    const saved = byId(storage.getItem(STORAGE_KEY));
    if (saved) return saved;
  } catch {
    // Blocked storage: use the first page.
  }
  return VERB_PAGES[0];
}

export function rememberVerbPage(id, storage = globalThis.localStorage) {
  if (!byId(id)) throw new Error(`Unknown verb page: ${id}`);
  try {
    storage.setItem(STORAGE_KEY, id);
  } catch {
    // Blocked storage: just not remembered.
  }
}

/**
 * Fill <nav id="nav"> for the current page: "train" or a verb page id.
 * On a verb page, that page is remembered as the one "Verbs" opens next time.
 */
export function renderNav(nav, current) {
  if (byId(current)) rememberVerbPage(current);
  const verbs = lastVerbPage();
  const onVerbPage = Boolean(byId(current));
  const here = (yes) => (yes ? ' aria-current="page"' : "");

  nav.innerHTML = `
    <a class="tab" href="./"${here(current === "train")}>Train</a>
    <a class="tab" href="${verbs.href}"${here(onVerbPage)}>Verbs</a>`;

  // On a verb page, a second row with all verb pages, right under the navigation.
  if (onVerbPage) {
    const sub = document.createElement("nav");
    sub.className = "subnav";
    sub.setAttribute("aria-label", "Verb groups");
    sub.innerHTML = VERB_PAGES.map((p) => `<a href="${p.href}"${here(p.id === current)}>${p.label}</a>`).join("");
    nav.after(sub);
  }
}
