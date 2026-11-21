// The footer at the bottom of every grammar page: copyright and version.
// The build number (the number of commits) and the date are stamped in by
// vite.config.js when the app is built, so they show the last deploy.

const FIRST_YEAR = 2026;

/** "© Bjørn Jarle Kvande, 2026–2026 · Build 312, 2026-11-21" */
export function footerText({
  year = new Date().getFullYear(),
  build = typeof __BUILD_NUMBER__ !== "undefined" ? __BUILD_NUMBER__ : "dev",
  date = typeof __BUILD_DATE__ !== "undefined" ? __BUILD_DATE__ : "",
} = {}) {
  return `© Bjørn Jarle Kvande, ${FIRST_YEAR}–${Math.max(year, FIRST_YEAR)} · Build ${build}${date ? `, ${date}` : ""}`;
}

/** Adds the footer to the bottom of the page. */
export function addFooter() {
  const footer = document.createElement("footer");
  footer.className = "page-footer";
  footer.textContent = footerText();
  document.body.append(footer);
}
