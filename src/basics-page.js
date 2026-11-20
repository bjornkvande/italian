// Renders the Basics page from dictionary/basics.csv (and essere/avere from the verbs).
import "./pwa.js";
import { TOPICS, basicsRows, presenteCards } from "./basics.js";
import { renderNav } from "./nav.js";

const escape = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// Inline Markdown: **bold** and *italic*.
const md = (s) => escape(s)
  .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  .replace(/\*(.+?)\*/g, "<em>$1</em>");

const table = (cls, head, rows) => `
  <div class="table-wrap"><table class="${cls}">
    ${head ? `<thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead>` : ""}
    <tbody>${rows.map((r) => `<tr>${r.join("")}</tr>`).join("")}</tbody>
  </table></div>`;

// Italian | English, with the note (if any) in small type under the English.
function wordTable(rows) {
  return table("words", ["Italian", "English"], rows.map((r) => [
    `<td class="it">${escape(r.italian)}</td>`,
    `<td>${escape(r.english)}${r.note ? `<div class="row-note">${md(r.note)}</div>` : ""}</td>`,
  ]));
}

// io sono | I am, from the verb dictionary.
function presenteTable(infinitive) {
  return table("words", ["Presente", "English"], presenteCards(infinitive).map((c) => [
    `<td class="it">${escape(c.it)}</td>`, `<td>${escape(c.en)}</td>`,
  ]));
}

// Prepositions + article as a grid: rows di, a, da, in, su; columns il, lo, l', ...
function articulatedTable(rows) {
  const parts = rows.map((r) => ({ form: r.italian, prep: r.english.split(" + ")[0], art: r.english.split(" + ")[1] }));
  const preps = [...new Set(parts.map((p) => p.prep))];
  const arts = [...new Set(parts.map((p) => p.art))];
  const cell = (prep, art) => parts.find((p) => p.prep === prep && p.art === art)?.form ?? "—";
  return table("conj", ["", ...arts], preps.map((prep) => [
    `<th>${prep}</th>`, ...arts.map((art) => `<td>${escape(cell(prep, art))}</td>`),
  ]));
}

function render() {
  let html = `<h1 id="top">Basics</h1>
    <p>The small words you need in every sentence: pronouns, <em>essere</em> and <em>avere</em>,
    prepositions, question words, numbers and everyday phrases. Practise them on the Train page
    with the <strong>Basics</strong> level.</p>
    <ul class="contents">${TOPICS.map((t) => `<li><a href="#${t.id}">${t.title}</a></li>`).join("")}</ul>`;

  for (const topic of TOPICS) {
    const rows = basicsRows.filter((r) => r.topic === topic.id);
    html += `<h2 id="${topic.id}">${topic.title}</h2>`;
    if (topic.verb) html += presenteTable(topic.verb);
    if (topic.id === "articulated") {
      html += `<p>The prepositions <em>di, a, da, in, su</em> merge with the article that follows: <em>di + il → del</em>.</p>`;
      html += articulatedTable(rows);
    } else if (rows.length) {
      html += wordTable(rows);
    }
    html += `<a class="back-to-top" href="#top">↑ Contents</a>`;
  }

  document.getElementById("content").innerHTML = html;
  if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
}

renderNav(document.getElementById("nav"), "basics");
render();
