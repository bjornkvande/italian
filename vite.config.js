import { existsSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages serves the app from https://bjornkvande.github.io/italian/,
// so production builds (and `vite preview` of them) live under /italian/.
// The dev server stays at /.
export default defineConfig(({ command, isPreview }) => ({
  base: command === "build" || isPreview ? "/italian/" : "/",
  // For the grammar pages' footer (src/pages/footer.js): the build number is
  // the number of commits (the deploy checks out the full history), the date
  // is the day of the build, i.e. the deploy.
  define: {
    __BUILD_NUMBER__: JSON.stringify(execSync("git rev-list --count HEAD").toString().trim()),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  server: {
    port: 5173,
    strictPort: true, // fail instead of silently moving to another port
  },
  build: {
    // Every *.html file in the project folder is a page (the flash cards, the
    // Italian grammar pages, ...), and so is every *.html in a language's folder
    // (de/basics.html), so a new page needs no change here.
    rollupOptions: {
      input: Object.fromEntries(
        [".", ...readdirSync("src/lang").filter((code) => existsSync(code))]
          .flatMap((dir) => readdirSync(dir).filter((f) => f.endsWith(".html")).map((f) => (dir === "." ? f : `${dir}/${f}`)))
          .map((f) => [f.replace(/\.html$/, "").replace("/", "-"), f]),
      ),
    },
  },
  plugins: [
    VitePWA({
      // Install a new version automatically when the app is rebuilt and redeployed.
      registerType: "autoUpdate",
      // Registered from src/core/pwa.js, which also checks for updates and reloads.
      injectRegister: false,
      // Everything the app needs (HTML, JS with the verbs bundled in, CSS, icons)
      // is precached, so it works fully offline once installed.
      workbox: {
        globPatterns: ["**/*.{html,js,css,svg,png,ico}"],
        // A new version takes over open pages straight away (then src/core/pwa.js reloads them).
        skipWaiting: true,
        clientsClaim: true,
        // Ignore ?query parts when looking up a cached page, so basics.html?x
        // still opens basics.html instead of falling back to the start page.
        ignoreURLParametersMatching: [/.*/],
      },
      includeAssets: ["favicon.ico", "apple-touch-icon-180x180.png", "icon.svg"],
      manifest: {
        name: "Italiano",
        short_name: "Italiano",
        description: "Flash cards and reference pages for learning Italian: the basics, adjectives and verbs.",
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
