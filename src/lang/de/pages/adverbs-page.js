// Renders the German Adverbs page from dictionary/de/adverbs.csv, one subpage
// at a time (de/adverbs.html#when), coloured by your ratings.
import { adverbs, ADVERB_PAGES, adverbCardId } from "../adverbs.js";
import { grammarPage, colour } from "../../../pages/grammar-page.js";
import { escape, md, table } from "../../../pages/page-helpers.js";

function adverbTable(rows) {
  return table("words", ["German", "English"], rows.map((a) => ({
    attrs: colour(adverbCardId(a)),
    cells: [
      `<td class="it" lang="de">${escape(a.adverb)}</td>`,
      `<td>${escape(a.english)}${a.note ? `<div class="row-note">${md(a.note)}</div>` : ""}</td>`,
    ],
  })));
}

const INTRO = `<p>Adverbs never change. Almost every adjective is also an adverb as it is:
  <em>Er spricht langsam.</em> = He speaks slowly (see <a href="adjectives.html#common">Adjectives</a>);
  the time words <em>heute, oft, nie, schon…</em> are in the <a href="basics.html#small-words">Basics</a>.
  Word order: time, then manner, then place: <em>Ich fahre morgen gern nach Berlin.</em></p>`;

grammarPage("adverbs", ADVERB_PAGES, (page) => ({
  heading: `Adverbs: ${page.title}`,
  html: INTRO + adverbTable(adverbs.filter((a) => a.topic === page.id)),
  title: page.title,
}));
