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
import appCss from "../index.css?url";

import type { ReactNode } from "react";

const RootDocument = ({ children }: Readonly<{ children: ReactNode }>) => (
	<>
		<HeadContent />
		<div>
			{children}
			<TanStackRouterDevtools position="bottom-left" />
			<Scripts />
		</div>
	</>
);

const RootComponent = () => (
	<RootDocument>
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<div className="grid h-svh grid-rows-[auto_1fr]">
				<Header />

				<Outlet />
			</div>
		</ThemeProvider>
	</RootDocument>
);

export const Route = createRootRoute({
	component: RootComponent,
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
			{ rel: "stylesheet", href: appCss },
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});
