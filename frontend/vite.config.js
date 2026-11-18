import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls: { includeAbsolute: false } } }),
  ],
  // changeOrigin: false conserva el Host del navegador; si no, la API ve otro host que el
  // del Origin y rechaza con 403 lo que mandan alumnos y docentes (DeviceSession::sameOrigin).
  server: { host: "127.0.0.1", proxy: { "/api": { target: "http://127.0.0.1:8091", changeOrigin: false } } },
  test: { environment: "jsdom", setupFiles: ["./tests/setup.js"] },
});
