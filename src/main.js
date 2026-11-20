// The verbs come straight from the dictionary. Vite bundles the CSV as text,
// and reloads the page when the file changes.
import verbsCSV from "../dictionary/verbs.csv?raw";
import { cardsFor } from "./conjugate.js";

const card = document.getElementById("card");
const el = (id) => document.getElementById(id);

// Minimal CSV parser: handles quoted fields, commas and "" inside quotes.
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header, ...data] = rows.filter(r => r.some(f => f.trim()));
  return data.map(r => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

// Every verb in every tense and person, as { tense, it, en }.
const cards = parseCSV(verbsCSV).flatMap(cardsFor);
let current = null;

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

// First click flips the card; the next click moves on to a new card.
function handleClick() {
  if (busy) return;
  if (card.classList.contains("flipped")) nextCard();
  else card.classList.add("flipped");
}

scene.addEventListener("click", handleClick);
document.addEventListener("keydown", (e) => {
  if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleClick(); }
});

showRandomCard();
