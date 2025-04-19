import Link from 'next/link';
import { client } from '~/sanity/lib/client';
import type { Post as PostType } from './types';
import { postPathsQuery, postsQuery } from '~/sanity/lib/queries';
import { sanityFetch } from '~/sanity/lib/fetch';
import { Card, CardContent } from '~/components/ui/card';
import Image from 'next/image';
import { Badge } from '~/components/ui/badge';

type Post = {
	title: string;
	file: string;
	description: string;
	date: string;
	categories: string[];
	datetime: string;
	author: { name: string; role: string; href: string; imageUrl: string };
	imageUrl: string;
};

type SanitySlug = {
	_type: 'slug',
	current: string
}

type SanityCategory = {
	title: string;
	slug: SanitySlug;
	description?: string
}

type SanityPost = {
	title: string;
	description: string | null;
	slug: SanitySlug;
	categories: SanityCategory[];
	mainImage: PostType["mainImage"];
	imageURL: string | null;
	authorName: string;
	_createdAt: string;
};


export default async function BlogPage() {
	const posts = await sanityFetch<SanityPost[]>({ query: postsQuery })
	console.log(posts)

	return (
		<section className='mx-auto pt-32 px-4 lg:px-10 lg:flex-col bg-secondary text-white'>
			<div className='text-center'>
				{/* <h1 className='mb-8 uppercase'>Nomad's Land</h1> */}
				{/* <p className='text-2xl lg:text-3xl'>People, Places, & Vibes That Interest Us</p> */}
			</div>
			<div className='grid gap-8'>
				<Posts posts={posts} />
			</div>
		</section>
	);
}

function Posts({ posts }: { posts: SanityPost[] }) {
	const allPosts: Post[] = [
		...posts.map((post) => ({
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
		})),
		// ...mdxPosts,
	];

	return (
		<div className="py-16 sm:py-24">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				{allPosts.length === 0 ? (
					<div className="text-center py-12">
						<h3 className="text-xl lg:text-2xl font-semibold mb-2">No posts available yet</h3>
						<p className='text-lg lg:text-xl'>Please check back later for new content!</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{allPosts.map((post) => (
							<PostCard key={post.title} post={post} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}

function PostCard({ post }: { post: Post }) {
	return (
		<Card className="overflow-hidden transition-transform duration-300 hover:scale-105 bg-transparent border-none shadow-none rounded-none">
			<Link href={`/blog/${post.file}`}>
				<div className="relative aspect-video w-full">
					<Image
						src={post.imageUrl}
						alt={post.title}
						fill
						objectFit='cover'
					/>
				</div>
				<CardContent className="pt-4">
					<h3 className="mb-2 font-marcellus text-lg leading-6 group-hover:text-gray-600">
						{post.title}
					</h3>
					<div className='inline-flex items-center gap-x-4'>
						{post.categories.map((category, index) => (
							<Badge key={index} variant={'outline'} className='text-sm'>
								{category}
							</Badge>
						))}
					</div>
				</CardContent>
			</Link>
		</Card>
	);
}

export const revalidate = 60; // Revalidate every minute
