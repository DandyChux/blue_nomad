import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
	projectId,
	dataset,
	// apiVersion,
	apiVersion: 'vX',
	useCdn: true,
	perspective: 'published',
	timeout: 30000,
	ignoreBrowserTokenWarning: true
})
