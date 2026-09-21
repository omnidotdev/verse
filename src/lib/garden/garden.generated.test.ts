import { describe, expect, test } from "bun:test";

import { omniGarden } from "./garden.generated";

/**
 * Guards the contract of the generated Omniverse garden: it must only carry
 * launched products and the enriched catalog metadata the teaser depends on.
 * Regenerate with `bun run src/scripts/generateGarden.ts` if the catalog changes.
 */
describe("omniGarden", () => {
	const sprouts = (omniGarden.subgardens ?? []).flatMap(
		(subgarden) => subgarden.sprouts ?? [],
	);

	test("has realms carrying products", () => {
		expect(omniGarden.subgardens?.length ?? 0).toBeGreaterThan(0);
		expect(sprouts.length).toBeGreaterThan(0);
	});

	test("includes only launched or coming-soon products", () => {
		// A sprout is visible only if it has launched (releaseDate is the catalog's
		// launch signal) or is explicitly teased as coming soon
		for (const sprout of sprouts) {
			expect(Boolean(sprout.release_date) || sprout.coming_soon).toBeTruthy();
		}

		// See Less has no releaseDate in the catalog, so the launched-only filter
		// must keep dropping it: guards against unlaunched products leaking in.
		// (Sigil was also dropped here until the catalog gave it its real launch
		// date, 2023-10-30, so it now legitimately appears as a launched product.)
		const names = sprouts.map((sprout) => sprout.name);
		expect(names).not.toContain("See Less");
	});

	test("carries the enriched catalog metadata", () => {
		for (const sprout of sprouts) {
			expect(sprout).toHaveProperty("tagline");
			expect(sprout).toHaveProperty("license");
			expect(sprout).toHaveProperty("self_hostable");
			expect(sprout).toHaveProperty("docs_url");
		}
	});

	test("resolves docs URLs to absolute https links", () => {
		for (const sprout of sprouts) {
			if (sprout.docs_url) {
				expect(sprout.docs_url).toMatch(/^https:\/\//);
			}
		}
	});
});
