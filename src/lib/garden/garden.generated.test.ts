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

	test("includes only launched products", () => {
		// releaseDate is the catalog's launch signal, so every sprout must have one
		for (const sprout of sprouts) {
			expect(sprout.release_date).toBeTruthy();
		}

		const names = sprouts.map((sprout) => sprout.name);
		expect(names).not.toContain("See Less");
		expect(names).not.toContain("Sigil");
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
