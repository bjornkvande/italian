// Keeps the installed app up to date: checks for a new version when the app
// comes back to the foreground and every hour while it's open. When one is
// found, the service worker installs it and the page reloads automatically
// (registerType "autoUpdate" in vite.config.js). Ratings and the level are in
// localStorage, so a reload loses nothing.
import { registerSW } from "virtual:pwa-register";

const HOUR = 60 * 60 * 1000;

registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (!registration) return;
    const checkForUpdate = () => {
      if (navigator.onLine) registration.update().catch(() => {});
    };
    setInterval(checkForUpdate, HOUR);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") checkForUpdate();
    });
  },
});
