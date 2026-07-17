import type { GardenSchema } from "@omnidotdev/garden";

/**
 * Shared transform from the omni-api public catalog (GraphQL) onto the garden
 * schema the Omniverse renders. This is the single source of the mapping: the
 * build-time snapshot generator (`src/scripts/generateGarden.ts`) and the
 * runtime fetch (`src/lib/garden/fetchGarden.ts`) both call `buildGarden` so the
 * two paths can never drift.
 *
 * Maps realms -> subgardens, products -> sprouts, and the connection graph ->
 * typed cross-sprout `edges`. Only products the catalog has launched
 * (`releaseDate`) or explicitly teased (`status: "coming_soon"`) are shown; any
 * other product is still in flight and stays hidden until it ships (its typed
 * connections drop out with it).
 */

/**
 * The public catalog surface. `products` is filtered to `is_public` by the
 * server, so only public entries (and links between them) come back.
 */
export const CATALOG_QUERY = `{
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

/** The `data` payload shape returned by {@link CATALOG_QUERY}. */
export type CatalogData = {
	realms: Nodes<{
		slug: string;
		name: string;
		icon?: string | null;
		tagline?: string | null;
		description?: string | null;
	}>;
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
	releaseDate?: string;
	status?: string;
};

// Products the catalog explicitly marks `coming_soon` are teased alongside
// launched ones.
const COMING_SOON_STATUS = "coming_soon";
const isComingSoon = (p: Product): boolean => p.status === COMING_SOON_STATUS;

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

/** Transform the public catalog payload into the Omniverse garden schema. */
export const buildGarden = (data: CatalogData): GardenSchema => {
	const realms = data.realms.nodes.map((r) => ({
		slug: r.slug,
		name: r.name,
		icon: r.icon ?? undefined,
		tagline: r.tagline ?? undefined,
		description: r.description ?? undefined,
	}));

	const products: Product[] = data.products.nodes.map((p) => ({
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
	}));

	// Launched products render normally; `coming_soon` products are teased. Any
	// other product without a `releaseDate` is still in flight and stays hidden.
	const visibleProducts = products.filter(
		(p) => Boolean(p.releaseDate) || isComingSoon(p),
	);
	const productsById = new Map(visibleProducts.map((p) => [p.id, p]));

	// realms -> subgardens (each carries its products as sprouts). Realms with no
	// visible products are dropped so the garden never shows an empty branch.
	const subgardens = realms
		.map((realm) => ({
			name: realm.name,
			description: realm.tagline
				? `${realm.tagline} - ${realm.description ?? ""}`.trim()
				: (realm.description ?? ""),
			icon: realm.icon,
			supergardens: [{ name: "Omniverse" }],
			sprouts: visibleProducts
				.filter((p) => p.realm === realm.slug)
				.map(sprout),
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
	for (const link of data.productLinks.nodes) {
		const src = link.sourceProduct?.slug;
		const tgt = link.targetProduct?.slug;
		if (!src || !tgt) continue;
		const sourceName = productsById.get(src)?.name;
		const targetName = productsById.get(tgt)?.name;
		if (!sourceName || !targetName || sourceName === targetName) continue;
		edges.push({
			source: sourceName,
			target: targetName,
			relations: link.productLinkRelations.nodes
				.map((r) => r.relationType?.slug)
				.filter((s): s is string => Boolean(s)),
			description: link.description ?? undefined,
			status: link.status ?? undefined,
		});
	}

	return {
		name: "Omniverse",
		description: "The complete Omni product ecosystem",
		icon: "🌱",
		subgardens,
		edges,
	} as GardenSchema;
};
