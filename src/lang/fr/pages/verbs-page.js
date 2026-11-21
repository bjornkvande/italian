// Renders a French verb page (fr/er.html, ir, re, irregular) from
// dictionary/fr/verbs-*.csv. Which page comes from <body data-page>.
import "../../../core/pwa.js";
import { verbs } from "../verbs.js";
import { TENSES, PRONOUNS, ENDINGS, PARTICIPLE_ENDING, AVOIR, form, participle, cardsFor, verbCardId } from "../conjugate.js";
import { legendHTML, rerenderOnRatingChanges } from "../../../pages/rating-colors.js";
import { escape, md, table, ratingColours } from "../../../pages/page-helpers.js";
import { PAGES } from "../verb-pages.js";
import { renderGrammarNav } from "../../../core/nav.js";
import { addFooter } from "../../../pages/footer.js";
import { LANGUAGE, chooseLanguage } from "../../../core/language.js";

const colours = ratingColours();
const colour = colours.colour;
const TENSE_HEAD = ["", ...TENSES.map(([, name]) => name)];

function tensesList() {
  const item = (name, text) => `<li><strong>${name}</strong> — ${md(text)}</li>`;
  return `<ul class="tenses">
    ${item("Présent", "the present: what happens now and habits. *Je travaille à Paris.* Also *I am working*: there is no separate *-ing* form.")}
    ${item("Passé composé", "the everyday spoken past: *avoir* + participle (*j'ai mangé*). Verbs of movement and change take *être*, and the participle agrees like an adjective: *elle est allée, nous sommes partis*.")}
    ${item("Imparfait", "the past for descriptions, habits and ongoing actions (*used to*, *was …ing*): *Quand j'étais petit, je jouais au foot.*")}
    ${item("Futur simple", "the future: *Je partirai demain.* In speech *aller* + infinitive is common: *Je vais partir.*")}
    ${item("Conditionnel", "*would*: polite requests and wishes: *Je voudrais un café.* · *Tu pourrais m'aider ?*")}
    ${item("Impératif", "commands, for *tu*, *nous* (*let's*) and *vous* (plural and polite), without the pronoun: *Viens !* · *Allons-y !* · *Écoutez !* The *tu* form of *-er* verbs has no *-s*: *Parle !*")}
  </ul>
  <p>*je* becomes *j'* before a vowel or a silent *h*: *j'aime, j'habite, j'ai parlé*. The *il/elle* row is also *on*.</p>`.replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function patternTable(group) {
  const pres = ENDINGS[group].present;
  const rows = PRONOUNS.map((p, i) => [
    `<th>${p}</th>`,
    `<td>-${pres[i] || "—"}</td>`,
    `<td>${AVOIR[i]} -${PARTICIPLE_ENDING[group]}</td>`,
    `<td>-${ENDINGS.imparfait[i]}</td>`,
    `<td>${group === "re" ? "-r" : "-" + group + "-"}${ENDINGS.futur[i]}</td>`,
    `<td>${group === "re" ? "-r" : "-" + group + "-"}${ENDINGS.conditionnel[i]}</td>`,
    `<td>${[1, 3, 4].includes(i) ? "-" + (group === "er" && i === 1 ? "e" : pres[i]) : "—"}</td>`,
  ]);
  return table("conj", TENSE_HEAD, rows);
}

function indexTable(list) {
  return table("index", ["#", "Verb", "English", "Passé composé (je)"], list.map((v, i) => [
    `<td>${i + 1}</td>`,
    `<td${colour(verbCardId(v.infinitive, "infinitif"))}><a href="#${v.infinitive}">${v.infinitive}</a></td>`,
    `<td>${escape(v.english)}</td>`,
    `<td>${v.impersonal ? `il ${form(v, "passe", 2)}` : form(v, "passe", 0)}</td>`,
  ]));
}

function verbSection(v, n) {
  const cardIds = new Set(cardsFor(v).map((c) => c.id));
  const cell = (tense, i) => {
    const id = verbCardId(v.infinitive, tense, i);
    return `<td${cardIds.has(id) ? colour(id) : ""}>${form(v, tense, i) ?? "—"}</td>`;
  };
  const rows = PRONOUNS.map((p, i) => [`<th>${v.impersonal && i === 2 ? "il" : p}</th>`, ...TENSES.map(([t]) => cell(t, i))]);
  return `
    <h3 id="${v.infinitive}">${n}. ${v.infinitive} — <em>${escape(v.english)}</em></h3>
    <p class="info"><strong>Participe passé:</strong> ${participle(v)} · <strong>Auxiliaire:</strong> ${v.auxiliary}</p>
    ${v.note ? `<p class="note">${md(v.note)}</p>` : ""}
    ${table("conj", TENSE_HEAD, rows)}
    <a class="back-to-top" href="#top">↑ Index</a>`;
}

function render(page, firstTime = false) {
  colours.refresh();
  const list = verbs.filter((v) => page.groups.includes(v.group));
  let html = `<h1>${page.title(list.length)}</h1>${legendHTML()}`;
  html += page.intro.map((p) => `<p>${md(p)}</p>`).join("");
  html += `<h2>The tenses</h2>${tensesList()}`;
  if (page.pattern) {
    const { group, verb, stem } = page.pattern;
    html += `<h2>The pattern (${verb})</h2><p>${md(`Endings added to the stem (*${stem}*); the future and conditional add them to the infinitive${group === "re" ? " without its *-e*" : ""}:`)}</p>${patternTable(group)}`;
  }
  html += `<h2 id="top">Index</h2>${indexTable(list)}<h2>Conjugations</h2>`;
  html += list.map((v, i) => verbSection(v, i + 1)).join("");
  document.getElementById("content").innerHTML = html;
  document.title = `${LANGUAGE.name} – ${page.title(list.length)}`;
  if (firstTime && location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
}

const pageId = document.body.dataset.page;
renderGrammarNav(document.getElementById("nav"), "verbs", pageId);
chooseLanguage(LANGUAGE.code); // "Train on Verbs" then trains French
render(PAGES[pageId], true);
addFooter();
rerenderOnRatingChanges(() => render(PAGES[pageId]));
