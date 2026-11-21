// Renders the French Basics page from dictionary/fr/basics.csv, one subpage at
// a time, picked by the address: fr/basics.html#articles.
import { TOPICS, BASICS_PAGES, basicsRows, basicsCardId, presentCards } from "../basics.js";
import { grammarPage, colour } from "../../../pages/grammar-page.js";
import { escape, md, table } from "../../../pages/page-helpers.js";

// French | English, with the note (if any) in small type under the English.
function wordTable(rows) {
  return table("words", ["French", "English"], rows.map((r) => ({
    attrs: colour(basicsCardId(r.topic, r.french)),
    cells: [
      `<td class="it" lang="fr">${escape(r.french)}</td>`,
      `<td>${escape(r.english)}${r.note ? `<div class="row-note">${md(r.note)}</div>` : ""}</td>`,
    ],
  })));
}

// je suis | I am, from the verb dictionary.
function presentTable(infinitive) {
  return table("words", ["Présent", "English"], presentCards(infinitive).map((c) => ({
    attrs: colour(c.id),
    cells: [`<td class="it" lang="fr">${escape(c.it)}</td>`, `<td>${escape(c.en)}</td>`],
  })));
}

function topicSection(topic, withHeading) {
  const rows = basicsRows.filter((r) => r.topic === topic.id);
  return (withHeading ? `<h2>${topic.title}</h2>` : "") +
    (topic.intro ? `<p>${md(topic.intro)}</p>` : "") +
    (topic.verb ? presentTable(topic.verb) : wordTable(rows));
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
