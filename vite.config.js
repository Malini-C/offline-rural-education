import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      injectRegister: null,
      includeAssets: ["icons/*.png", "offline.html"],
      manifest: {
        name: "Offline Rural Education Assistant",
        short_name: "RuralLearnTest",
        description: "Offline educational assistant for rural students",
        theme_color: "#0f766e",
        background_color: "#f8fafc",
        display: "standalone",
        start_url: "/",
        scope: "/",
        lang: "en",
        icons: [
          { src: "icons/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/pwa-512x512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,json}"],
        cleanupOutdatedCaches: true,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//, /^\/images\//],
        runtimeCaching: [],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    exclude: ["**/languagePersistence.test.jsx", "**/node_modules/**"],
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      force: true,
    },
    server: {
      deps: {
        inline: ["@testing-library/react"],
      },
    },
  },
});
