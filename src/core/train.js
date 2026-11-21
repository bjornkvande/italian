// The Train screen (the main page): flash cards, the language being learned <-> English.
// "Italian" below and the card field `it` / direction "it-en" mean the language
// being learned (Italian came first); the flag in the corner switches language.
// Two buttons choose what to practise and the level ([Verbs ▾] [Beginner ▾]);
// the word group is kept in the address (index.html#verbs) and remembered, the
// level is remembered per group. The 📖 button opens the group's grammar.
import "./pwa.js";
import { createRatings, STORAGE_KEY as RATINGS_KEY } from "./ratings.js";
import { DIFFICULTIES, cardsForDifficulty, loadDifficulty, saveDifficulty, migrateOldLevel } from "./difficulty.js";
import { subpageFromHash, rememberPage, grammarHref } from "./nav.js";
import { GROUPS, cardsByGroup, groupById, LANGUAGE, LANGUAGES, chooseLanguage } from "./language.js";
import { dropdown } from "./menu.js";
import { createBag } from "./bag.js";
import { canSpeak, speak, onVoice } from "./speech.js";
import { progress, fraction } from "./progress.js";

migrateOldLevel(); // carry over the old single level setting, once

const card = document.getElementById("card");
const el = (id) => document.getElementById(id);
const ratingButtons = [...document.querySelectorAll("[data-rating]")];

// The cards of every word group ({ basics: [...], verbs: [...] }), all as
// { id, form, kind, heading, it, en }.
const decks = cardsByGroup();
// What you practise and how hard; `cards` are the cards in play.
let groupId = subpageFromHash("train");
let difficulty = loadDifficulty(groupId);
let cards = [];
// Cards come from a shuffle bag: each card once, in random order, before any repeats.
let bag = null;
const pickCards = () => {
  cards = cardsForDifficulty(decks[groupId], groupById(groupId), difficulty);
  bag = createBag(cards, `${groupId}.${difficulty}`);
};
pickCards();
rememberPage("train", groupId);
const ratings = createRatings();
let current = null;
let direction = "it-en"; // it-en: Italian shown first, en-it: English shown first
let ratedNow = null; // the rating given to the current card during this visit

// Ask the browser not to clear the ratings when it runs low on space.
navigator.storage?.persist?.().catch(() => {});

const scene = el("scene");
const SLIDE_MS = 250; // keep in sync with the .scene transition in train.css
let busy = false;

// Take the next card from the bag and show a random side.
function showRandomCard() {
  current = bag.next();

  const italianFirst = Math.random() < 0.5;
  direction = italianFirst ? "it-en" : "en-it";
  // Snap back to the front without animating before changing the words.
  card.style.transition = "none";
  card.classList.remove("flipped");
  void card.offsetWidth;
  card.style.transition = "";

  // Italian side: the word class ("Verb"); English side: the word class and
  // the detail needed to answer ("Verb · Presente").
  el("front-heading").textContent = italianFirst ? current.kind : current.heading;
  el("back-heading").textContent = italianFirst ? current.heading : current.kind;
  el("front-word").textContent = italianFirst ? current.it : current.en;
  el("back-word").textContent = italianFirst ? current.en : current.it;
  // The speaker button sits on the Italian side.
  el("front-speak").hidden = !canSpeak || !italianFirst;
  el("back-speak").hidden = !canSpeak || italianFirst;

  // Show the rating this card already has in this direction, if any.
  ratedNow = null;
  showSelected(ratings.get(current.id, direction)?.last);
}

// Fill in the button for `value` (or none).
function showSelected(value) {
  for (const b of ratingButtons) {
    const selected = Number(b.dataset.rating) === value;
    b.classList.toggle("selected", selected);
    b.setAttribute("aria-pressed", String(selected));
  }
}

// Slide the old card out to the left, then slide the new one in from the right.
function nextCard() {
  busy = true;
  scene.classList.add("out");
  setTimeout(() => {
    showRandomCard();
    // Jump to the right without animating, then slide into place.
    scene.classList.add("enter");
    scene.classList.remove("out");
    void scene.offsetWidth;
    scene.classList.remove("enter");
    setTimeout(() => { busy = false; }, SLIDE_MS);
  }, SLIDE_MS);
}

// The speaker buttons say which voice reads aloud (hover to see it).
onVoice((voice) => {
  const lang = LANGUAGE.englishName;
  const title = voice ? `Say it in ${lang} (${voice.name})` : `Say it in ${lang} (no ${lang} voice found)`;
  for (const id of ["front-speak", "back-speak"]) el(id).title = title;
});

const isFlipped = () => card.classList.contains("flipped");

// Store how well you knew the card and highlight the choice. The card stays.
// The first tap on this visit (even on the rating already shown) records a new
// rating; tapping again on the same visit corrects it instead of adding another.
function rate(value) {
  if (busy || !isFlipped()) return;
  if (ratedNow === null) ratings.rate(current.id, direction, value);
  else ratings.correct(current.id, direction, value);
  ratedNow = value;
  showSelected(value);
  showProgress();
}

// Progress bars of card sides known (rated 4+): under the card for this group and
// level, at the bottom of the screen for every card.
const everyCard = Object.values(decks).flat();
function showBar(id, p, label) {
  const bar = el(id);
  bar.querySelector(".fill").style.width = `${p.total ? (100 * p.known) / p.total : 0}%`;
  bar.querySelector(".count").textContent = fraction(p);
  bar.title = `${fraction(p)} card sides known ${label} (rated 4 or 5, each direction counts)`;
}
function showProgress() {
  const records = ratings.all();
  showBar("level-progress", progress(cards, records), "at this level");
  showBar("total-progress", progress(everyCard, records), "in all");
}

// A tap anywhere on the screen: a rating number rates; anything else flips the
// card (question side) or moves on to the next card (answer side).
function handleClick(e) {
  if (busy) return;
  const button = e?.target.closest("[data-rating]");
  if (button) return rate(Number(button.dataset.rating));
  if (isFlipped()) nextCard();
  else card.classList.add("flipped");
}

// Taps are handled on pointerup rather than click: iOS Safari sometimes drops
// the click of a tap right after another one nearby (taken as a double tap),
// so a tap next to the rating you just gave didn't move on.
// Taps on the buttons at the top (word group, level, 📖) or in their menus aren't
// card taps, and neither is a tap that only closes an open menu or a drag.
let menuWasOpen = false;
let down = null; // where the current tap started
document.addEventListener("pointerdown", (e) => {
  menuWasOpen = Boolean(document.querySelector(".menu:not([hidden])"));
  down = e.isPrimary && e.button === 0 ? { id: e.pointerId, x: e.clientX, y: e.clientY } : null;
}, true);
document.addEventListener("pointerup", (e) => {
  const tap = down && down.id === e.pointerId && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 12;
  down = null;
  if (!tap || menuWasOpen || e.target.closest(".train-header, .speak")) return;
  handleClick(e);
});
document.addEventListener("pointercancel", () => { down = null; });

// The speaker button keeps using click: browsers only allow speech from a click.
for (const id of ["front-speak", "back-speak"]) el(id).addEventListener("click", () => speak(current.it));

// ---------------------------------------------------------------- what to practise and level

const groupButton = el("group-button");
const groupMenu = el("group-menu");
const levelButton = el("level-button");
const levelMenu = el("level-menu");
const grammarLink = el("grammar-link");

// [Verbs ▾] [Advanced ▾] [📖]: the level menu describes the levels of the chosen
// group, and 📖 leads to its grammar.
function showSettings() {
  const group = groupById(groupId);
  groupButton.innerHTML = `${group.name}<span aria-hidden="true"> ▾</span>`;
  groupMenu.innerHTML = GROUPS.map((g) => `
    <button type="button" data-group="${g.id}" aria-pressed="${g.id === groupId}">
      <span class="menu-name">${g.name}</span>
      <span class="menu-description">${g.description}</span>
    </button>`).join("");
  levelButton.innerHTML = `${DIFFICULTIES.find((d) => d.id === difficulty).name}<span aria-hidden="true"> ▾</span>`;
  levelMenu.innerHTML = DIFFICULTIES.map((d) => `
    <button type="button" data-level="${d.id}" aria-pressed="${d.id === difficulty}">
      <span class="menu-name">${d.name}</span>
      <span class="menu-description">${group.difficulties[d.id].description}</span>
    </button>`).join("");
  grammarLink.href = grammarHref(groupId);
  grammarLink.title = `${group.name}: grammar and dictionary`;
  grammarLink.setAttribute("aria-label", grammarLink.title);
}

const groupDropdown = dropdown(el("group"), groupButton, groupMenu);

// The flag of the language being learned; its menu lists the other languages.
// Choosing one reloads the Train screen in that language, with its own cards,
// ratings and progress.
const flagSVG = (lang) => `<svg class="flag" viewBox="0 0 3 2" aria-hidden="true">${lang.flag}</svg>`;
const languageButton = el("language-button");
const languageMenu = el("language-menu");
document.documentElement.lang = LANGUAGE.code;
languageButton.innerHTML = flagSVG(LANGUAGE);
languageButton.title = `${LANGUAGE.name}: change language`;
languageButton.setAttribute("aria-label", languageButton.title);
languageMenu.innerHTML = LANGUAGES.filter((l) => l !== LANGUAGE).map((l) => `
  <button type="button" data-language="${l.code}">${flagSVG(l)}<span class="menu-name">${l.name}</span></button>`).join("");
dropdown(el("language"), languageButton, languageMenu);
languageMenu.addEventListener("click", (e) => {
  const choice = e.target.closest("[data-language]");
  if (!choice) return;
  chooseLanguage(choice.dataset.language);
  // Reload without the word group in the address: each language has its own.
  history.replaceState(null, "", location.pathname);
  location.reload();
});
const levelDropdown = dropdown(el("level"), levelButton, levelMenu);

// Choosing a group changes the address; the hashchange below does the rest.
groupMenu.addEventListener("click", (e) => {
  const choice = e.target.closest("[data-group]");
  if (!choice) return;
  groupDropdown.close();
  if (choice.dataset.group !== groupId) location.hash = choice.dataset.group;
});

levelMenu.addEventListener("click", (e) => {
  const choice = e.target.closest("[data-level]");
  if (!choice) return;
  levelDropdown.close();
  if (choice.dataset.level === difficulty) return;
  difficulty = choice.dataset.level;
  saveDifficulty(groupId, difficulty);
  pickCards();
  showSettings();
  showProgress();
  if (!busy) nextCard(); // straight to a card at the new level
});
showSettings();

// A new word group (from the menu, the address or "Train on …"): its cards at its level.
window.addEventListener("hashchange", () => {
  const chosen = subpageFromHash("train");
  if (chosen === groupId) return;
  groupId = chosen;
  rememberPage("train", groupId);
  difficulty = loadDifficulty(groupId);
  pickCards();
  showSettings();
  showProgress();
  if (!busy) nextCard();
});

// ---------------------------------------------------------------- input

document.addEventListener("keydown", (e) => {
  // Keys on the menu, the 📖 link or the speaker button shouldn't flip the card.
  if (e.target.closest?.(".train-header, .speak")) return;
  if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleClick(); }
  else if (/^[1-5]$/.test(e.key)) rate(Number(e.key));
});

showRandomCard();
showProgress();
// Ratings given in another tab or on another visit.
window.addEventListener("storage", (e) => { if (e.key === null || e.key === RATINGS_KEY) showProgress(); });
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") showProgress(); });
