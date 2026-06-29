import { Garden } from "@omnidotdev/garden";
import { createFileRoute } from "@tanstack/react-router";

import { omniGarden } from "@/lib/garden/garden.generated";

const HomeComponent = () => (
	<div className="p-4">
		<Garden
			expandSubgardens
			showRelations
			schema={omniGarden}
			controlOptions={{ position: "top-left" }}
			miniMapOptions={{ position: "bottom-left" }}
		/>
	</div>
);

export const Route = createFileRoute("/")({
	component: HomeComponent,
});
