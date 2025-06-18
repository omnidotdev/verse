import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import Header from "@/components/header";
import ThemeProvider from "@/components/theme-provider";

import "../index.css";

export const Route = createRootRoute({
	component: () => (
		<>
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<div className="grid grid-rows-[auto_1fr] h-svh">
					<Header />

					<Outlet />
				</div>
			</ThemeProvider>

			<TanStackRouterDevtools position="bottom-left" />
		</>
	),
	head: () => ({
		meta: [
			{
				title: "Omniverse",
			},
			{
				name: "description",
				content: "Full view of the Omni Ecosystem. Powered by Garden.",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});
