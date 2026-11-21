// Renders the German Basics page from dictionary/de/basics.csv, one subpage at
// a time, picked by the address: de/basics.html#articles.
import { TOPICS, BASICS_PAGES, basicsRows, basicsCardId } from "../basics.js";
import { grammarPage, colour } from "../../../pages/grammar-page.js";
import { escape, md, table } from "../../../pages/page-helpers.js";

// German | English, with the note (if any) in small type under the English.
function wordTable(rows) {
  return table("words", ["German", "English"], rows.map((r) => ({
    attrs: colour(basicsCardId(r.topic, r.german)),
    cells: [
      `<td class="it" lang="de">${escape(r.german)}</td>`,
      `<td>${escape(r.english)}${r.note ? `<div class="row-note">${md(r.note)}</div>` : ""}</td>`,
    ],
  })));
}

function topicSection(topic, withHeading) {
  const rows = basicsRows.filter((r) => r.topic === topic.id);
  return (withHeading ? `<h2>${topic.title}</h2>` : "") +
    (topic.intro ? `<p>${md(topic.intro)}</p>` : "") +
    wordTable(rows);
}

const topicById = (id) => TOPICS.find((t) => t.id === id);

grammarPage("basics", BASICS_PAGES, (page) => {
  // A subpage with one topic uses that topic's title as the page heading.
  const single = page.topics.length === 1;
  return {
    heading: `Basics: ${single ? topicById(page.topics[0]).title : page.label}`,
    html: page.topics.map((id) => topicSection(topicById(id), !single)).join(""),
    title: page.label,
  };
});
