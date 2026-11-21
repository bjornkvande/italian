// Renders the German Adjectives page from dictionary/de/adjectives.csv, one
// subpage at a time (de/adjectives.html#colours): base form, comparative and
// superlative, coloured by your ratings; and a reference page with the rules
// of comparison and the endings before a noun.
import { adjectives, ADJECTIVE_PAGES, comparative, superlative, adjectiveCardId } from "../adjectives.js";
import { grammarPage, colour } from "../../../pages/grammar-page.js";
import { escape, md, table } from "../../../pages/page-helpers.js";

function adjectiveTable(rows) {
  return table("conj adjectives", ["Adjective", "Comparative", "Superlative", "English"], rows.map((a) => [
    `<td${colour(adjectiveCardId(a), "it")} lang="de">${escape(a.adjective)}</td>`,
    comparative(a) ? `<td${colour(adjectiveCardId(a, "comp"))} lang="de">${escape(comparative(a))}</td>` : "<td>—</td>",
    superlative(a) ? `<td${colour(adjectiveCardId(a, "sup"))} lang="de">${escape(superlative(a))}</td>` : "<td>—</td>",
    `<td class="en">${escape(a.english)}${a.note ? `<div class="row-note">${md(a.note)}</div>` : ""}</td>`,
  ]));
}

const INTRO = `<p>After <em>sein</em>, <em>werden</em> and <em>bleiben</em> an adjective never changes:
  <em>Das Haus ist groß.</em> Before a noun it takes an ending (see
  <a href="#endings">Comparison &amp; endings</a>).</p>`;

// The endings before a noun, by what comes before the adjective.
const ENDINGS = [
  ["After der, die, das (dieser, jeder…)", [
    ["Nominative", "der große Tisch", "die große Tür", "das große Haus", "die großen Häuser"],
    ["Accusative", "den großen Tisch", "die große Tür", "das große Haus", "die großen Häuser"],
    ["Dative", "dem großen Tisch", "der großen Tür", "dem großen Haus", "den großen Häusern"],
  ]],
  ["After ein, kein, mein…", [
    ["Nominative", "ein großer Tisch", "eine große Tür", "ein großes Haus", "keine großen Häuser"],
    ["Accusative", "einen großen Tisch", "eine große Tür", "ein großes Haus", "keine großen Häuser"],
    ["Dative", "einem großen Tisch", "einer großen Tür", "einem großen Haus", "keinen großen Häusern"],
  ]],
  ["Without an article", [
    ["Nominative", "kalter Kaffee", "kalte Milch", "kaltes Wasser", "kalte Getränke"],
    ["Accusative", "kalten Kaffee", "kalte Milch", "kaltes Wasser", "kalte Getränke"],
    ["Dative", "kaltem Kaffee", "kalter Milch", "kaltem Wasser", "kalten Getränken"],
  ]],
];

const REFERENCE = `
  <h2>Comparison</h2>
  <p>Comparative: <em>-er</em> (<em>klein → kleiner</em>); superlative: <em>am</em> + <em>-sten</em>
    (<em>am kleinsten</em>), <em>-esten</em> after <em>d, t, s, ß, z, sch</em> (<em>am ältesten</em>).
    Many short adjectives add an umlaut: <em>alt → älter, groß → größer, jung → jünger</em>.
    Irregular: <em>gut → besser → am besten</em>, <em>viel → mehr → am meisten</em>,
    <em>gern → lieber → am liebsten</em>, <em>hoch → höher → am höchsten</em>, <em>nah → näher → am nächsten</em>.</p>
  <p><em>als</em> = than: <em>Er ist älter als ich.</em> · <em>so … wie</em> = as … as:
    <em>Sie ist so groß wie ihr Bruder.</em> Before a noun the superlative takes the article and an ending:
    <em>der größte Tisch</em>.</p>
  <h2>Endings before a noun</h2>
  <p>The article already shows the gender and case, so after <em>der/die/das</em> the ending is just
    <em>-e</em> or <em>-en</em>. After <em>ein</em> (which has no ending in three places) the adjective shows
    the gender instead: <em>ein großer Tisch, ein großes Haus</em>. Without an article, the adjective takes
    the endings of <em>der/die/das</em>: <em>kalter Kaffee</em>.</p>
  ${ENDINGS.map(([title, rows]) => `<h3>${title}</h3>` + table("conj", ["", "Masculine", "Feminine", "Neuter", "Plural"],
    rows.map(([kase, ...cells]) => [`<th>${kase}</th>`, ...cells.map((c) => `<td lang="de">${c}</td>`)]))).join("")}`;

grammarPage("adjectives", ADJECTIVE_PAGES, (page) => ({
  heading: `Adjectives: ${page.title}`,
  html: page.id === "endings" ? REFERENCE : INTRO + adjectiveTable(adjectives.filter((a) => a.topic === page.id)),
  title: page.title,
}));
