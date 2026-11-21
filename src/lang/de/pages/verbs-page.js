// Renders a German verb page (de/regular.html, irregular, separable, modal)
// from dictionary/de/verbs-*.csv. Which page comes from <body data-page>.
import "../../../core/pwa.js";
import { verbs } from "../verbs.js";
import { TENSES, PRONOUNS, form, participle, cardsFor, verbCardId } from "../conjugate.js";
import { legendHTML, rerenderOnRatingChanges } from "../../../pages/rating-colors.js";
import { escape, md, table, ratingColours } from "../../../pages/page-helpers.js";
import { PAGES } from "../verb-pages.js";
import { renderGrammarNav } from "../../../core/nav.js";
import { addFooter } from "../../../pages/footer.js";
import { LANGUAGE, chooseLanguage } from "../../../core/language.js";

const colours = ratingColours();
const colour = colours.colour;
const TENSE_HEAD = ["", ...TENSES.map(([, name]) => name)];
const pastOf = (v) => form(v, "praeteritum", 2);
const participleOf = (v) => (v.group === "modal" ? v.participle : participle(v));

function tensesList() {
  const item = (name, text) => `<li><strong>${name}</strong> — ${md(text)}</li>`;
  return `<ul class="tenses">
    ${item("Präsens", "the present: what happens now, habits, and very often the future: *Morgen fahre ich nach Berlin.*")}
    ${item("Perfekt", "the everyday spoken past: *haben* or *sein* + participle. *sein* for movement and change (*gehen, kommen, fahren, bleiben, werden*), *haben* for the rest. *Ich habe Pizza gegessen.* · *Wir sind nach Hause gegangen.*")}
    ${item("Präteritum", "the written past, used in speech mainly for *sein*, *haben* and the modal verbs: *Ich war müde.* · *Ich musste arbeiten.*")}
    ${item("Konjunktiv II", "*would*: wishes, polite requests and what isn't real. Most verbs use *würde* + infinitive: *Ich würde gern kommen.* *sein, haben* and the modals have their own forms: *wäre, hätte, könnte*. A few common verbs have short forms too, mostly in writing: *käme, ginge, es gäbe* (there would be).")}
    ${item("Imperativ", "commands and requests, for *du* (*Komm!*), *ihr* (*Kommt!*) and the polite *Sie* (*Kommen Sie!*). *bitte* makes it polite: *Komm bitte!*")}
  </ul>
  <p>The *sie* row is also the polite *Sie* (you): *Sie sprechen* = they speak / you speak.</p>`;
}

function patternTable() {
  const endings = {
    praesens: ["-e", "-st", "-t", "-en", "-t", "-en"],
    perfekt: ["habe ge-…-t", "hast ge-…-t", "hat ge-…-t", "haben ge-…-t", "habt ge-…-t", "haben ge-…-t"],
    praeteritum: ["-te", "-test", "-te", "-ten", "-tet", "-ten"],
    konjunktiv: ["würde …", "würdest …", "würde …", "würden …", "würdet …", "würden …"],
    imperativ: ["—", "…!", "—", "—", "-t!", "-en Sie!"],
  };
  return table("conj", TENSE_HEAD, PRONOUNS.map((p, i) => [`<th>${p}</th>`, ...TENSES.map(([t]) => `<td>${endings[t][i]}</td>`)]));
}

function indexTable(list) {
  return table("index", ["#", "Verb", "English", "Präteritum", "Perfekt"], list.map((v, i) => [
    `<td>${i + 1}</td>`,
    `<td${colour(verbCardId(v.infinitive, "infinitiv"))}><a href="#${v.infinitive}">${v.infinitive}</a></td>`,
    `<td>${escape(v.english)}</td>`,
    `<td>${pastOf(v) ?? "—"}</td>`,
    `<td>${participleOf(v) ? `${v.auxiliary === "sein" ? "ist" : v.auxiliary === "haben" ? "hat" : "ist/hat"} ${participleOf(v)}` : "—"}</td>`,
  ]));
}

function verbSection(v, n) {
  const cardIds = new Set(cardsFor(v).map((c) => c.id));
  const cell = (tense, i) => {
    const id = verbCardId(v.infinitive, tense, i);
    const f = v.impersonal && i !== 2 ? null : form(v, tense, i);
    return `<td${cardIds.has(id) ? colour(id) : ""}>${f ?? "—"}</td>`;
  };
  const rows = PRONOUNS.map((p, i) => [`<th>${v.impersonal && i === 2 ? "es" : p}</th>`, ...TENSES.map(([t]) => cell(t, i))]);
  const info = [
    v.prefix ? `<strong>Prefix:</strong> ${v.prefix}-` : "",
    `<strong>Präteritum:</strong> ${pastOf(v) ?? "—"}`,
    `<strong>Partizip II:</strong> ${participleOf(v) ?? "—"}`,
    `<strong>Hilfsverb:</strong> ${v.auxiliary}`,
  ].filter(Boolean).join(" · ");
  return `
    <h3 id="${v.infinitive}">${n}. ${v.infinitive} — <em>${escape(v.english)}</em></h3>
    <p class="info">${info}</p>
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
  if (page.pattern) html += `<h2>The pattern (${page.pattern})</h2><p>${md("Endings added to the stem (*mach-*):")}</p>${patternTable()}`;
  html += `<h2 id="top">Index</h2>${indexTable(list)}<h2>Conjugations</h2>`;
  html += list.map((v, i) => verbSection(v, i + 1)).join("");
  document.getElementById("content").innerHTML = html;
  document.title = `${LANGUAGE.name} – ${page.title(list.length)}`;
  if (firstTime && location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
}

const pageId = document.body.dataset.page;
renderGrammarNav(document.getElementById("nav"), "verbs", pageId);
chooseLanguage(LANGUAGE.code); // "Train on Verbs" then trains German
render(PAGES[pageId], true);
addFooter();
rerenderOnRatingChanges(() => render(PAGES[pageId]));
