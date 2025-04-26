import Link from 'next/link';
import { client } from '~/sanity/lib/client';
import type { Post, SanityCategory, SanitySlug } from './types';
import { postPathsQuery, postsQuery } from '~/sanity/lib/queries';
import { sanityFetch } from '~/sanity/lib/fetch';
import { Card, CardContent } from '~/components/ui/card';
import Image from 'next/image';
import { Badge } from '~/components/ui/badge';
import { PostFilter } from '~/components/post-filter';
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
	imageURL: string | null;
	authorName: string;
	_createdAt: string;
};


export default async function BlogPage() {
	const posts = await sanityFetch<SanityPost[]>({ query: postsQuery })

	const formattedPosts: Post[] = posts.map((post) => ({
		title: post.title,
		file: post.slug.current,
		description: post.description ?? "",
		date: new Date(post._createdAt).toLocaleDateString(),
		datetime: post._createdAt,
		author: {
			name: post.authorName,
			role: "Founder",
			href: "#",
			imageUrl: "/images/blog/elie-profile.jpg",
		},
		imageUrl: post.imageURL ?? "/studio_background.jpg",
		categories: post.categories.map(category => category.title)
	}))

	return (
		<section className='mx-auto pt-32 px-4 lg:px-10 lg:flex-col bg-secondary text-black'>
			<FilteredBlogContent posts={formattedPosts} />
		</section>
	);
}

export const revalidate = 60; // Revalidate every minute
