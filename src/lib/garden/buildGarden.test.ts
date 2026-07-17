import { describe, expect, test } from "bun:test";

import { buildGarden } from "./buildGarden";

import type { CatalogData } from "./buildGarden";

/**
 * Guards the catalog -> garden transform shared by the build-time snapshot and
 * the runtime fetch. The visibility contract (launched or coming-soon only) and
 * the realm-less META bucket are the parts that have regressed before.
 */
const sample: CatalogData = {
	realms: {
		nodes: [
			{ slug: "core", name: "Core", icon: "🧱", tagline: "The foundation" },
			{ slug: "empty", name: "Empty", icon: "🫙", tagline: "No products" },
		],
	},
	products: {
		nodes: [
			{
				slug: "runa",
				name: "Runa",
				realm: { slug: "core" },
				releaseDate: "2025-12-21",
				status: "active",
				docsUrl: "/core/runa",
			},
			{
				slug: "orin",
				name: "Orin",
				realm: null,
				releaseDate: null,
				status: "coming_soon",
				docsUrl: "/orin",
			},
			{
				// Public but not launched and not teased -> must stay hidden
				slug: "secret",
				name: "Secret",
				realm: { slug: "core" },
				releaseDate: null,
				status: "active",
			},
		],
	},
	productLinks: {
		nodes: [
			{
				sourceProduct: { slug: "orin" },
				targetProduct: { slug: "runa" },
				status: "active",
				productLinkRelations: {
					nodes: [{ relationType: { slug: "integrates-with" } }],
				},
			},
			{
				// References the hidden product -> edge must drop out
				sourceProduct: { slug: "secret" },
				targetProduct: { slug: "runa" },
				productLinkRelations: { nodes: [] },
			},
		],
	},
};

describe("buildGarden", () => {
	const garden = buildGarden(sample);
	const sprouts = (garden.subgardens ?? []).flatMap((s) => s.sprouts ?? []);
	const names = sprouts.map((s) => s.name);

	test("includes launched and coming-soon products, hides the rest", () => {
		expect(names).toContain("Runa");
		expect(names).toContain("Orin");
		expect(names).not.toContain("Secret");
	});

	test("teases coming-soon products with the coming_soon flag", () => {
		const orin = sprouts.find((s) => s.name === "Orin");
		expect(orin?.coming_soon).toBe(true);
		expect(orin?.release_date).toBe("");
	});

	test("groups realm-less products under a META subgarden", () => {
		const meta = garden.subgardens?.find((s) => s.name === "META");
		expect(meta?.sprouts?.map((s) => s.name)).toContain("Orin");
	});

	test("drops realms with no visible products", () => {
		expect(garden.subgardens?.map((s) => s.name)).not.toContain("Empty");
	});

	test("resolves relative docs URLs to absolute https links", () => {
		const runa = sprouts.find((s) => s.name === "Runa");
		expect(runa?.docs_url).toBe("https://docs.omni.dev/core/runa");
	});

	test("keeps only edges between visible products", () => {
		// orin -> runa survives; secret -> runa drops with the hidden product
		expect(garden.edges).toHaveLength(1);
		expect(garden.edges?.[0]).toMatchObject({
			source: "Orin",
			target: "Runa",
			relations: ["integrates-with"],
		});
	});
});
