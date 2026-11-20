// The navigation at the top of every page: "Train" and one tab per word group
// (src/groups.js). A group's tab opens the subpage you used last; on the
// group's pages a second row of tabs links to all its subpages.
import { GROUPS, groupById } from "./groups.js";

const pageIn = (groupId, id) => groupById(groupId).pages.find((p) => p.id === id);

/** The subpage of a group used last, or its first subpage. */
export function lastPage(groupId, storage = globalThis.localStorage) {
  try {
    const saved = pageIn(groupId, storage.getItem(groupById(groupId).storageKey));
    if (saved) return saved;
  } catch {
    // Blocked storage: use the first page.
  }
  return groupById(groupId).pages[0];
}

export function rememberPage(groupId, id, storage = globalThis.localStorage) {
  if (!pageIn(groupId, id)) throw new Error(`Unknown ${groupId} page: ${id}`);
  try {
    storage.setItem(groupById(groupId).storageKey, id);
  } catch {
    // Blocked storage: just not remembered.
  }
}

/**
 * Fill <nav id="nav"> for the current page. `section` is "train" or a group id;
 * `pageId` is the group's subpage, which is remembered for next time.
 * Safe to call again when the subpage changes.
 */
export function renderNav(nav, section, pageId) {
  const group = groupById(section);
  if (group && pageId) rememberPage(section, pageId);
  const here = (yes) => (yes ? ' aria-current="page"' : "");

  nav.innerHTML = `
    <a class="tab" href="./"${here(section === "train")}>Train</a>
    ${GROUPS.map((g) => `<a class="tab" href="${lastPage(g.id).href}"${here(section === g.id)}>${g.name}</a>`).join("")}`;

  // On a group's page, a second row with all its subpages, right under the navigation.
  nav.nextElementSibling?.classList.contains("subnav") && nav.nextElementSibling.remove();
  if (group) {
    const sub = document.createElement("nav");
    sub.className = "subnav";
    sub.setAttribute("aria-label", group.name);
    sub.innerHTML = group.pages
      .map((p) => `<a href="${p.href}"${here(p.id === pageId)}>${p.label}</a>`).join("");
    nav.after(sub);
  }
}
