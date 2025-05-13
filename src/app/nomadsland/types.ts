import type { PortableTextBlock } from "next-sanity"

export type SanitySlug = {
	_type: 'slug',
	current: string
}

export type SanityCategory = {
	title: string;
	slug: SanitySlug;
	description?: string
}

export type Post = {
	title: string;
	file: string;
	description: string;
	date: string;
	categories: string[];
	datetime: string;
	author: { name: string; role: string; href: string; imageUrl: string };
	imageUrl: string;
};

export type FormattedPost = {
	title: string;
	description: string | null;
	mainImage: {
		_type: 'image';
		alt: string;
		asset: {
			_ref: string
			_type: 'reference'
		}
	} | null;
	categories: SanityCategory[];
	body: PortableTextBlock[] | null;
	authorName: string | null;
	authorImage: string | null;
}
