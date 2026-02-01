import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  resolve: {
    alias: {
      "@pcn/ui": path.resolve(root, "packages/ui/src/index.ts"),
      "@pcn/core": path.resolve(root, "packages/core/src/index.ts"),
    },
  },
});
