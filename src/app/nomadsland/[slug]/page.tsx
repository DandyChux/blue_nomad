import type { Metadata, ResolvingMetadata } from 'next';
import { PortableText } from 'next-sanity';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { client } from '~/sanity/lib/client';
import { sanityFetch } from '~/sanity/lib/fetch';
import { urlFor } from '~/sanity/lib/image';
import { postPathsQuery, postQuery, postsQuery } from '~/sanity/lib/queries';
import type { FormattedPost as PostType } from '../types';
import imageUrlBuilder from '@sanity/image-url'
import { ShareLinks } from '~/components/share-links';
import { Separator } from '~/components/ui/separator';

export const revalidate = 60; // Revalidate every minute

interface PageProps {
	params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
	const posts = await client.fetch(postPathsQuery)

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

	if (!post) {
		notFound();
	}

	return (
		<article className='px-8 md:px-16 lg:px-24 pt-32 pb-12 min-h-dvh text-secondary-foreground'>
			<nav className='mb-8'>
				<Link href='/nomadsland' className='hover:underline'>
					← Back to posts
				</Link>
			</nav>
			<h1 className='uppercase mb-8'>{post.title}</h1>
			<p className='text-cold-ivory'>{post.authorName}</p>

			<ShareLinks
				title={post.title}
				description={post.description || ''}
				className="w-full justify-end"
			/>

			{/* <p>{post.description}</p> */}
			{post.mainImage ? (
				<div className='mb-8 relative aspect-[4/3] max-w-[750px] mx-auto'>
					<Image
						src={urlFor(post.mainImage).width(800).url()}
						alt={post.mainImage.alt || ''}
						// width={800}
						// height={475}
						fill
						className='object-contain h-auto w-full rounded-md'
					/>
				</div>
			) : null}

			<div className='prose max-w-none font-spectral leading-7'>
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
									className='rounded-lg my-8 mx-auto'
								/>
							),
						},
						block: {
							normal: ({ children }) => {
								return <p className="mb-4">{children}</p>
							},
							h1: ({ children }) => {
								return <h1 className="mb-4 font-extrabold">{children}</h1>
							},
							h2: ({ children }) => {
								return <h2 className="mb-4 font-extrabold">{children}</h2>
							},
							h3: ({ children }) => {
								return <h3 className="mb-4 font-extrabold">{children}</h3>
							},
							h4: ({ children }) => {
								return <h4 className="mb-4 font-extrabold">{children}</h4>
							},
							h5: ({ children }) => {
								return <h5 className="mb-4 font-extrabold">{children}</h5>
							},
							h6: ({ children }) => {
								return <h6 className="mb-4 font-extrabold">{children}</h6>
							},
						},
						list: {
							ordered: ({ children }) => {
								return <ol className="mb-6">{children}</ol>
							},
							unordered: ({ children }) => {
								return <ul className="mb-6">{children}</ul>
							}
						},
						listItem: ({ children }) => {
							return <li className="mb-2 list-disc list">{children}</li>
						},
						// hardBreak: () => {
						// 	return <Separator className="my-4" />;
						// },
					}}
				/>
			</div>
		</article>
	);
}
