import type { Post, SanityCategory, SanitySlug } from './types';
import { postPathsQuery, postsQuery } from '~/sanity/lib/queries';
import { sanityFetch } from '~/sanity/lib/live';
import { FilteredBlogContent } from '~/components/blog-content';
import Image from 'next/image';

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
	const { data: posts } = await sanityFetch({
		query: postsQuery,
		tags: ['blog', 'posts'],
	})

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
					fill
					priority
					placeholder="blur"
					blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmZmZmZmYiPjwvcmVjdD48L3N2Zz4="
					className="object-cover object-center"
					sizes="100vw"
				/>
			</div>

			<FilteredBlogContent posts={formattedPosts} />
		</section>
	);
}

export const revalidate = 3600; // Revalidate every hour
