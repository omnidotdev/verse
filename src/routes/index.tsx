import "@omnidotdev/garden/3d";

import { Garden } from "@omnidotdev/garden";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { omniGarden } from "@/lib/garden/garden.generated";

const LAYOUTS = [
	["tree", "Tree"],
	["hex", "Beehive"],
	["3d", "3D"],
] as const;

type Layout = (typeof LAYOUTS)[number][0];

const HomeComponent = () => {
	const [layout, setLayout] = useState<Layout>("tree");

	return (
		<div className="relative h-[calc(100dvh-5rem)] p-4">
			<div className="absolute top-6 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full border border-border bg-background/80 p-1 shadow-sm backdrop-blur-sm">
				{LAYOUTS.map(([key, label]) => (
					<button
						type="button"
						key={key}
						onClick={() => setLayout(key)}
						className={`cursor-pointer rounded-full px-4 py-1.5 font-medium text-sm transition-colors ${
							layout === key
								? "bg-primary text-primary-foreground"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						{label}
					</button>
				))}
			</div>

			<Garden
				key={layout}
				layout={layout}
				expandSubgardens
				showRelations
				schema={omniGarden}
				controlOptions={{ position: "top-left" }}
				miniMapOptions={{ position: "bottom-left" }}
			/>
		</div>
	);
};

export const Route = createFileRoute("/")({
	component: HomeComponent,
});
