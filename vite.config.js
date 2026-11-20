import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true, // fail instead of silently moving to another port
  },
});
