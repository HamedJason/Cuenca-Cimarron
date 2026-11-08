import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls: { includeAbsolute: false } } }),
  ],
  server: { host: "127.0.0.1", proxy: { "/api": "http://127.0.0.1:8091" } },
  test: { environment: "jsdom", setupFiles: ["./tests/setup.js"] },
});
