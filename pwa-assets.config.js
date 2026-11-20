import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

// Generates the PWA icons in public/ from public/icon.svg:
//   npx pwa-assets-generator
// The icon fills the whole square (no padding), so the flag reaches the edges
// on home screens, where Android and iOS round or crop the corners themselves.
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, padding: 0 },
    apple: { ...minimal2023Preset.apple, padding: 0 },
  },
  images: ["public/icon.svg"],
});
