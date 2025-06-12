import { defineLive } from "next-sanity";
import { client } from "./client";
import { apiVersion } from "../env";

export const { sanityFetch, SanityLive } = defineLive({
	client: client.withConfig({
		apiVersion: apiVersion,
		// useCdn: false,
		perspective: "published",
		timeout: 30000, // 30 seconds
		ignoreBrowserTokenWarning: true
	}) as any,
	fetchOptions: {
		revalidate: 60,
	}
})
