// A small dropdown: a toggle button that shows and hides a menu panel.
// Closes when you tap outside it or press Escape. Used by the word group menu
// in the navigation and the difficulty menu on the Train screen.
//
// The page-wide listeners are added once and shared by all dropdowns, so
// dropdowns can be re-created (e.g. when the navigation is redrawn) without
// piling up listeners.
const dropdowns = new Set();

function closeAll(except) {
  for (const d of dropdowns) {
    if (!d.container.isConnected) dropdowns.delete(d); // redrawn or removed
    else if (d !== except) d.set(false);
  }
}

let listening = false;
function listen() {
  if (listening) return;
  listening = true;
  document.addEventListener("click", (e) => {
    closeAll([...dropdowns].find((d) => d.container.contains(e.target)));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
}

export function dropdown(container, toggle, panel) {
  const d = {
    container,
    set(open) {
      panel.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
    },
  };
  toggle.addEventListener("click", () => d.set(panel.hidden));
  dropdowns.add(d);
  listen();
  d.set(false);
  return { close: () => d.set(false) };
}
