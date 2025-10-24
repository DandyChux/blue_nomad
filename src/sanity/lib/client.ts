import { ClientReturn, createClient, QueryParams, SyncTag } from "@sanity/client"

export const client = createClient({
	projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
	dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
	apiVersion: 'vX',
	useCdn: true,
	perspective: 'published',
	timeout: 30000,
	ignoreBrowserTokenWarning: true
})

export async function sanityFetch<const QueryString extends string>({
	query,
	params = {},
	lastLiveEventId,
}: {
	query: QueryString
	params?: QueryParams
	lastLiveEventId: string | undefined
}): Promise<{ data: ClientReturn<QueryString, unknown>; tags?: SyncTag[] }> {
	const { result, syncTags } = await client.fetch(query, params, {
		filterResponse: false,
		lastLiveEventId,
	})

	return { data: result, tags: syncTags }
}
