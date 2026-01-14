import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Prevent "dispatcher is null" hook errors caused by duplicated React copies
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react-dom/client"],
  },
  optimizeDeps: {
    // In embedded preview environments, pre-bundling can create a second React copy.
    // Excluding React keeps hooks dispatcher stable.
    exclude: ["react", "react-dom", "react/jsx-runtime", "react-dom/client"],
  },
}));
