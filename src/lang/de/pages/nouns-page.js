// Renders the German Nouns page from dictionary/de/nouns.csv: one theme at a
// time (de/nouns.html#food), singular and plural with their articles, coloured
// by your ratings.
import { nouns, NOUN_PAGES, nounForms, nounCardId } from "../nouns.js";
import { grammarPage, colour } from "../../../pages/grammar-page.js";
import { escape, md, table } from "../../../pages/page-helpers.js";

function nounTable(rows) {
  return table("conj nouns", ["Singular", "Plural", "English"], rows.map((n) => {
    const f = nounForms(n);
    return [
      `<td${colour(nounCardId(n), "it")} lang="de">${escape(f.singular)}</td>`,
      f.plural ? `<td${colour(nounCardId(n, true))} lang="de">${escape(f.plural)}</td>` : "<td>—</td>",
      `<td class="en">${escape(n.english)}${n.note ? `<div class="row-note">${md(n.note)}</div>` : ""}</td>`,
    ];
  }));
}

const INTRO = `<p>Every noun is masculine (<em>der</em>), feminine (<em>die</em>) or neuter (<em>das</em>),
  and is written with a capital letter. Learn the article and the plural with the noun; the plural
  article is always <em>die</em>. A few endings tell the gender: <em>-ung, -heit, -keit, -ion, -tät</em>
  are feminine, <em>-chen</em> and <em>-lein</em> neuter. Common plurals: <em>-e</em> (Tisch → Tische),
  <em>-(e)n</em> (Frage → Fragen), <em>-er</em> with umlaut (Haus → Häuser), <em>-s</em> (Auto → Autos),
  and no ending after <em>-er, -el, -en</em> (Zimmer → Zimmer), sometimes with umlaut (Vater → Väter).
  A dash means the noun is normally not used in the plural.</p>`;

grammarPage("nouns", NOUN_PAGES, (page) => ({
  heading: `Nouns: ${page.title}`,
  html: INTRO + nounTable(nouns.filter((n) => n.topic === page.id)),
  title: page.title,
}));
