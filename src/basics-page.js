// Renders the Basics page from dictionary/basics.csv (and essere/avere from the verbs).
// One subpage at a time, picked by the address: basics.html#prepositions.
import "./pwa.js";
import { TOPICS, BASICS_PAGES, basicsRows, presenteCards, basicsCardId } from "./basics.js";
import { renderGrammarNav, subpageFromHash } from "./nav.js";
import { legendHTML, rerenderOnRatingChanges } from "./rating-colors.js";
import { escape, md, table, ratingColours } from "./page-helpers.js";

const colours = ratingColours();
const colour = colours.colour;


// Italian | English, with the note (if any) in small type under the English.
function wordTable(rows) {
  return table("words", ["Italian", "English"], rows.map((r) => ({
    attrs: colour(basicsCardId(r.topic, r.italian)),
    cells: [
      `<td class="it">${escape(r.italian)}</td>`,
      `<td>${escape(r.english)}${r.note ? `<div class="row-note">${md(r.note)}</div>` : ""}</td>`,
    ],
  })));
}

// io sono | I am, from the verb dictionary.
function presenteTable(infinitive) {
  return table("words", ["Presente", "English"], presenteCards(infinitive).map((c) => ({
    attrs: colour(c.id),
    cells: [`<td class="it">${escape(c.it)}</td>`, `<td>${escape(c.en)}</td>`],
  })));
}

// Prepositions + article as a grid: rows di, a, da, in, su (with their meaning);
// columns il, lo, l', ... The english column reads "di + il = of the".
function articulatedTable(rows) {
  const parts = rows.map((r) => {
    const [build, meaning] = r.english.split(" = ");
    const [prep, art] = build.split(" + ");
    return { form: r.italian, prep, art, meaning };
  });
  const preps = [...new Set(parts.map((p) => p.prep))];
  const arts = [...new Set(parts.map((p) => p.art))];
  const cell = (prep, art) => {
    const form = parts.find((p) => p.prep === prep && p.art === art)?.form;
    return form ? `<td${colour(basicsCardId("articulated", form))}>${escape(form)}</td>` : "<td>—</td>";
  };
  const meaningOf = (prep) => parts.find((p) => p.prep === prep).meaning;
  return table("conj", ["", ...arts], preps.map((prep) => [
    `<th>${prep}<div class="row-note">${escape(meaningOf(prep))}</div></th>`,
    ...arts.map((art) => cell(prep, art)),
  ]));
}

const topicById = (id) => TOPICS.find((t) => t.id === id);

// Pronoun | meaning | example | English, coloured by the example's card.
function pronounTable(rows) {
  return table("words pronouns", ["Pronoun", "Meaning", "Example", "English"], rows.map((r) => ({
    attrs: colour(basicsCardId(r.topic, r.italian)),
    cells: [
      `<td class="it">${escape(r.pronoun)}</td>`,
      `<td>${escape(r.meaning)}</td>`,
      `<td class="it">${escape(r.italian)}</td>`,
      `<td>${escape(r.english)}${r.note ? `<div class="row-note">${md(r.note)}</div>` : ""}</td>`,
    ],
  })));
}

function topicSection(topic, withHeading) {
  const rows = basicsRows.filter((r) => r.topic === topic.id);
  let html = withHeading ? `<h2>${topic.title}</h2>` : "";
  if (topic.verb) html += presenteTable(topic.verb);
  if (topic.pronouns) {
    html += pronounTable(rows);
  } else if (topic.id === "articulated") {
    html += `<p>The prepositions <em>di, a, da, in, su</em> merge with the article that follows: <em>di + il → del</em>.</p>`;
    html += articulatedTable(rows);
  } else if (rows.length) {
    if (topic.id === "place") {
      html += `<p>On their own they say where (<em>aspetto fuori</em>); before a noun most of them take
        <em>a</em>, <em>di</em> or <em>da</em>, shown in brackets (<em>davanti alla stazione</em>).</p>`;
    }
    html += wordTable(rows);
  }
  return html;
}

// The subpage named in the address, or the one used last.
const currentPage = () => BASICS_PAGES.find((p) => p.id === subpageFromHash("basics"));

function render() {
  colours.refresh();
  const page = currentPage();
  renderGrammarNav(document.getElementById("nav"), "basics", page.id);
  // A subpage with one topic uses that topic's title as the page heading
  // ("Essere – to be") instead of repeating it below.
  const single = page.topics.length === 1;
  const heading = single ? topicById(page.topics[0]).title : page.label;
  document.getElementById("content").innerHTML =
    `<h1>Basics: ${heading}</h1>${legendHTML()}` +
    page.topics.map((id) => topicSection(topicById(id), !single)).join("");
  document.title = `Italiano – ${page.label}`;
}

// Switching subpage only changes the #part of the address.
window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });
render();
rerenderOnRatingChanges(render);
