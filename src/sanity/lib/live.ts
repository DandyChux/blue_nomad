import { defineLive } from "next-sanity";
import { client } from "./client";

export const { sanityFetch, SanityLive } = defineLive({
	client: client.withConfig({
		apiVersion: 'vX',
		useCdn: false,
		perspective: "published",
		timeout: 10000 // 10 seconds
	}) as any
})
