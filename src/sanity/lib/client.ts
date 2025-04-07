import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
// import type { SanityValues } from '../../../sanity.config';
import { apiVersion, dataset, projectId } from '../env'
import { ClientConfig } from 'next-sanity';

const config: ClientConfig = {
	projectId,
	apiVersion,
	dataset,
	useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
	token: process.env.SANITY_VIEWER_TOKEN,
	stega: {
		studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL,
	}
}

export const client = createClient(config)
