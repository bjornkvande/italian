// Reads the language being learned aloud with the browser's own speech
// synthesis (Web Speech API). The voices come from the operating system, so
// quality differs per device. The language is the current one (src/core/language.js).
import { LANGUAGE } from "./language.js";

const synth = globalThis.speechSynthesis;
export const canSpeak = Boolean(synth && globalThis.SpeechSynthesisUtterance);

// The best voice for the language on this device: an enhanced/premium one if
// installed, else one that works offline, else any voice for the language.
// Browsers load their list of voices in the background, so it's picked again
// whenever the list changes; without a matching voice the browser may read
// the words with an English one.
let voice = null;
const listeners = [];

function pickVoice() {
  const voices = synth.getVoices().filter((v) => v.lang.replace("_", "-").toLowerCase().startsWith(LANGUAGE.code));
  voice =
    voices.find((v) => /enhanced|premium/i.test(v.name)) ??
    voices.find((v) => v.localService) ??
    voices[0] ??
    null;
  for (const f of listeners) f(voice);
}

if (canSpeak) {
  pickVoice();
  synth.addEventListener?.("voiceschanged", pickVoice);
}

/** Calls `f(voice)` now and whenever the chosen voice changes (null: none). */
export function onVoice(f) {
  listeners.push(f);
  f(voice);
}

/** Say `text` in the current language, stopping anything still being said. */
export function speak(text) {
  if (!canSpeak) return;
  if (!voice) pickVoice();
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = LANGUAGE.speech;
  if (voice) u.voice = voice;
  u.rate = 0.9;
  synth.speak(u);
}
