import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import Header from "@/components/header";
import { NotFound } from "@/components/not-found";
import { ThemeProvider } from "@/components/theme-provider";

import "../index.css";

export const Route = createRootRoute({
	component: () => (
		<>
			{/* NB: Both `HeadContent` and `Scripts` are required to manage the head of a route. See: https://tanstack.com/router/v1/docs/framework/react/guide/document-head-management */}
			<HeadContent />

			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				<div className="grid h-svh grid-rows-[auto_1fr]">
					<Header />

					<Outlet />
				</div>
			</ThemeProvider>

			<Scripts />
			<TanStackRouterDevtools position="bottom-left" />
		</>
	),
	notFoundComponent: () => <NotFound />,
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
