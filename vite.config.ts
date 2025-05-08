import { defineConfig } from "vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 8080,
    open: true,
  },
  resolve: {
    alias: {
      "@tilemap/CompositeTilemap": path.resolve(
        __dirname,
        "src/vendor/pixi-tilemap/src/index_old.ts",
      ),
    },
  },
});
