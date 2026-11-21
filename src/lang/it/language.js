// Italian: the settings the generic app code needs (src/core/language.js).
import { GROUPS } from "./groups.js";

export const LANGUAGE = {
  code: "it",
  name: "Italiano", // in page titles and the language menu
  englishName: "Italian",
  speech: "it-IT", // voice for reading cards aloud
  // Storage keys start with this. Italian came first and keeps its original
  // keys (verbi.ratings, verbi.bags, ...), so existing ratings stay put.
  prefix: "verbi.",
  dir: "", // folder of the grammar pages: the project root
  groups: GROUPS,
  // The flag in the corner of the Train screen (viewBox 0 0 3 2).
  flag: '<rect width="1" height="2" fill="#009246"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ce2b37"/>',
};
