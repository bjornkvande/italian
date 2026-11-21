// Renders the French Adverbs page from dictionary/fr/adverbs.csv, one subpage
// at a time (fr/adverbs.html#when), coloured by your ratings.
import { adverbs, ADVERB_PAGES, adverbCardId } from "../adverbs.js";
import { grammarPage, colour } from "../../../pages/grammar-page.js";
import { escape, md, table } from "../../../pages/page-helpers.js";

function adverbTable(rows) {
  return table("words", ["French", "English"], rows.map((a) => ({
    attrs: colour(adverbCardId(a)),
    cells: [
      `<td class="it" lang="fr">${escape(a.adverb)}</td>`,
      `<td>${escape(a.english)}${a.from ? `<div class="row-note">${md(`from *${a.from}*`)}</div>` : ""}${a.note ? `<div class="row-note">${md(a.note)}</div>` : ""}</td>`,
    ],
  })));
}

const INTRO = `<p>Adverbs never change. Many are made from an adjective with <em>-ment</em>, added to the
  feminine (<em>lente → lentement</em>), to the masculine after a vowel (<em>vrai → vraiment</em>);
  <em>-ant</em> and <em>-ent</em> become <em>-amment</em> and <em>-emment</em> (<em>récent → récemment</em>).
  The adverb usually goes right after the verb: <em>Je parle bien français.</em> The time words
  <em>souvent, toujours, déjà…</em> are in the <a href="basics.html#small-words">Basics</a>.</p>`;

grammarPage("adverbs", ADVERB_PAGES, (page) => ({
  heading: `Adverbs: ${page.title}`,
  html: INTRO + adverbTable(adverbs.filter((a) => a.topic === page.id)),
  title: page.title,
}));
