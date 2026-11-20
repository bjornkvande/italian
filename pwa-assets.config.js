import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

// Generates the PWA icons in public/ from public/icon.svg:
//   npx pwa-assets-generator
export default defineConfig({
  preset: minimal2023Preset,
  images: ["public/icon.svg"],
});
