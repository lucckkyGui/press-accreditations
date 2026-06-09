import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { execSync } from "node:child_process";
import fs from "fs";
import path from "path";
import { componentTagger } from "lovable-tagger";

const safeGit = (command: string): string => {
  try {
    return execSync(command, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "";
  }
};

const getBuildMetadata = () => {
  const builtAt = new Date().toISOString();

  // Commit: lokalnie z gita, na Vercel fallback do VERCEL_GIT_COMMIT_SHA (skrócony).
  const commit =
    safeGit("git rev-parse --short HEAD") ||
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ||
    "unknown";

  // Branch: lokalnie z gita; "HEAD" (detached, m.in. na Vercel) → fallback do VERCEL_GIT_COMMIT_REF.
  const rawBranch = safeGit("git rev-parse --abbrev-ref HEAD");
  const branch =
    (rawBranch && rawBranch !== "HEAD" ? rawBranch : "") ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    "unknown";

  const version = process.env.VITE_APP_VERSION || process.env.VERCEL_GIT_COMMIT_SHA || commit || builtAt;

  return { builtAt, version, commit, branch };
};

const writeVersionFile = (metadata: ReturnType<typeof getBuildMetadata>) => {
  const versionFilePath = path.resolve(__dirname, "public/version.json");
  fs.mkdirSync(path.dirname(versionFilePath), { recursive: true });
  fs.writeFileSync(versionFilePath, `${JSON.stringify(metadata, null, 2)}\n`);
};

const getWebManifest = () => {
  const manifestPath = path.resolve(__dirname, "public/manifest.json");
  return JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
};

const supabaseHttpMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const buildMetadata = getBuildMetadata();

  if (command === "build") {
    writeVersionFile(buildMetadata);
  }

  return {
    define: {
      __APP_VERSION__: JSON.stringify(buildMetadata.version),
      __APP_COMMIT__: JSON.stringify(buildMetadata.commit),
      __APP_BRANCH__: JSON.stringify(buildMetadata.branch),
      __APP_BUILT_AT__: JSON.stringify(buildMetadata.builtAt),
    },
    envPrefix: "VITE_",
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      VitePWA({
        strategies: "generateSW",
        registerType: "prompt",
        injectRegister: false,
        manifestFilename: "manifest.json",
        manifest: getWebManifest(),
        includeAssets: ["offline.html", "favicon.ico", "logo192.png", "logo512.png"],
        includeManifestIcons: true,
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: false,
          skipWaiting: false,
          navigateFallback: null,
          globPatterns: ["**/*.{js,css,html,ico,png,svg,json,webmanifest}"],
          runtimeCaching: [
            ...supabaseHttpMethods.map((method) => ({
              urlPattern: ({ url }) => url.hostname === "supabase.co" || url.hostname.endsWith(".supabase.co"),
              handler: "NetworkOnly" as const,
              method,
            })),
            {
              urlPattern: ({ request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "press-accreditations:navigations",
                networkTimeoutSeconds: 3,
                expiration: {
                  maxEntries: 32,
                  maxAgeSeconds: 7 * 24 * 60 * 60,
                },
                cacheableResponse: {
                  statuses: [200],
                },
                precacheFallback: {
                  fallbackURL: "/offline.html",
                },
              },
            },
            {
              urlPattern: ({ request, url }) =>
                ["script", "style", "worker", "font", "image"].includes(request.destination) ||
                /\.(?:js|css|png|jpe?g|gif|svg|webp|ico|woff2?)$/i.test(url.pathname),
              handler: "CacheFirst",
              options: {
                cacheName: "press-accreditations:static-assets",
                expiration: {
                  maxEntries: 256,
                  maxAgeSeconds: 30 * 24 * 60 * 60,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime"],
    },
    build: {
      rollupOptions: {
        external: ['html2canvas'],
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui-core': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-tooltip', '@radix-ui/react-popover', '@radix-ui/react-slot'],
            'vendor-ui-form': ['@radix-ui/react-select', '@radix-ui/react-checkbox', '@radix-ui/react-switch', '@radix-ui/react-radio-group', '@radix-ui/react-label', '@radix-ui/react-slider'],
            'vendor-ui-extra': ['@radix-ui/react-accordion', '@radix-ui/react-scroll-area', '@radix-ui/react-separator', '@radix-ui/react-toast', '@radix-ui/react-avatar', '@radix-ui/react-progress'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority', 'zod'],
            // recharts and framer-motion removed from manual chunks
            // → they will be code-split into lazy page chunks automatically
          },
        },
      },
    },
  };
});
