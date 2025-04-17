import type { Metadata, ResolvingMetadata } from 'next';
import { PortableText } from 'next-sanity';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { client } from '~/sanity/lib/client';
import { sanityFetch } from '~/sanity/lib/fetch';
import { urlFor } from '~/sanity/lib/image';
import { postPathsQuery, postQuery, postsQuery } from '~/sanity/lib/queries';
import type { Post as PostType } from '../types';
import imageUrlBuilder from '@sanity/image-url'
import { Divide } from 'lucide-react';

export const revalidate = 60; // Revalidate every minute

interface PageProps {
	params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
	const posts = await client.fetch(postPathsQuery)
	console.log(posts)

	return posts
}

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
	const params = await props.params;
	const post = await sanityFetch<PostType | undefined>({
		query: postQuery,
		params
	})

	if (!post) {
		return {}
	}

	const previousImages = (await parent).openGraph?.images || []

	const builder = imageUrlBuilder(client)
	const imageUrl = post.mainImage
		? builder
			.image(post.mainImage)
			.auto("format")
			.fit("max")
			.width(1200)
			.height(630)
			.url()
		: undefined

	return {
		title: post.title,
		description: post.description ?? "",
		openGraph: {
			images: imageUrl ? [imageUrl] : [],
		},
	};
}

export default async function PostPage({ params }: PageProps) {
	const post = await sanityFetch<PostType>({ query: postQuery, params })
	console.log(post)

	if (!post) {
		notFound();
	}

	return (
		<article className='px-8 md:px-16 lg:px-24 pt-32 pb-12 min-h-dvh bg-secondary text-secondary-foreground'>
			<nav className='mb-8'>
				<Link href='/blog' className='hover:underline'>
					← Back to posts
				</Link>
			</nav>
			<h1 className='uppercase mb-8'>{post.title}</h1>
			{/* <p>{post.description}</p> */}
			{post.mainImage ? (
				<Image
					src={urlFor(post.mainImage).width(800).url()}
					alt={post.mainImage.alt || ''}
					width={800}
					height={475}
					className='rounded-lg mb-8 h-auto w-full'
				/>
			) : null}

			<div className='prose max-w-none font-marcellus leading-7'>
				<PortableText
					value={post.body!}
					components={{
						types: {
							image: ({ value }) => (
								<Image
									src={urlFor(value).width(800).url()}
									width={800}
									height={400}
									alt={value.alt || ' '}
									className='rounded-lg my-8'
								/>
							),
						},
					}}
				/>
			</div>
		</article>
	);
}
