// Renders the Adjectives page from dictionary/adjectives.csv: one subpage at a
// time (adjectives.html#colours), each form coloured by your ratings.
import {
  adjectives, ADJECTIVE_PAGES, COMPARISON_TOPICS, comparisons, adjectiveForms, adjectiveCardId, comparisonCardId,
} from "./adjectives.js";
import { grammarPage, colour } from "./grammar-page.js";
import { escape, md, table } from "./page-helpers.js";

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

// The Comparison subpage: a table per section, Italian | English.
function comparisonSection(topic) {
  const rows = comparisons.filter((r) => r.topic === topic.id);
  return `<h2>${topic.title}</h2>` + table("words", ["Italian", "English"], rows.map((r) => ({
    attrs: colour(comparisonCardId(r)),
    cells: [
      `<td class="it">${escape(r.italian)}</td>`,
      `<td>${escape(r.english)}${r.note ? `<div class="row-note">${md(r.note)}</div>` : ""}${
        r.from ? `<div class="row-note">from <em>${escape(r.from)}</em></div>` : ""}</td>`,
    ],
  })));
}

const INTRO = `<p>Adjectives agree with the noun in gender and number. Most end in <em>-o</em> and have
  four forms (<em>rosso, rossa, rossi, rosse</em>); those ending in <em>-e</em> have two
  (<em>grande, grandi</em>); a few never change (<em>blu, rosa</em>).</p>`;

grammarPage("adjectives", ADJECTIVE_PAGES, (page) => ({
  heading: `Adjectives: ${page.title}`,
  html: page.id === "comparison"
    ? COMPARISON_TOPICS.map(comparisonSection).join("")
    : INTRO + adjectiveTable(adjectives.filter((a) => a.topic === page.id)),
  title: page.title,
}));
