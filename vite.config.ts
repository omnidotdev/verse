import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tanstackRouter from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";

const viteConfig = defineConfig({
  server: {
    allowedHosts: ["verse.omni.dev"],
  },
  plugins: [
    mkcert(),
    tailwindcss(),
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
  ],
});

export default viteConfig;
