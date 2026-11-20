// Flash cards: every verb in every tense and person, Italian <-> English.
import { verbs } from "./csv.js";
import { cardsFor } from "./conjugate.js";
import { createRatings } from "./ratings.js";
import { LEVELS, cardsForLevel, loadLevel, saveLevel } from "./levels.js";

const card = document.getElementById("card");
const el = (id) => document.getElementById(id);
const ratingButtons = [...document.querySelectorAll("[data-rating]")];

// Every verb in every tense and person, as { id, tenseKey, tense, it, en }.
const allCards = verbs.flatMap(cardsFor);
// The cards for the chosen difficulty level.
let level = loadLevel();
let cards = cardsForLevel(allCards, level);
const ratings = createRatings();
let current = null;
let direction = "it-en"; // it-en: Italian shown first, en-it: English shown first
let ratedNow = null; // the rating given to the current card during this visit

// Ask the browser not to clear the ratings when it runs low on space.
navigator.storage?.persist?.().catch(() => {});

const scene = el("scene");
const SLIDE_MS = 250; // keep in sync with the .scene transition in style.css
let busy = false;

// Pick a new random card (never the same twice in a row) and show a random side.
function showRandomCard() {
  let next;
  do {
    next = cards[Math.floor(Math.random() * cards.length)];
  } while (cards.length > 1 && next === current);
  current = next;

  const italianFirst = Math.random() < 0.5;
  direction = italianFirst ? "it-en" : "en-it";
  // Snap back to the front without animating before changing the words.
  card.style.transition = "none";
  card.classList.remove("flipped");
  void card.offsetWidth;
  card.style.transition = "";

  // The tense name is only shown on the English side.
  el("front-tense").textContent = italianFirst ? "" : current.tense;
  el("back-tense").textContent = italianFirst ? current.tense : "";
  el("front-word").textContent = italianFirst ? current.it : current.en;
  el("back-word").textContent = italianFirst ? current.en : current.it;

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
function handleClick(e) {
  if (busy) return;
  const button = e?.target.closest("[data-rating]");
  if (button) return rate(Number(button.dataset.rating));
  // A near miss between the buttons or on their label shouldn't skip the card.
  if (isFlipped() && e?.target.closest(".rating")) return;
  if (isFlipped()) nextCard();
  else card.classList.add("flipped");
}

// ---------------------------------------------------------------- difficulty level

const levelButton = el("level-button");
const levelMenu = el("level-menu");

levelMenu.innerHTML = LEVELS.map((l) => `
  <button type="button" data-level="${l.id}" aria-pressed="false">
    <span class="level-name">${l.name}</span>
    <span class="level-description">${l.description}</span>
  </button>`).join("");

function showLevel() {
  levelButton.innerHTML = `${LEVELS.find((l) => l.id === level).name}<span aria-hidden="true"> ▾</span>`;
  for (const b of levelMenu.querySelectorAll("[data-level]")) {
    b.setAttribute("aria-pressed", String(b.dataset.level === level));
  }
}

function toggleMenu(open = levelMenu.hidden) {
  levelMenu.hidden = !open;
  levelButton.setAttribute("aria-expanded", String(open));
}

levelButton.addEventListener("click", () => toggleMenu());
levelMenu.addEventListener("click", (e) => {
  const choice = e.target.closest("[data-level]");
  if (!choice) return;
  toggleMenu(false);
  if (choice.dataset.level === level) return;
  level = choice.dataset.level;
  saveLevel(level);
  cards = cardsForLevel(allCards, level);
  showLevel();
  if (!busy) nextCard(); // straight to a card from the new level
});
// Close the menu when tapping elsewhere or pressing Escape.
document.addEventListener("click", (e) => { if (!e.target.closest("#level")) toggleMenu(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") toggleMenu(false); });
showLevel();

// ---------------------------------------------------------------- input

scene.addEventListener("click", handleClick);
document.addEventListener("keydown", (e) => {
  if (e.target.closest?.("#level")) return; // keys on the level menu shouldn't flip the card
  if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleClick(); }
  else if (/^[1-5]$/.test(e.key)) rate(Number(e.key));
});

showRandomCard();
