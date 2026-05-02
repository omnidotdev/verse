import app from "@/lib/config/app.config";

interface Params {
	title?: string;
	description?: string;
	image?: string;
	keywords?: string;
	url?: string;
}

/**
 * Create meta tags.
 */
const createMetaTags = ({
	title: _title,
	description: _description,
	url: _url,
	image,
	keywords,
}: Params = {}) => {
	const title = _title ? `${_title} | ${app.name}` : app.name,
		description = _description ?? app.description,
		url = _url ?? app.url;

	const ogImage = image ?? `${app.url}/og.png`;

	const tags = [
		{ title },
		{
			name: "description",
			content: description,
		},
		{ name: "keywords", content: keywords },
		{ name: "twitter:title", content: title },
		{
			name: "twitter:description",
			content: description,
		},
		{ name: "twitter:creator", content: "@omnidotdev" },
		{ name: "twitter:url", content: url },
		{ name: "twitter:image", content: ogImage },
		{ name: "twitter:card", content: "summary_large_image" },
		{ property: "og:type", content: "website" },
		{ property: "og:title", content: title },
		{
			property: "og:description",
			content: description,
		},
		{ property: "og:url", content: url },
		{ property: "og:image", content: ogImage },
		{ property: "og:image:width", content: "1200" },
		{ property: "og:image:height", content: "630" },
	];

	return tags;
};

export default createMetaTags;
