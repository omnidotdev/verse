import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsConfigPaths from 'vite-tsconfig-paths'
import tanstackRouter from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";

const viteConfig = defineConfig({
	// TODO HTTPS
	// https://github.com/vitejs/vite-plugin-basic-ssl?tab=readme-ov-file
	server: {
		allowedHosts: ["verse.omni.dev"],
	},
	plugins: [
		tailwindcss(),
		tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
		tanstackRouter({
					target: "react",
					autoCodeSplitting: true,
				}),
				react(),
	],
});

export default viteConfig;
