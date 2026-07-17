import type { GardenSchema } from "@omnidotdev/garden";
import type {
	PublicCatalog,
	PublicProduct,
} from "@omnidotdev/providers/catalog";

/**
 * Transform the public catalog (from @omnidotdev/providers) into the garden
 * schema the Omniverse renders. The catalog fetch, query, and GraphQL-to-flat
 * mapping live in the shared client; this owns only the garden-specific shape:
 * realms -> subgardens, products -> sprouts, and the connection graph -> typed
 * cross-sprout `edges`.
 *
 * Only products the catalog has launched (`releaseDate`) or explicitly teased
 * (`status: "coming_soon"`) are shown; any other product is still in flight and
 * stays hidden (its typed connections drop out with it).
 */

// Products the catalog explicitly marks `coming_soon` are teased alongside
// launched ones.
const COMING_SOON_STATUS = "coming_soon";
const isComingSoon = (p: PublicProduct): boolean =>
	p.status === COMING_SOON_STATUS;

// Docs URLs in the catalog are paths on the central docs site (e.g.
// `/core/runa`); absolute URLs pass through untouched.
const DOCS_BASE = "https://docs.omni.dev";
const resolveDocsUrl = (docsUrl?: string): string => {
	if (!docsUrl) return "";
	return /^https?:\/\//.test(docsUrl) ? docsUrl : `${DOCS_BASE}${docsUrl}`;
};

const sprout = (p: PublicProduct) => ({
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

/** Transform the public catalog into the Omniverse garden schema. */
export const buildGarden = (catalog: PublicCatalog): GardenSchema => {
	// Launched products render normally; `coming_soon` products are teased. Any
	// other product without a `releaseDate` is still in flight and stays hidden.
	const visibleProducts = catalog.products.filter(
		(p) => Boolean(p.releaseDate) || isComingSoon(p),
	);
	const productsById = new Map(visibleProducts.map((p) => [p.id, p]));

	// realms -> subgardens (each carries its products as sprouts). Realms with no
	// visible product are dropped so the garden never shows an empty branch.
	const subgardens = catalog.realms
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
	for (const conn of catalog.connections) {
		const sourceName = productsById.get(conn.source)?.name;
		const targetName = productsById.get(conn.target)?.name;
		if (!sourceName || !targetName || sourceName === targetName) continue;
		edges.push({
			source: sourceName,
			target: targetName,
			relations: conn.relations,
			description: conn.description,
			status: conn.status,
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
