import "@omnidotdev/garden/3d";

import { Garden } from "@omnidotdev/garden";
import { createFileRoute } from "@tanstack/react-router";

import ThemeToggle from "@/components/theme-toggle";
import { omniGarden } from "@/lib/garden/garden.generated";

const LAYOUTS = [
	["tree", "Tree"],
	["hex", "Beehive"],
	["3d", "3D"],
] as const;

type Layout = (typeof LAYOUTS)[number][0];

const DEFAULT_LAYOUT: Layout = "tree";

const isLayout = (value: unknown): value is Layout =>
	LAYOUTS.some(([key]) => key === value);

const HomeComponent = () => {
	const { view } = Route.useSearch();
	const navigate = Route.useNavigate();

	// Coerce defensively: an unknown `?view=` value falls back to the default.
	const layout = isLayout(view) ? view : DEFAULT_LAYOUT;

	// The active layout lives in the URL (`?view=3d`), so a view is directly
	// linkable and shareable. The default (tree) is left off for a clean `/`.
	const setLayout = (key: Layout) =>
		navigate({ search: key === DEFAULT_LAYOUT ? {} : { view: key } });

	return (
		<div className="relative h-svh w-full">
			{/* Floating control cluster over the fullscreen canvas. On phones it
			    sits bottom-center (thumb reach) so it never collides with the
			    garden's own top-corner panels; on wider screens it's top-center. */}
			<div className="absolute bottom-16 left-1/2 z-10 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center gap-2 sm:top-3 sm:bottom-auto">
				<div className="flex gap-1 rounded-full border border-border bg-background/80 p-1 shadow-sm backdrop-blur-sm">
					{LAYOUTS.map(([key, label]) => (
						<button
							type="button"
							key={key}
							onClick={() => setLayout(key)}
							className={`cursor-pointer rounded-full px-3 py-1.5 font-medium text-sm transition-colors sm:px-4 ${
								layout === key
									? "bg-primary text-primary-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							{label}
						</button>
					))}
				</div>

				<div className="rounded-full border border-border bg-background/80 shadow-sm backdrop-blur-sm">
					<ThemeToggle />
				</div>
			</div>

			<Garden
				key={layout}
				layout={layout}
				expandSubgardens
				showRelations
				showMinimap={false}
				schema={omniGarden}
				controlOptions={{ position: "bottom-left" }}
			/>
		</div>
	);
};

export const Route = createFileRoute("/")({
	validateSearch: (search: Record<string, unknown>): { view?: Layout } => {
		const view = search.view;
		return isLayout(view) && view !== DEFAULT_LAYOUT ? { view } : {};
	},
	component: HomeComponent,
});
