// Renders the Basics page from dictionary/basics.csv (and essere/avere from the verbs).
// One subpage at a time, picked by the address: basics.html#prepositions.
import "./pwa.js";
import { TOPICS, BASICS_PAGES, basicsRows, presenteCards, basicsCardId } from "./basics.js";
import { renderNav, lastPage } from "./nav.js";
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

// Prepositions + article as a grid: rows di, a, da, in, su; columns il, lo, l', ...
function articulatedTable(rows) {
  const parts = rows.map((r) => ({ form: r.italian, prep: r.english.split(" + ")[0], art: r.english.split(" + ")[1] }));
  const preps = [...new Set(parts.map((p) => p.prep))];
  const arts = [...new Set(parts.map((p) => p.art))];
  const cell = (prep, art) => {
    const form = parts.find((p) => p.prep === prep && p.art === art)?.form;
    return form ? `<td${colour(basicsCardId("articulated", form))}>${escape(form)}</td>` : "<td>—</td>";
  };
  return table("conj", ["", ...arts], preps.map((prep) => [`<th>${prep}</th>`, ...arts.map((art) => cell(prep, art))]));
}

const topicById = (id) => TOPICS.find((t) => t.id === id);

function topicSection(topic, withHeading) {
  const rows = basicsRows.filter((r) => r.topic === topic.id);
  let html = withHeading ? `<h2>${topic.title}</h2>` : "";
  if (topic.verb) html += presenteTable(topic.verb);
  if (topic.id === "articulated") {
    html += `<p>The prepositions <em>di, a, da, in, su</em> merge with the article that follows: <em>di + il → del</em>.</p>`;
    html += articulatedTable(rows);
  } else if (rows.length) {
    html += wordTable(rows);
  }
  return html;
}

// The subpage named in the address, or the one used last.
function currentPage() {
  const id = decodeURIComponent(location.hash.slice(1));
  return BASICS_PAGES.find((p) => p.id === id) ?? BASICS_PAGES.find((p) => p.id === lastPage("basics").id);
}

function render() {
  colours.refresh();
  const page = currentPage();
  renderNav(document.getElementById("nav"), "basics", page.id);
  // A subpage with one topic uses that topic's title as the page heading
  // ("Essere – to be") instead of repeating it below.
  const single = page.topics.length === 1;
  const heading = single ? topicById(page.topics[0]).title : page.label;
  document.getElementById("content").innerHTML =
    `<h1>Basics: ${heading}</h1>${legendHTML()}` +
    page.topics.map((id) => topicSection(topicById(id), !single)).join("");
  document.title = `Basics – ${page.label}`;
}

// Switching subpage only changes the #part of the address.
window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });
render();
rerenderOnRatingChanges(render);
