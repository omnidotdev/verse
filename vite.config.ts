import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import tanstackRouter from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

const viteConfig = defineConfig({
  // TODO HTTPS
  // https://github.com/vitejs/vite-plugin-basic-ssl?tab=readme-ov-file
  server: {
    // https: ...
  },
  // hack required to import Garden: https://github.com/vitejs/vite/issues/1973#issuecomment-787571499
  define: {
    "process.env": {},
  },
  plugins: [
    tailwindcss(),
    tanstackRouter({}),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "omniverse",
        short_name: "omniverse",
        description: "omniverse - PWA Application",
        theme_color: "#0c0c0c",
      },
      pwaAssets: {
        disabled: false,
        config: true,
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

export default viteConfig;
