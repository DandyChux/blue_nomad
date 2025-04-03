import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
// import type { SanityValues } from '../../../sanity.config';
import { apiVersion, dataset, projectId } from '../env'
import { ClientConfig } from 'next-sanity';

export interface Post {
	_id: string
	title: string
	slug: { current: string }
	publishedAt: string
	excerpt: string
	body: any[]
	mainImage?: {
		asset: {
			_ref: string
			_type: 'reference'
		}
		alt?: string
	}
}

const config: ClientConfig = {
	projectId: projectId,
	apiVersion: apiVersion,
	dataset: dataset,
	useCdn: true,
	token: process.env.SANITY_VIEWER_TOKEN,
	stega: {
		studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL,
	}
}

export const client = createClient(config)
const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
	return builder.image(source);
}
