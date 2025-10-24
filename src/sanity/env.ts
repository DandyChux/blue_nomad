export const apiVersion =
	import.meta.env.VITE_SANITY_API_VERSION || '2025-04-07'

export const dataset = assertValue(
	import.meta.env.VITE_SANITY_DATASET,
	'Missing environment variable: VITE_SANITY_DATASET'
)

export const projectId = assertValue(
	import.meta.env.VITE_SANITY_PROJECT_ID,
	'Missing environment variable: VITE_SANITY_PROJECT_ID'
)

function assertValue<T>(v: T | undefined, errorMessage: string): T {
	if (v === undefined) {
		throw new Error(errorMessage)
	}

	return v
}
