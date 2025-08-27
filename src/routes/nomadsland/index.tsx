import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { client } from '~/sanity/lib/client'
import { POSTS_QUERY, CATEGORIES_QUERY } from '~/sanity/lib/queries'
import { useState } from 'react'
import { FilteredBlogContent } from '~/components/blog-content'
import type { Post, Category, SanitySlug, SanityCategory } from '~/types'
import { Image } from '~/components/ui/image'
import { sanityFetch } from '~/sanity/lib/live'

export const Route = createFileRoute('/nomadsland/')({
	loader: async ({ context: { queryClient } }) => {
		// await Promise.all([
		// 	queryClient.ensureQueryData({
		// 		queryKey: ['posts'],
		// 		queryFn: () => client.fetch(POSTS_QUERY),
		// 	}),
		// 	queryClient.ensureQueryData({
		// 		queryKey: ['categories'],
		// 		queryFn: () => client.fetch(CATEGORIES_QUERY),
		// 	}),
		// ])
		const posts = await queryClient.fetchQuery({
			queryKey: ['blog', 'posts'],
			queryFn: () => client.fetch(POSTS_QUERY),
		})

		if (!posts) {
			throw new Error('No posts found')
		}

		return posts;
	},
	component: BlogPage,
})

function BlogPage() {
	const posts = Route.useLoaderData();

	const formattedPosts: Post[] = posts.map((post: any) => ({
		title: post.title,
		file: post.slug.current,
		description: post.description ?? "",
		date: new Date(post._createdAt).toLocaleDateString(),
		datetime: post._createdAt,
		author: {
			name: post.author?.name ?? "Blue Nomad",
			role: "Founder",
			href: "#",
			imageUrl: "/images/blog/elie-profile.jpg",
		},
		imageUrl: post.imageUrl ?? "/studio_background.jpg",
		categories: post.categories.map((category: any) => category.title)
	}))

	return (
		<section className='mx-auto pt-32 px-4 lg:px-10 lg:flex-col text-brand-white relative'>
			<div className="absolute inset-0 -z-10">
				<Image
					src="/media_section_gradient.png"
					alt="Background"
					className="object-cover object-center"
					sizes="100vw"
				/>
			</div>

			<FilteredBlogContent posts={formattedPosts} />
		</section>
	)
}
