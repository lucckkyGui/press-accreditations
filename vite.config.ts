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
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Hard-pin React to one exact entry file to avoid duplicate React singletons
      react: path.resolve(__dirname, "./node_modules/react/index.js"),
      "react/jsx-runtime": path.resolve(__dirname, "./node_modules/react/jsx-runtime.js"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom/index.js"),
      "react-dom/client": path.resolve(__dirname, "./node_modules/react-dom/client.js"),
    },
    // Prevent "dispatcher is null" hook errors caused by duplicated React copies
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react-dom/client"],
  },
  optimizeDeps: {
    // Completely disable dependency pre-bundling to avoid duplicate React copies
    disabled: true,
  },
}));
