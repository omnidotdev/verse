import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import tanstackRouter from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const viteConfig = defineConfig({
	// TODO HTTPS
	// https://github.com/vitejs/vite-plugin-basic-ssl?tab=readme-ov-file
	server: {
		allowedHosts: ["verse.omni.dev"],
	},
	plugins: [
		tailwindcss(),
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
		}),
		react(),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});

export default viteConfig;
