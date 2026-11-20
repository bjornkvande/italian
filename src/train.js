// The Train screen (the main page): flash cards, Italian <-> English.
// Two buttons choose what to practise and the level ([Verbs ▾] [Beginner ▾]);
// the word group is kept in the address (index.html#verbs) and remembered, the
// level is remembered per group. The 📖 button opens the group's grammar.
import "./pwa.js";
import { createRatings } from "./ratings.js";
import { DIFFICULTIES, cardsForDifficulty, loadDifficulty, saveDifficulty, migrateOldLevel } from "./difficulty.js";
import { subpageFromHash, rememberPage, grammarHref } from "./nav.js";
import { GROUPS, cardsByGroup, groupById } from "./groups.js";
import { dropdown } from "./menu.js";
import { createBag } from "./bag.js";
import { canSpeak, speak, onVoice } from "./speech.js";

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
  const title = voice ? `Say it in Italian (${voice.name})` : "Say it in Italian (no Italian voice found)";
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
}

// First click flips the card. On the answer side, a rating button rates;
// clicking anywhere else moves on to the next card.
// A tap anywhere on the screen: a rating number rates; anything else flips the
// card (question side) or moves on to the next card (answer side).
function handleClick(e) {
  if (busy) return;
  if (e?.target.closest(".speak")) return speak(current.it);
  const button = e?.target.closest("[data-rating]");
  if (button) return rate(Number(button.dataset.rating));
  if (isFlipped()) nextCard();
  else card.classList.add("flipped");
}

// Taps on the buttons at the top (word group, level, 📖) or in their menus aren't
// card taps, and neither is a tap that only closes an open menu.
let menuWasOpen = false;
document.addEventListener("pointerdown", () => {
  menuWasOpen = Boolean(document.querySelector(".menu:not([hidden])"));
}, true);
document.addEventListener("click", (e) => {
  if (e.target.closest(".train-header") || menuWasOpen) return;
  handleClick(e);
});

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
