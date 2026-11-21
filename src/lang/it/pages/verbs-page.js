// Renders an -are / -ere / -ire / irregular reference page from the CSV files in dictionary/.
// Which page to build comes from <body data-page="are|ere|ire|irregular">.
import "../../../core/pwa.js";
import { verbs } from "../verbs.js";
import {
  ENDINGS, PARTICIPLE_ENDING, TENSES, PRONOUNS, AVERE,
  form, participle, gerund, passatoProssimo, spellingNote, cardsFor, verbCardId,
} from "../conjugate.js";
import { legendHTML, rerenderOnRatingChanges } from "../../../pages/rating-colors.js";
import { escape, md, table, ratingColours } from "../../../pages/page-helpers.js";
import { PAGES } from "../verb-pages.js";
import { renderGrammarNav } from "../../../core/nav.js";
import { addFooter } from "../../../pages/footer.js";
import { chooseLanguage } from "../../../core/language.js";

const colours = ratingColours();
const colour = colours.colour;

const TENSE_HEAD = ["", ...TENSES.map(([, name]) => name)];

function patternTable(group) {
  const rows = PRONOUNS.map((p, i) => [
    `<th>${p}</th>`,
    ...TENSES.map(([tense]) => {
      if (tense === "passato") return `<td>${AVERE[i]} -${PARTICIPLE_ENDING[group]}</td>`;
      const ending = ENDINGS[group][tense][i];
      return `<td>${ending === null ? "—" : "-" + ending}</td>`;
    }),
  ]);
  return table("conj", TENSE_HEAD, rows);
}

function indexTable(list, start) {
  const rows = list.map((v, i) => [
    `<td>${start + i}</td>`,
    `<td${colour(verbCardId(v.infinitive, "infinito"))}><a href="#${v.infinitive}">${v.infinitive}</a></td>`,
    `<td>${escape(v.english)}</td>`,
    `<td>${passatoProssimo(v, 0)}</td>`,
  ]);
  return table("index", ["#", "Verb", "English", "Passato prossimo (io)"], rows);
}

function verbSection(v, n) {
  const spelling = spellingNote(v);
  // Only forms that are flash cards get a colour (not e.g. the Loro imperativo).
  const cardIds = new Set(cardsFor(v).map((c) => c.id));
  const cell = (tense, i) => {
    const id = verbCardId(v.infinitive, tense, i);
    return `<td${cardIds.has(id) ? colour(id) : ""}>${form(v, tense, i) ?? "—"}</td>`;
  };
  const rows = PRONOUNS.map((p, i) => [`<th>${p}</th>`, ...TENSES.map(([tense]) => cell(tense, i))]);
  return `
    <h3 id="${v.infinitive}">${n}. ${v.infinitive} — <em>${escape(v.english)}</em></h3>
    <p class="info"><strong>Participio:</strong> ${participle(v)} · <strong>Gerundio:</strong> ${gerund(v)} · <strong>Ausiliare:</strong> ${v.auxiliary}</p>
    ${spelling ? `<p class="note"><strong>Spelling change</strong> — ${md(spelling)}.</p>` : ""}
    ${v.note ? `<p class="note">${md(v.note)}</p>` : ""}
    ${table("conj", TENSE_HEAD, rows)}
    <a class="back-to-top" href="#top">↑ Index</a>`;
}

function tensesList(e) {
  const item = (name, text, examples) =>
    `<li><strong>${name}</strong> — ${md(text)}<span class="examples">${md(examples)}</span></li>`;
  return `<ul class="tenses">
    ${item("Presente", "the present. What happens now, habits, and often the near future.", e.presente)}
    ${item("Passato prossimo", `the everyday past for completed actions. Formed with *avere* or *essere* + participle. With *essere* the participle agrees with the subject: ${e.agreement}.${e.both ? ` Some verbs take both, shown as ${e.both}.` : ""}`, e.passato)}
    ${item("Imperfetto", 'the past for background, descriptions, habits and ongoing actions ("used to", "was …ing").', e.imperfetto)}
    ${item("Futuro", "the future, and also guesses about the present.", e.futuro)}
    ${item("Condizionale", '"would": polite requests, wishes and hypothetical situations.', e.condizionale)}
    ${item("Imperativo", `commands, requests and invitations. There is no *io* form. The *lui/lei* row is the polite **Lei** form, and the *loro* row is the formal plural **Loro**. The negative *tu* form uses the infinitive: ${e.negative}`, e.imperativo)}
  </ul>`;
}

function render(page, firstTime = false) {
  colours.refresh();
  const groupsOf = (s) => verbs.filter((v) => s.groups.includes(v.group));
  const all = page.sections.flatMap(groupsOf);
  const n = all.length;
  const titled = page.sections.length > 1;

  let html = `<h1>${page.title(n)}</h1>${legendHTML()}`;
  html += page.intro.map((p) => `<p>${md(p)}</p>`).join("");
  html += `<h2>The tenses</h2>${tensesList(page.examples)}`;

  // Regular verbs share endings; irregular ones don't, so their page has no pattern section.
  if (page.patterns.length) {
    html += `<h2>${page.patternsHeading}</h2>`;
    for (const pat of page.patterns) {
      if (pat.heading) html += `<h3>${pat.heading}</h3>`;
      html += `<p>${md(pat.text(n))}</p>${patternTable(pat.group)}`;
    }
    html += page.afterPatterns.map((p) => `<p>${md(p)}</p>`).join("");
  }

  html += `<h2 id="top">Index</h2>`;
  let start = 1;
  for (const s of page.sections) {
    const list = groupsOf(s);
    if (titled) html += `<h3>${s.heading}</h3>`;
    html += indexTable(list, start);
    start += list.length;
  }

  let num = 1;
  for (const s of page.sections) {
    html += `<h2>Conjugations${titled ? " — " + s.heading : ""}</h2>`;
    for (const v of groupsOf(s)) html += verbSection(v, num++);
  }

  document.getElementById("content").innerHTML = html;
  document.title = page.documentTitle;

  // innerHTML arrives after the browser looked for #verb in the URL, so jump now.
  if (firstTime && location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
}

renderGrammarNav(document.getElementById("nav"), "verbs", document.body.dataset.page);
const page = PAGES[document.body.dataset.page];
chooseLanguage("it"); // "Train on Verbs" then trains Italian
render(page, true);
addFooter();
rerenderOnRatingChanges(() => render(page));
