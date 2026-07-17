import { fetchPublicCatalog } from "@omnidotdev/providers/catalog";

import { buildGarden } from "./buildGarden";

import type { GardenSchema } from "@omnidotdev/garden";

/**
 * Fetch the live public catalog from omni-api and transform it into the
 * Omniverse garden. Runs in the browser at render time so the visualizer always
 * reflects the current catalog (a product added or launched in the API shows up
 * on the next load, no rebuild). If the fetch fails, the caller keeps the
 * committed `garden.generated.ts` snapshot as an offline fallback.
 */
const GRAPHQL_URL = import.meta.env.VITE_OMNI_API_GRAPHQL_URL as
	| string
	| undefined;

export const fetchGarden = async (): Promise<GardenSchema> => {
	const catalog = await fetchPublicCatalog(
		GRAPHQL_URL ? { url: GRAPHQL_URL } : {},
	);
	return buildGarden(catalog);
};
