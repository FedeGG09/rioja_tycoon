import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  css: {
    postcss: {},
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "es2020",
  },
});