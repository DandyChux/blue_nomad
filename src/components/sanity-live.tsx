import type { LiveEventMessage, LiveEventRestart, LiveEventWelcome } from '@sanity/client'
import { CorsOriginError } from '@sanity/client'
import { useRouter, useRouterState } from '@tanstack/react-router'
import { useEffect, useCallback, useRef } from 'react'
import { client } from '~/sanity/lib/client'

export function SanityLive() {
	const selected = useRouterState({ select: (state) => state.matches })
	const router = useRouter()
	const lastLiveEventIdRef = useRef<string | undefined>(undefined)

	const allTags = selected.flatMap((match) => {
		if (
			typeof match.loaderData === 'object' &&
			match.loaderData !== null &&
			'tags' in match.loaderData
		) {
			return match.loaderData.tags
		}
		return []
	})

	const handleLiveEvent = useCallback((event: LiveEventMessage | LiveEventRestart | LiveEventWelcome) => {
		if (event.type === 'welcome') {
			console.info('Sanity is live with automatic invalidation of published content')
			// @ts-expect-error - @TODO upgrade `@sanity/client` with the id of welcome events
			lastLiveEventIdRef.current = event.id
		} else if (event.type === 'message') {
			if (event.tags.some((tag) => allTags.includes(tag))) {
				console.log('Sanity content updated, invalidating cache', event.tags)
				lastLiveEventIdRef.current = event.id
				// Only invalidate the router, don't update URL
				router.invalidate()
			} else {
				console.log('no match', event.tags, { allTags })
			}
		} else if (event.type === 'restart') {
			console.log('Sanity live connection restarted, invalidating cache')
			if (lastLiveEventIdRef.current) {
				lastLiveEventIdRef.current = undefined
			}
			// Invalidate to refresh content after restart
			router.invalidate()
		}
	}, [router, allTags])

	useEffect(() => {
		const subscription = client.live.events().subscribe({
			next: (event) => {
				if (event.type === 'message' || event.type === 'restart' || event.type === 'welcome') {
					handleLiveEvent(event)
				}
			},
			error: (error: unknown) => {
				if (error instanceof CorsOriginError) {
					console.warn(
						`Sanity Live is unable to connect to the Sanity API as the current origin - ${window.origin} - is not in the list of allowed CORS origins for this Sanity Project.`,
						error.addOriginUrl && `Add it here:`,
						error.addOriginUrl?.toString(),
					)
				} else {
					console.error(error)
				}
			},
		})
		return () => subscription.unsubscribe()
	}, [handleLiveEvent])

	return null
}
SanityLive.displayName = 'SanityLive'
