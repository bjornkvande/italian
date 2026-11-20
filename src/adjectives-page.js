// Renders the Adjectives page from dictionary/adjectives.csv: one subpage at a
// time (adjectives.html#colours), each form coloured by your ratings.
import "./pwa.js";
import { adjectives, ADJECTIVE_PAGES, adjectiveForms, adjectiveCardId } from "./adjectives.js";
import { renderNav, subpageFromHash } from "./nav.js";
import { legendHTML, rerenderOnRatingChanges } from "./rating-colors.js";
import { escape, md, table, ratingColours } from "./page-helpers.js";

const colours = ratingColours();
const colour = colours.colour;

const FORMS = [["msg", "m. sing."], ["fsg", "f. sing."], ["mpl", "m. pl."], ["fpl", "f. pl."]];

function adjectiveTable(rows) {
  return table("conj adjectives", [...FORMS.map(([, label]) => label), "English"], rows.map((a) => {
    const forms = adjectiveForms(a);
    return [
      ...FORMS.map(([f], i) => `<td${colour(adjectiveCardId(a, f), i === 0 ? "it" : "")}>${escape(forms[f])}</td>`),
      `<td class="en">${escape(a.english)}${a.note ? `<div class="row-note">${md(a.note)}</div>` : ""}</td>`,
    ];
  }));
}

const INTRO = `<p>Adjectives agree with the noun in gender and number. Most end in <em>-o</em> and have
  four forms (<em>rosso, rossa, rossi, rosse</em>); those ending in <em>-e</em> have two
  (<em>grande, grandi</em>); a few never change (<em>blu, rosa</em>).</p>`;

function render() {
  colours.refresh();
  const page = ADJECTIVE_PAGES.find((p) => p.id === subpageFromHash("adjectives"));
  renderNav(document.getElementById("nav"), "adjectives", page.id);
  document.getElementById("content").innerHTML =
    `<h1>Adjectives: ${page.title}</h1>${legendHTML()}${INTRO}` +
    adjectiveTable(adjectives.filter((a) => a.topic === page.id));
  document.title = `Adjectives – ${page.label}`;
}

// Switching subpage only changes the #part of the address.
window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });
render();
rerenderOnRatingChanges(render);
