import Link from 'next/link';
import { client, Post } from '~/sanity/lib/client';

async function getPosts() {
	return client.fetch(`
		*[_type == "post"] | order(publishedAt desc) {
		_id,
		title,
		publishedAt,
		slug
		}
	`);
}

export default async function BlogPage() {
	const posts = await getPosts();
	console.log(posts)

	return (
		<div className='mx-auto pt-32 px-4 lg:px-10 min-h-dvh'>
			<h1 className='mb-8'>Blog</h1>
			<div className='grid gap-8'>
				{posts.map((post) => (
					<article key={post._id} className='border-b pb-8'>
						<Link href={`/blog/${post?.slug?.current}`}>
							<h2 className='text-2xl font-semibold hover:text-blue-600'>
								{post.title}
							</h2>
							<time className='text-gray-500 text-sm'>
								{new Date(post.publishedAt ?? '').toLocaleDateString()}
							</time>
						</Link>
					</article>
				))}
			</div>
		</div>
	);
}

export const revalidate = 60; // Revalidate every minute
