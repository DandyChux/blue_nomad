import { createFileRoute, notFound } from '@tanstack/react-router'
import { client } from '~/sanity/lib/client'
import { POST_QUERY } from '~/sanity/lib/queries'
import { ShareLinks } from '~/components/share-links'
import PortableText from '~/components/portable-text'
import { urlFor } from '~/sanity/lib/image'
import { Image } from '~/components/ui/image'

export const Route = createFileRoute('/nomadsland/$slug')({
	loader: async ({ params: { slug }, context: { queryClient } }) => {
		const post = await queryClient.fetchQuery({
			queryKey: ['post', slug],
			queryFn: () => client.fetch(POST_QUERY, { slug }),
		})

		if (!post) {
			throw notFound()
		}

		return post
	},
	component: BlogPostPage,
})

function BlogPostPage() {
	const post = Route.useLoaderData();
	console.log(post)

	const formattedDate = new Date(post.date).toLocaleDateString();

	return (
		<article className='px-8 md:px-16 lg:px-24 pt-32 pb-12 min-h-dvh text-secondary-foreground'>
			<nav className='mb-8'>
				<a href='/nomadsland' className='hover:underline'>
					← Back to posts
				</a>
			</nav>
			<h1 className='uppercase mb-8 leading-[3rem]'>{post.title}</h1>
			<p>{post.authorName}</p>
			<span>{formattedDate}</span>

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
						className='object-contain h-auto w-full rounded-md'
					/>
				</div>
			) : null}

			<div className='prose max-w-none font-spectral leading-7'>
				<PortableText
					content={post.body!}
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
								return <p className="mb-4 font-[500]">{children}</p>
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
							number: ({ children }) => {
								return <ol className="mb-4 list-decimal list-inside">{children}</ol>
							},
							bullet: ({ children }) => {
								return <ul className="mb-4 list-disc list-inside">{children}</ul>
							}
						},
						listItem: ({ children }) => {
							return <li className="mb-2">{children}</li>
						},
					}}
				/>
			</div>
		</article>
	)
}
