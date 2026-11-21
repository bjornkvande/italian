// Shared setup for a grammar page with #subpages (basics.html#essere,
// nouns.html#food): it picks the subpage from the address, draws the navigation,
// the heading, the colour legend and the page's content, keeps the rating
// colours fresh, and redraws when the subpage or the ratings change.
// A page only says what its content is (see grammarPage below).
import "../core/pwa.js";
import { renderGrammarNav, subpageFromHash } from "../core/nav.js";
import { legendHTML, rerenderOnRatingChanges } from "./rating-colors.js";
import { ratingColours } from "./page-helpers.js";
import { addFooter } from "./footer.js";

const colours = ratingColours();

/** ` class="r3"` for a rated card (with extra classes merged in), "" otherwise. */
export const colour = colours.colour;

/**
 * Show a grammar page. `pages` are the group's subpages ({ id, ... });
 * `render(page)` returns { heading, html, title }: the page heading, the
 * content below the colour legend, and the browser title after "Italiano – ".
 */
export function grammarPage(groupId, pages, render) {
  const nav = document.getElementById("nav");
  const content = document.getElementById("content");

  function draw() {
    colours.refresh();
    const page = pages.find((p) => p.id === subpageFromHash(groupId));
    renderGrammarNav(nav, groupId, page.id);
    const { heading, html, title } = render(page);
    content.innerHTML = `<h1>${heading}</h1>${legendHTML()}${html}`;
    document.title = `Italiano – ${title}`;
  }

  // Switching subpage only changes the #part of the address.
  window.addEventListener("hashchange", () => { draw(); window.scrollTo(0, 0); });
  draw();
  addFooter();
  rerenderOnRatingChanges(draw);
}
