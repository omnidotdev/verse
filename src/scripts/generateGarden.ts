import { resolve } from "node:path";

/**
 * Build the Omniverse garden the visualizer renders from the catalog SSOT.
 *
 * Pulls the public catalog straight from omni-api's GraphQL (the catalog is
 * DB-synced there and filtered to `is_public` products server-side), then maps
 * it onto the garden schema: realms -> subgardens, products -> sprouts, and the
 * connection graph -> typed cross-sprout `edges`. The result is cached to the
 * committed `src/lib/garden/garden.generated.ts`; if omni-api is unreachable
 * (offline, or a CI build without egress) the existing committed cache is kept.
 * Never hand-edit that file.
 */

const GRAPHQL_URL =
	process.env.OMNI_API_GRAPHQL_URL ?? "https://api.omni.dev/graphql";
const outPath = resolve(import.meta.dir, "../lib/garden/garden.generated.ts");

type Product = {
	id: string;
	name: string;
	icon?: string;
	realm?: string | null;
	description?: string;
	tagline?: string;
	websiteUrl?: string;
	docsUrl?: string;
	license?: string;
	selfHostable?: boolean;
	/** ISO release date. Absent means the product has not launched yet. */
	releaseDate?: string;
	/**
	 * Lifecycle status from the catalog. "coming_soon" publicly teases a product
	 * before it ships; anything else is treated as a normal product.
	 */
	status?: string;
};
type Realm = {
	slug: string;
	name: string;
	icon?: string;
	description?: string;
	tagline?: string;
};
type Connection = {
	source: string | string[];
	target: string | string[];
	relations?: string[];
	description?: string;
	status?: string;
};
type Catalog = {
	realms: Realm[];
	products: Product[];
	connections: Connection[];
};

// The public catalog surface. `products` is filtered to `is_public` by the
// server, so only public entries (and links between them) come back.
const CATALOG_QUERY = `{
  realms(first: 100) { nodes { slug name icon tagline description } }
  products(first: 200) {
    nodes {
      slug name icon description tagline websiteUrl docsUrl license
      selfHostable releaseDate status realm { slug }
    }
  }
  productLinks(first: 1000) {
    nodes {
      sourceProduct { slug }
      targetProduct { slug }
      description status
      productLinkRelations { nodes { relationType { slug } } }
    }
  }
}`;

type Nodes<T> = { nodes: T[] };
type GqlResponse = {
	errors?: unknown;
	data?: {
		realms: Nodes<Realm>;
		products: Nodes<{
			slug: string;
			name: string;
			icon?: string | null;
			description?: string | null;
			tagline?: string | null;
			websiteUrl?: string | null;
			docsUrl?: string | null;
			license?: string | null;
			selfHostable?: boolean | null;
			releaseDate?: string | null;
			status?: string | null;
			realm?: { slug: string } | null;
		}>;
		productLinks: Nodes<{
			sourceProduct?: { slug: string } | null;
			targetProduct?: { slug: string } | null;
			description?: string | null;
			status?: string | null;
			productLinkRelations: Nodes<{ relationType?: { slug: string } | null }>;
		}>;
	};
};

let payload: GqlResponse | undefined;
try {
	const res = await fetch(GRAPHQL_URL, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ query: CATALOG_QUERY }),
	});
	if (res.ok) {
		payload = (await res.json()) as GqlResponse;
	} else {
		// biome-ignore lint/suspicious/noConsole: build script output
		console.warn(`[garden] omni-api ${GRAPHQL_URL} returned ${res.status}`);
	}
} catch (error) {
	// biome-ignore lint/suspicious/noConsole: build script output
	console.warn(
		`[garden] could not reach omni-api at ${GRAPHQL_URL} (${error})`,
	);
}

// Fall back to the committed cache when omni-api is unreachable or empty, so a
// build without egress (or during an outage) still ships the last good garden.
const data = payload?.data;
if (payload?.errors || !data) {
	// biome-ignore lint/suspicious/noConsole: build script output
	console.warn(
		"[garden] no usable catalog from omni-api; keeping committed garden.generated.ts",
	);
	process.exit(0);
}

// Map the GraphQL shape onto the flat catalog the rest of this script expects.
const catalog: Catalog = {
	realms: data.realms.nodes.map((r) => ({
		slug: r.slug,
		name: r.name,
		icon: r.icon ?? undefined,
		tagline: r.tagline ?? undefined,
		description: r.description ?? undefined,
	})),
	products: data.products.nodes.map((p) => ({
		id: p.slug,
		name: p.name,
		icon: p.icon ?? undefined,
		realm: p.realm?.slug ?? null,
		description: p.description ?? undefined,
		tagline: p.tagline ?? undefined,
		websiteUrl: p.websiteUrl ?? undefined,
		docsUrl: p.docsUrl ?? undefined,
		license: p.license ?? undefined,
		selfHostable: p.selfHostable ?? undefined,
		releaseDate: p.releaseDate ?? undefined,
		status: p.status ?? undefined,
	})),
	connections: data.productLinks.nodes
		.filter((l) => l.sourceProduct && l.targetProduct)
		.map((l) => ({
			source: (l.sourceProduct as { slug: string }).slug,
			target: (l.targetProduct as { slug: string }).slug,
			relations: l.productLinkRelations.nodes
				.map((r) => r.relationType?.slug)
				.filter((s): s is string => Boolean(s)),
			description: l.description ?? undefined,
			status: l.status ?? undefined,
		})),
};

// Launched products render normally; products the catalog explicitly marks
// `coming_soon` are teased alongside them. `releaseDate` is the catalog's launch
// signal, so any other product without one is still in flight and stays hidden
// until it ships (its typed connections drop out with it).
const COMING_SOON_STATUS = "coming_soon";
const isComingSoon = (p: Product): boolean => p.status === COMING_SOON_STATUS;
const visibleProducts = catalog.products.filter(
	(p) => Boolean(p.releaseDate) || isComingSoon(p),
);

const productsById = new Map(visibleProducts.map((p) => [p.id, p]));
const asArray = (v: string | string[]): string[] =>
	Array.isArray(v) ? v : [v];

// Docs URLs in the catalog are paths on the central docs site (e.g.
// `/core/runa`); absolute URLs pass through untouched.
const DOCS_BASE = "https://docs.omni.dev";
const resolveDocsUrl = (docsUrl?: string): string => {
	if (!docsUrl) return "";
	return /^https?:\/\//.test(docsUrl) ? docsUrl : `${DOCS_BASE}${docsUrl}`;
};

const sprout = (p: Product) => ({
	name: p.name,
	homepage_url: p.websiteUrl ?? "",
	description: p.description ?? "",
	logo: p.icon ?? "",
	tagline: p.tagline ?? "",
	license: p.license ?? "",
	release_date: p.releaseDate ?? "",
	self_hostable: p.selfHostable ?? false,
	coming_soon: isComingSoon(p),
	docs_url: resolveDocsUrl(p.docsUrl),
});

// realms -> subgardens (each carries its products as sprouts). Realms with no
// visible products are dropped so the garden never shows an empty branch.
const subgardens = catalog.realms
	.map((realm) => ({
		name: realm.name,
		description: realm.tagline
			? `${realm.tagline} - ${realm.description ?? ""}`.trim()
			: (realm.description ?? ""),
		icon: realm.icon,
		supergardens: [{ name: "Omniverse" }],
		sprouts: visibleProducts.filter((p) => p.realm === realm.slug).map(sprout),
	}))
	.filter((subgarden) => subgarden.sprouts.length > 0);

// realm-less products (Orin, Launcher, ...) grouped so they aren't lost
const orphanProducts = visibleProducts.filter((p) => !p.realm);
if (orphanProducts.length) {
	subgardens.push({
		name: "META",
		description: "Cross-realm products that span the whole ecosystem",
		icon: "🌐",
		supergardens: [{ name: "Omniverse" }],
		sprouts: orphanProducts.map(sprout),
	});
}

// connection graph -> typed cross-sprout edges (endpoints matched by name)
const edges: Array<{
	source: string;
	target: string;
	relations: string[];
	description?: string;
	status?: string;
}> = [];
for (const conn of catalog.connections) {
	for (const src of asArray(conn.source)) {
		for (const tgt of asArray(conn.target)) {
			const sourceName = productsById.get(src)?.name;
			const targetName = productsById.get(tgt)?.name;
			if (!sourceName || !targetName || sourceName === targetName) continue;
			edges.push({
				source: sourceName,
				target: targetName,
				relations: conn.relations ?? [],
				description: conn.description,
				status: conn.status,
			});
		}
	}
}

const garden = {
	name: "Omniverse",
	description: "The complete Omni product ecosystem",
	icon: "🌱",
	subgardens,
	edges,
};

const file = `/**
 * Omniverse garden, generated from the catalog SSOT (omni-api GraphQL).
 *
 * AUTO-GENERATED by src/scripts/generateGarden.ts. Do not edit by hand.
 * Refresh with \`bun run src/scripts/generateGarden.ts\`.
 */

import type { GardenSchema } from "@omnidotdev/garden";

export const omniGarden = ${JSON.stringify(garden, null, 2)} as GardenSchema;
`;

await Bun.write(outPath, file);

// biome-ignore lint/suspicious/noConsole: build script output
console.info(
	`[garden] Wrote ${subgardens.length} realms, ${visibleProducts.length} products (${visibleProducts.filter(isComingSoon).length} coming soon), ${edges.length} edges`,
);
