// Renders the Adverbs page from dictionary/adverbs.csv: one subpage at a time
// (adverbs.html#when), each adverb coloured by your ratings.
import { adverbs, ADVERB_PAGES, adverbCardId } from "./adverbs.js";
import { grammarPage, colour } from "./grammar-page.js";
import { escape, md, table } from "./page-helpers.js";

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
  <em>-le</em> or <em>-re</em> drop the <em>e</em> (<em>facile → facilmente</em>).
  Place words (<em>qui, sopra, davanti…</em>) are in the
  <a href="basics.html#prepositions">Basics: Prepositions &amp; place</a>.</p>`;

grammarPage("adverbs", ADVERB_PAGES, (page) => ({
  heading: `Adverbs: ${page.title}`,
  html: INTRO + adverbTable(adverbs.filter((a) => a.topic === page.id)),
  title: page.title,
}));
