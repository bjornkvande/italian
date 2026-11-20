// Renders the Nouns page from dictionary/nouns.csv: one theme at a time
// (nouns.html#food), singular and plural with their articles, coloured by your ratings.
import "./pwa.js";
import { nouns, NOUN_PAGES, nounForms, nounCardId } from "./nouns.js";
import { renderGrammarNav, subpageFromHash } from "./nav.js";
import { legendHTML, rerenderOnRatingChanges } from "./rating-colors.js";
import { escape, md, table, ratingColours } from "./page-helpers.js";

const colours = ratingColours();
const colour = colours.colour;

function nounTable(rows) {
  return table("conj nouns", ["Singular", "Plural", "English"], rows.map((n) => {
    const f = nounForms(n);
    return [
      `<td${colour(nounCardId(n), "it")}>${escape(f.singular)}</td>`,
      f.plural ? `<td${colour(nounCardId(n, true))}>${escape(f.plural)}</td>` : "<td>—</td>",
      `<td class="en">${escape(n.english)}${n.note ? `<div class="row-note">${md(n.note)}</div>` : ""}</td>`,
    ];
  }));
}

const INTRO = `<p>Every noun is masculine or feminine; the article shows which (see the
  <a href="basics.html#articles">Basics: Articles</a>). Most plurals follow the rules:
  <em>-o → -i</em>, <em>-a → -e</em> (masculine <em>-a → -i</em>), <em>-e → -i</em>; nouns with an
  accented last vowel or ending in a consonant never change (<em>la città, il bar</em>).
  A dash means the noun is normally not used in the plural.</p>`;

function render() {
  colours.refresh();
  const page = NOUN_PAGES.find((p) => p.id === subpageFromHash("nouns"));
  renderGrammarNav(document.getElementById("nav"), "nouns", page.id);
  document.getElementById("content").innerHTML =
    `<h1>Nouns: ${page.title}</h1>${legendHTML()}${INTRO}` + nounTable(nouns.filter((n) => n.topic === page.id));
  document.title = `Italiano – ${page.title}`;
}

// Switching subpage only changes the #part of the address.
window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });
render();
rerenderOnRatingChanges(render);
