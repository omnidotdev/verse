import { describe, expect, test } from "bun:test";

import { buildGarden } from "./buildGarden";

import type { PublicCatalog } from "@omnidotdev/providers/catalog";

/**
 * Guards the catalog -> garden transform. The visibility contract (launched or
 * coming-soon only) and the realm-less META bucket are the parts that have
 * regressed before.
 */
const sample: PublicCatalog = {
	realms: [
		{ slug: "core", name: "Core", icon: "🧱", tagline: "The foundation" },
	],
	products: [
		{
			id: "runa",
			name: "Runa",
			realm: "core",
			releaseDate: "2025-12-21",
			status: "active",
			docsUrl: "/core/runa",
			deploymentMethods: [],
		},
		{
			id: "orin",
			name: "Orin",
			realm: null,
			status: "coming_soon",
			docsUrl: "/orin",
			deploymentMethods: [],
		},
		{
			// Public but not launched and not teased -> must stay hidden
			id: "secret",
			name: "Secret",
			realm: "core",
			status: "active",
			deploymentMethods: [],
		},
	],
	bundles: [],
	connections: [
		{
			id: "orin-runa",
			source: "orin",
			target: "runa",
			relations: ["integrates-with"],
		},
		{
			// References the hidden product -> edge must drop out
			id: "secret-runa",
			source: "secret",
			target: "runa",
			relations: [],
		},
	],
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

	test("resolves relative docs URLs to absolute https links", () => {
		const runa = sprouts.find((s) => s.name === "Runa");
		expect(runa?.docs_url).toBe("https://docs.omni.dev/products/runa");
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
