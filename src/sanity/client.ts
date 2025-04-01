import { createClient } from '@sanity-typed/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityValues } from '../../sanity.config';

export interface Post {
	_id: string
	title: string
	slug: { current: string }
	publishedAt: string
	body: any[]
	mainImage?: {
		asset: {
			_ref: string
			_type: 'reference'
		}
		alt?: string
	}
}

export const client = createClient<SanityValues>({
	projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
	dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
	apiVersion: '2023-10-01',
	useCdn: true,
	token: process.env.SANITY_VIEWER_TOKEN,
	stega: {
		studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL,
	}
})

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
	return builder.image(source);
}