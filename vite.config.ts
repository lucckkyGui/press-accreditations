import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Prevent "dispatcher is null" hook errors caused by duplicated React copies
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  optimizeDeps: {
    // In some embedded preview environments, pre-bundling can end up with a second React copy.
    // Excluding React forces Vite to use the project dependency graph instead.
    exclude: ["react", "react-dom", "react/jsx-runtime"],
    force: true,
  },
}));
