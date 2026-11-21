// Renders the French Adjectives page from dictionary/fr/adjectives.csv, one
// subpage at a time (fr/adjectives.html#colours): the four forms, coloured by
// your ratings; and a reference page on comparison and where adjectives go.
import { adjectives, ADJECTIVE_PAGES, adjectiveForms, cardsOf } from "../adjectives.js";
import { grammarPage, colour } from "../../../pages/grammar-page.js";
import { escape, md, table } from "../../../pages/page-helpers.js";

function adjectiveTable(rows) {
  return table("conj adjectives", ["Masculine", "Feminine", "Plural (m.)", "Plural (f.)", "English"], rows.map((a) => {
    const f = adjectiveForms(a);
    const ids = new Map(cardsOf(a).map((c) => [c.it, c.id])); // colour each form by its card
    const cell = (form) => `<td${ids.has(form) ? colour(ids.get(form)) : ""} lang="fr">${escape(form)}</td>`;
    return [cell(f.msg), cell(f.fsg), cell(f.mpl), cell(f.fpl),
      `<td class="en">${escape(a.english)}${a.note ? `<div class="row-note">${md(a.note)}</div>` : ""}</td>`];
  }));
}

const INTRO = `<p>An adjective agrees with its noun: <em>un grand jardin, une grande maison, de grands jardins,
  de grandes maisons</em>. The feminine adds <em>-e</em> (silent letters at the end may then be heard:
  <em>petit, petite</em>), unless it already ends in <em>-e</em>. Common patterns: <em>-eux → -euse</em>,
  <em>-if → -ive</em>, <em>-er → -ère</em>, <em>-on → -onne</em>, <em>-el → -elle</em>, <em>-et → -ette</em>.
  The plural adds a silent <em>-s</em>; <em>-al</em> becomes <em>-aux</em>.</p>`;

const REFERENCE = `
  <h2>Comparison</h2>
  <p><em>plus … que</em> = more … than, <em>moins … que</em> = less … than, <em>aussi … que</em> = as … as:
    <em>Il est plus grand que moi.</em> The superlative takes the article: <em>le plus grand</em>,
    <em>la plus belle</em>. Irregular: <em>bon → meilleur → le meilleur</em> (better, the best),
    and the adverb <em>bien → mieux → le mieux</em>. <em>mauvais → pire</em> (worse) or <em>plus mauvais</em>.</p>
  <h2>Before or after the noun</h2>
  <p>Most adjectives go after the noun: <em>une voiture rouge, un film intéressant</em>. A few short, common
    ones go before it: beauty, age, goodness and size: <em>beau, joli, jeune, vieux, nouveau, bon, mauvais,
    grand, petit, gros</em>: <em>un petit café, une belle journée</em>.</p>
  <p>Some change their meaning with their place: <em>un homme grand</em> (a tall man) / <em>un grand homme</em>
    (a great man); <em>ma propre voiture</em> (my own car) / <em>une voiture propre</em> (a clean car);
    <em>le pauvre garçon</em> (the poor, pitiable boy) / <em>un garçon pauvre</em> (a boy without money).</p>
  <p><em>beau, nouveau, vieux</em> become <em>bel, nouvel, vieil</em> before a masculine noun starting with a
    vowel: <em>un bel appartement, un vieil ami</em>.</p>`;

grammarPage("adjectives", ADJECTIVE_PAGES, (page) => ({
  heading: `Adjectives: ${page.title}`,
  html: page.id === "comparison" ? REFERENCE : INTRO + adjectiveTable(adjectives.filter((a) => a.topic === page.id)),
  title: page.title,
}));
