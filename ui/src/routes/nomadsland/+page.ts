import type { PageLoad } from "./$types";
import type { Post, SanityPost } from "$lib/schemas/post";
import { apiClient } from "$lib/api";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async () => {
	let posts: Post[] = [];

	try {
		const raw = await apiClient.get<SanityPost[]>("/posts");
		posts = (raw ?? []).map((post) => ({
			title: post.title,
			file: post.slug,
			description: post.description ?? "",
			date: new Date(post._createdAt).toLocaleDateString(),
			datetime: post._createdAt,
			author: post.author
				? {
						name: post.author.name ?? "Blue Nomad",
						role: "Founder",
						href: "#",
						imageUrl: "/images/blog/elie-profile.jpg",
					}
				: null,
			imageUrl: post.imageUrl ?? "/studio_background.jpg",
			categories: (post.categories ?? []).map((c: any) => c.title),
		}));
	} catch (err) {
		console.error("Failed to fetch posts:", err);
		error(500, "Failed to fetch posts: ");
	}

	return {
		posts,
		navbar: {
			position: "absolute",
			variant: "light",
		},
	};
};
