import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import Header from "@/components/header";
import { NotFound } from "@/components/not-found";
import { ThemeProvider } from "@/components/theme-provider";
import { FLAGS, flags } from "@/lib/providers";
import createMetaTags from "@/lib/util/createMetaTags";

import "../index.css";

function MaintenancePage() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-fuchsia-900 to-fuchsia-800 p-8 text-white">
			<div className="text-center">
				<div className="mb-6 text-9xl">🌌</div>
				<h1 className="mb-4 font-bold text-4xl">Exploring New Universes</h1>
				<p className="max-w-md text-fuchsia-200 text-lg">
					We're charting the cosmos. Verse will return to orbit soon.
				</p>
			</div>
		</div>
	);
}

function RootComponent() {
	const { isMaintenanceMode } = Route.useRouteContext();

	if (isMaintenanceMode) {
		return (
			<>
				<HeadContent />
				<MaintenancePage />
				<Scripts />
			</>
		);
	}

	return (
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
	);
}

export const Route = createRootRouteWithContext<{
	isMaintenanceMode: boolean;
}>()({
	beforeLoad: async () => {
		const isMaintenanceMode = await flags.isEnabled(FLAGS.MAINTENANCE);

		return { isMaintenanceMode };
	},
	component: RootComponent,
	notFoundComponent: () => <NotFound />,
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			...createMetaTags(),
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});
