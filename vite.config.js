import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages serves the app from https://bjornkvande.github.io/italian/,
// so production builds (and `vite preview` of them) live under /italian/.
// The dev server stays at /.
export default defineConfig(({ command, isPreview }) => ({
  base: command === "build" || isPreview ? "/italian/" : "/",
  server: {
    port: 5173,
    strictPort: true, // fail instead of silently moving to another port
  },
  build: {
    // One HTML page per tab: the flash cards, the Basics and the four verb references.
    rollupOptions: {
      input: {
        index: "index.html",
        basics: "basics.html",
        are: "are.html",
        ere: "ere.html",
        ire: "ire.html",
        irregular: "irregular.html",
      },
    },
  },
  plugins: [
    VitePWA({
      // Install a new version automatically when the app is rebuilt and redeployed.
      registerType: "autoUpdate",
      // Registered from src/pwa.js, which also checks for updates and reloads.
      injectRegister: false,
      // Everything the app needs (HTML, JS with the verbs bundled in, CSS, icons)
      // is precached, so it works fully offline once installed.
      workbox: {
        globPatterns: ["**/*.{html,js,css,svg,png,ico}"],
        // A new version takes over open pages straight away (then src/pwa.js reloads them).
        skipWaiting: true,
        clientsClaim: true,
        // Ignore ?query parts when looking up a cached page, so basics.html?x
        // still opens basics.html instead of falling back to the start page.
        ignoreURLParametersMatching: [/.*/],
      },
      includeAssets: ["favicon.ico", "apple-touch-icon-180x180.png", "icon.svg"],
      manifest: {
        name: "Verbi italiani",
        short_name: "Verbi",
        description: "Flash cards for Italian verbs in every tense and person.",
        lang: "it",
        // start_url and scope default to the base path (/italian/).
        display: "standalone",
        orientation: "portrait",
        background_color: "#ececec",
        theme_color: "#ececec",
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
}));
