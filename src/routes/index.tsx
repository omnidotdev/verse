import "@omnidotdev/garden/3d";

import { Garden } from "@omnidotdev/garden";
import { createFileRoute } from "@tanstack/react-router";

import ThemeToggle from "@/components/theme-toggle";
import { omniGarden } from "@/lib/garden/garden.generated";

// `view` is the product's word for the layout, used in both the URL and the
// buttons; `plugin` is the name Garden registers it under. The two differ for
// the beehive, which Garden calls `hex` after the cell geometry.
const LAYOUTS = [
	{ view: "tree", label: "Tree", plugin: "tree" },
	{ view: "beehive", label: "Beehive", plugin: "hex" },
	{ view: "3d", label: "3D", plugin: "3d" },
] as const;

type Layout = (typeof LAYOUTS)[number]["view"];

const DEFAULT_LAYOUT: Layout = "tree";

// The beehive was `?view=hex` before the URL took the product's name for it;
// links are meant to be shareable, so old ones still resolve.
const LEGACY_VIEWS: Record<string, Layout> = { hex: "beehive" };

// Coerce defensively: an unknown `?view=` value yields undefined for the caller
// to fall back on.
const toLayout = (value: unknown): Layout | undefined => {
	if (typeof value !== "string") return undefined;
	const view = LEGACY_VIEWS[value] ?? value;
	return LAYOUTS.find((layout) => layout.view === view)?.view;
};

const HomeComponent = () => {
	const { view } = Route.useSearch();
	const navigate = Route.useNavigate();

	const layout = toLayout(view) ?? DEFAULT_LAYOUT;
	const { plugin } =
		LAYOUTS.find((entry) => entry.view === layout) ?? LAYOUTS[0];

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
					{LAYOUTS.map(({ view: key, label }) => (
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
				layout={plugin}
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
		const view = toLayout(search.view);
		return view && view !== DEFAULT_LAYOUT ? { view } : {};
	},
	component: HomeComponent,
});
