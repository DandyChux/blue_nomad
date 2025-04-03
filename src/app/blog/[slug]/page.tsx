import type { Metadata } from 'next';
import { PortableText } from 'next-sanity';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { client, urlFor } from '~/sanity/lib/client';

interface PageProps {
	params: {
		slug: string;
	}
}

async function getPost(slug: string) {
	return client.fetch(
		`*[_type == "post" && slug.current == $slug][0] {
			_id,
			title,
			publishedAt,
			body,
			mainImage {
				...,
				asset->{
					_id,
					url
				}
			}
		}`,
		{ slug }
	);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const post = await getPost(params.slug);

	if (!post) {
		return {
			title: 'Post not found',
			description: 'The requested post could not be found'
		}
	}

	return {
		title: post.title,
		description: post.description || 'Blog post',
		openGraph: {
			images: post.mainImage ? [urlFor(post.mainImage).url()] : [],
		},
	};
}

export async function generateStaticParams() {
	const posts = await client.fetch(
		`*[_type == "post"] { "slug": slug.current }`
	);

	return posts.map((post: any) => ({
		slug: post.slug,
	}));
}

export default async function PostPage({ params }: PageProps) {
	const post = await getPost(params.slug);

	if (!post) {
		notFound();
	}

	return (
		<article className='container mx-auto pt-32 pb-12 min-h-dvh'>
			<nav className='mb-8'>
				<Link href='/blog' className='text-blue-600 hover:underline'>
					Back to Blog
				</Link>
			</nav>
			<h1 className='text-4xl font-bold'>{post.title}</h1>
			<time className='text-muted-foreground text-sm mb-4'>
				{new Date(post.publishedAt).toLocaleDateString()}
			</time>
			{post.mainImage && (
				<Image
					src={urlFor(post.mainImage).width(1200).url()}
					width={1200}
					height={600}
					alt={post.mainImage.alt || 'Post Image'}
					className='rounded-lg mb-8'
				/>
			)}

			<div className='prose max-w-none'>
				<PortableText
					value={post.body}
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

export const revalidate = 60; // Revalidate every minute
