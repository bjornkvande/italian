// Renders the French Nouns page from dictionary/fr/nouns.csv: one theme at a
// time (fr/nouns.html#food), singular and plural with their articles, coloured
// by your ratings.
import { nouns, NOUN_PAGES, nounForms, nounCardId } from "../nouns.js";
import { grammarPage, colour } from "../../../pages/grammar-page.js";
import { escape, md, table } from "../../../pages/page-helpers.js";

function nounTable(rows) {
  return table("conj nouns", ["Singular", "Plural", "English"], rows.map((n) => {
    const f = nounForms(n);
    return [
      `<td${colour(nounCardId(n), "it")} lang="fr">${escape(f.singular)}</td>`,
      f.plural ? `<td${colour(nounCardId(n, true))} lang="fr">${escape(f.plural)}</td>` : "<td>—</td>",
      `<td class="en">${escape(n.english)}${n.note ? `<div class="row-note">${md(n.note)}</div>` : ""}</td>`,
    ];
  }));
}

const INTRO = `<p>Every noun is masculine (<em>le</em>) or feminine (<em>la</em>); <em>l'</em> before a vowel or
  a silent <em>h</em>, and <em>les</em> in the plural (see <a href="basics.html#articles">Basics: Articles</a>).
  Most plurals add a silent <em>-s</em>. Nouns in <em>-s, -x, -z</em> don't change (<em>le bras, les bras</em>),
  <em>-au, -eau, -eu</em> add <em>-x</em> (<em>les cadeaux, les jeux</em>), and <em>-al</em> becomes <em>-aux</em>
  (<em>l'hôpital, les hôpitaux</em>). Endings that are usually feminine: <em>-tion, -té, -ure, -ette</em>.
  A dash means the noun is normally not used in the plural.</p>`;

grammarPage("nouns", NOUN_PAGES, (page) => ({
  heading: `Nouns: ${page.title}`,
  html: INTRO + nounTable(nouns.filter((n) => n.topic === page.id)),
  title: page.title,
}));
