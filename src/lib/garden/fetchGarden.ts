import { buildGarden, CATALOG_QUERY } from "./buildGarden";

import type { GardenSchema } from "@omnidotdev/garden";
import type { CatalogData } from "./buildGarden";

/**
 * Fetch the live public catalog from omni-api and transform it into the
 * Omniverse garden. Runs in the browser at render time so the visualizer always
 * reflects the current catalog (a product added or launched in the API shows up
 * on the next load, no rebuild). If the fetch fails, the caller keeps the
 * committed `garden.generated.ts` snapshot as an offline fallback.
 */

const GRAPHQL_URL =
	import.meta.env.VITE_OMNI_API_GRAPHQL_URL ?? "https://api.omni.dev/graphql";

type GqlResponse = { errors?: unknown; data?: CatalogData };

export const fetchGarden = async (): Promise<GardenSchema> => {
	const res = await fetch(GRAPHQL_URL, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ query: CATALOG_QUERY }),
	});

	if (!res.ok) {
		throw new Error(`omni-api returned ${res.status}`);
	}

	const payload = (await res.json()) as GqlResponse;
	if (payload.errors || !payload.data) {
		throw new Error("omni-api returned no usable catalog");
	}

	return buildGarden(payload.data);
};
