import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsConfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'

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
		tanstackStart()
	],
});

export default viteConfig;
