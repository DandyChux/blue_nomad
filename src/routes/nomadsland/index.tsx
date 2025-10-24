import { createFileRoute } from '@tanstack/react-router'
import { client } from '~/sanity/lib/client'
import { POSTS_QUERY } from '~/sanity/lib/queries'
import { FilteredBlogContent } from '~/components/blog-content'
import type { Post, SanityPost } from '~/types'
import { Image } from '~/components/ui/image'
import z from 'zod'

const blogSearchSchema = z.object({
	search: z.string().optional(),

})

export const Route = createFileRoute('/nomadsland/')({
	validateSearch: blogSearchSchema,
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
			queryFn: () => client.fetch<SanityPost[]>(POSTS_QUERY),
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

	console.log('Original Posts:', posts)
	const formattedPosts: Post[] = posts.map((post) => ({
		title: post.title,
		slug: post.slug,
		description: post.description ?? "",
		date: new Date(post._createdAt).toLocaleDateString(),
		author: post.author,
		imageUrl: post.imageUrl ?? "/studio_background.jpg",
		categories: post.categories?.map((category) => category.title)
	}))

	console.log('Formatted Posts:', formattedPosts)

	return (
		<section className='mx-auto pt-32 px-4 lg:px-10 lg:flex-col text-brand-white relative bg-media-section-gradient bg-center bg-cover bg-no-repeat'>
			<FilteredBlogContent posts={formattedPosts} />
		</section>
	)
}
