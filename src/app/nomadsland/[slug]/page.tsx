import type { Metadata, ResolvingMetadata } from 'next';
import { PortableText } from 'next-sanity';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { client } from '~/sanity/lib/client';
import { sanityFetch } from '~/sanity/lib/live';
import { urlFor } from '~/sanity/lib/image';
import { postPathsQuery, postQuery, postsQuery } from '~/sanity/lib/queries';
import type { FormattedPost as PostType } from '../types';
import imageUrlBuilder from '@sanity/image-url'
import { ShareLinks } from '~/components/share-links';
import { Separator } from '~/components/ui/separator';

export const revalidate = 1800 // 30 minutes

interface PageProps {
	params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
	try {
		// Add retry logic for robustness
		const fetchWithRetry = async (retries = 3, delay = 1000) => {
			try {
				return await client.fetch(postPathsQuery);
			} catch (error) {
				if (retries <= 0) throw error;
				await new Promise(resolve => setTimeout(resolve, delay));
				return fetchWithRetry(retries - 1, delay * 2);
			}
		};

		const posts = await fetchWithRetry();

		return posts;
	} catch (error) {
		console.error('Error generating static params:', error);
		return [];
	}
}



export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
	const params = await props.params;
	const { data: post } = await sanityFetch({
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
	const resolvedParams = await params;
	const { data: post } = await sanityFetch({
		query: postQuery,
		params: resolvedParams,
		tags: ['post', `post-${resolvedParams.slug}`]
	})

	if (!post) {
		console.log(`Post not found for slug: ${resolvedParams.slug}`);
		notFound();
	}

	const formattedDate = new Date(post.date).toLocaleDateString();

	return (
		<article className='px-8 md:px-16 lg:px-24 pt-32 pb-12 min-h-dvh text-secondary-foreground'>
			<nav className='mb-8'>
				<Link href='/nomadsland' className='hover:underline'>
					← Back to posts
				</Link>
			</nav>
			<h1 className='uppercase mb-8 leading-12'>{post.title}</h1>
			<p>{post.authorName}</p>
			<span>{formattedDate}</span>

			<ShareLinks
				title={post.title}
				description={post.description || ''}
				className="w-full justify-end"
			/>

			{/* <p>{post.description}</p> */}
			{post.mainImage ? (
				<div className='mb-8 relative aspect-4/3 max-w-[750px] mx-auto'>
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
								return <p className="mb-4 font-medium">{children}</p>
							},
							quote: ({ children }) => {
								return <blockquote className="mb-4 font-medium">{children}</blockquote>
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
							bullet: ({ children }: any) => (
								<ul className="my-5 ml-10 list-disc tracking-[0.005em] text-base text-[#333a4a]">
									{children}
								</ul>
							),
							number: ({ children }: any) => (
								<ol className="my-5 ml-10 list-decimal tracking-[0.005em] text-base text-[#333a4a]">
									{children}
								</ol>
							),
							ordered: ({ children }) => (
								<ol className="mb-6 pl-4">{children}</ol>
							),
							unordered: ({ children }) => (
								<ul className="mb-6 pl-4">{children}</ul>
							)
						},
						listItem: ({ children }) => {
							return <li className="mb-2 list-disc list-inside">{children}</li>
						},
						hardBreak: () => {
							return <br className="mb-4" />;
						},
						marks: {
							link: ({ children, value }) => {
								const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined
								return (
									<a href={value.href} target='_blank' rel={rel}>
										{children}
									</a>
								)
							},
							internalLink: ({ children, value }) => {
								return (
									<a href={value.href}>
										{children}
									</a>
								)
							},
						}
					}}
				/>
			</div>
		</article>
	);
}
