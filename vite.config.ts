import { defineConfig } from "vite";
import * as path from "path"; // Use this if esModuleInterop is NOT set

export default defineConfig({
  server: {
    port: 8080,
    open: true,
  },
  resolve: {
    alias: {
      "@tilemap/CompositeTilemap": path.resolve(
        __dirname,
        "vendor/pixi-tilemap/dist/index.js",
      ),
    },
  },
});
