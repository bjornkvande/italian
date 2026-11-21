// German: the settings the generic app code needs (src/core/language.js).
import { GROUPS } from "./groups.js";

export const LANGUAGE = {
  code: "de",
  name: "Deutsch",
  englishName: "German",
  speech: "de-DE",
  prefix: "de.", // de.ratings, de.bags, ...: German keeps its own progress
  dir: "de/", // grammar pages: de/basics.html
  groups: GROUPS,
  flag: '<rect width="3" height="0.667" fill="#000"/><rect y="0.667" width="3" height="0.667" fill="#dd0000"/><rect y="1.333" width="3" height="0.667" fill="#ffce00"/>',
};
