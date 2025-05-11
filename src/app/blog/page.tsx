import type { Post, SanityCategory, SanitySlug } from './types';
import { postPathsQuery, postsQuery } from '~/sanity/lib/queries';
import { sanityFetch } from '~/sanity/lib/fetch';
import { FilteredBlogContent } from '~/components/blog-content';

type SanityPost = {
	title: string;
	description: string | null;
	slug: SanitySlug;
	categories: SanityCategory[];
	mainImage: {
		_type: 'image';
		alt: string;
		asset: {
			_ref: string
			_type: 'reference'
		}
	} | null;
	imageUrl: string | null;
	author: {
		name: string;
		bio: string | null;
		image: string | null;
		slug: string | null;
	} | null,
	_createdAt: string;
};


export default async function BlogPage() {
	const posts = await sanityFetch<SanityPost[]>({
		query: postsQuery,
		tags: ['blog', 'posts']
	})

	const formattedPosts: Post[] = posts.map((post) => ({
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
		categories: post.categories.map(category => category.title)
	}))

	return (
		<section className='mx-auto pt-32 px-4 lg:px-10 lg:flex-col bg-media-section-gradient bg-no-repeat bg-cover bg-center text-primary-foreground'>
			<FilteredBlogContent posts={formattedPosts} />
		</section>
	);
}

export const revalidate = 60; // Revalidate every minute
