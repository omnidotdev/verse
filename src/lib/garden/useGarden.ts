import { useQuery } from "@tanstack/react-query";

import { fetchGarden } from "./fetchGarden";
import { omniGarden } from "./garden.generated";

/**
 * The Omniverse garden, live from omni-api with the committed snapshot as
 * fallback. `initialData` paints instantly from the build-time snapshot, then a
 * background refetch swaps in the current catalog; if the fetch fails the
 * snapshot stays. This is why adding or launching a product in the API surfaces
 * in the visualizer with no rebuild.
 */
export const useGarden = () =>
	useQuery({
		queryKey: ["omniverse-garden"],
		queryFn: fetchGarden,
		initialData: omniGarden,
		// The snapshot seeds an instant first paint but is treated as already
		// stale (updatedAt 0), so a live refetch still fires on mount; without
		// this the staleTime below would suppress it and the snapshot would never
		// refresh. On fetch failure the cached snapshot stays, so it never blanks.
		initialDataUpdatedAt: 0,
		// After a successful live fetch, hold it for an hour; the catalog changes
		// rarely and the snapshot is a fine floor between refreshes.
		staleTime: 60 * 60 * 1000,
		retry: 1,
	});
