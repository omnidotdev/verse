import tailwindcss from "@tailwindcss/vite";
import tanstackRouter from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import tsConfigPaths from "vite-tsconfig-paths";

/**
 * Vite configuration.
 * @see https://vite.dev/config
 */
const viteConfig = defineConfig(({ command }) => ({
	resolve: {
		dedupe: ["react", "react-dom"],
	},
	server: {
		port: 3000,
		host: "0.0.0.0",
		allowedHosts: ["verse.omni.dev"],
		// Proxy the live catalog fetch through the dev server so the browser
		// request is same-origin. omni-api's CORS whitelist covers the deployed
		// origins (verse.omni.dev) but not localhost, so a direct browser fetch
		// from dev is blocked; server-to-server proxying sidesteps CORS entirely.
		// Point the catalog client at this path with VITE_OMNI_API_GRAPHQL_URL
		// (see .env.development). Dev only, has no effect on the production build.
		proxy: {
			"/omni-api/graphql": {
				target: "https://api.omni.dev",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/omni-api\/graphql/, "/graphql"),
			},
		},
	},
	plugins: [
		// NB: command is `serve` in development, `build` in production
		command === "serve" && mkcert(),
		tailwindcss(),
		tsConfigPaths({ projects: ["./tsconfig.json"] }),
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
		}),
		react(),
	],
}));

export default viteConfig;
