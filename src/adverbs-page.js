// Renders the Adverbs page from dictionary/adverbs.csv: one subpage at a time
// (adverbs.html#place), each adverb coloured by your ratings.
import "./pwa.js";
import { adverbs, ADVERB_PAGES, adverbCardId } from "./adverbs.js";
import { renderGrammarNav, subpageFromHash } from "./nav.js";
import { legendHTML, rerenderOnRatingChanges } from "./rating-colors.js";
import { escape, md, table, ratingColours } from "./page-helpers.js";

const colours = ratingColours();
const colour = colours.colour;

function adverbTable(rows) {
  return table("words", ["Italian", "English"], rows.map((a) => ({
    attrs: colour(adverbCardId(a)),
    cells: [
      `<td class="it">${escape(a.adverb)}</td>`,
      `<td>${escape(a.english)}${a.note ? `<div class="row-note">${md(a.note)}</div>` : ""}${
        a.from ? `<div class="row-note">from <em>${escape(a.from)}</em></div>` : ""}</td>`,
    ],
  })));
}

const INTRO = `<p>Adverbs never change form. Many are made from an adjective with <em>-mente</em>:
  the feminine form + <em>-mente</em> (<em>lenta → lentamente</em>); adjectives ending in
  <em>-le</em> or <em>-re</em> drop the <em>e</em> (<em>facile → facilmente</em>).</p>`;

function render() {
  colours.refresh();
  const page = ADVERB_PAGES.find((p) => p.id === subpageFromHash("adverbs"));
  renderGrammarNav(document.getElementById("nav"), "adverbs", page.id);
  document.getElementById("content").innerHTML =
    `<h1>Adverbs: ${page.title}</h1>${legendHTML()}${INTRO}` +
    adverbTable(adverbs.filter((a) => a.topic === page.id));
  document.title = `Italiano – ${page.title}`;
}

// Switching subpage only changes the #part of the address.
window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });
render();
rerenderOnRatingChanges(render);
