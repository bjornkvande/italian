// French: the settings the generic app code needs (src/core/language.js).
import { GROUPS } from "./groups.js";

export const LANGUAGE = {
  code: "fr",
  name: "Français",
  englishName: "French",
  speech: "fr-FR",
  prefix: "fr.", // fr.ratings, fr.bags, ...: French keeps its own progress
  dir: "fr/", // grammar pages: fr/basics.html
  groups: GROUPS,
  flag: '<rect width="1" height="2" fill="#0055a4"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ef4135"/>',
};
