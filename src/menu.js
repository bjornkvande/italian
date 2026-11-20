// A small dropdown: a toggle button that shows and hides a menu panel.
// Closes when you tap outside it or press Escape. Used by the level menu and
// the verbs menu in the navigation.
export function dropdown(container, toggle, panel) {
  const set = (open) => {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  };
  toggle.addEventListener("click", () => set(panel.hidden));
  document.addEventListener("click", (e) => {
    if (!container.contains(e.target)) set(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") set(false);
  });
  set(false);
  return { close: () => set(false) };
}
