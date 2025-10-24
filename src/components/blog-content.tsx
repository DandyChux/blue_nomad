import { RefObject, useState } from "react"
import { PostFilter } from "./post-filter"
import type { Post } from "~/types"
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Image } from "./ui/image";
import { useIntersectionObserver } from "~/lib/useIntersectionObserver";
import { getRouteApi } from "@tanstack/react-router";

function PostRow({ row, rowIndex }: { row: Post[], rowIndex: number }) {
	const [rowRef, isRowVisible] = useIntersectionObserver();

	return (
		<div
			ref={rowRef as RefObject<HTMLDivElement>}
			className={`
				grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 mb-16
				opacity-0 translate-y-8 transition-all duration-[1500ms] ease-in-out
				${isRowVisible ? 'opacity-100 translate-y-0' : ''}
			`}
			style={{ transitionDelay: `${rowIndex * 200}ms` }}
		>
			{row.map((post, index) => (
				<div
					key={post.title}
					className={`${index % 2 === 1 ? 'md:mt-24' : ''}`}
				>
					<PostCard post={post} showDescription={(rowIndex * 2 + index) % 4 === 0} />
				</div>
			))}
		</div>
	);
}

function Posts({ posts }: { posts: Post[] }) {
	if (posts.length === 0) {
		return (
			<div className="py-16 sm:py-24">
				<div className="mx-auto px-6 lg:px-8">
					<div className="text-center py-12">
						<h3 className="text-xl lg:text-2xl font-semibold mb-2">No posts available yet</h3>
						<p className='text-lg lg:text-xl'>Please check back later for new content!</p>
					</div>
				</div>
			</div>
		);
	}

	// Group posts into rows of 2 for desktop view
	const rows = [];
	for (let i = 0; i < posts.length; i += 2) {
		rows.push(posts.slice(i, i + 2));
	}

	return (
		<div className="py-16 sm:py-24">
			<div className="mx-auto px-6 lg:px-8">
				{rows.map((row, rowIndex) => (
					<PostRow key={`row-${rowIndex}`} row={row} rowIndex={rowIndex} />
				))}
			</div>
		</div>
	);
}

function PostCard({ post, showDescription = false }: { post: Post, showDescription?: boolean }) {
	return (
		<Card className="overflow-hidden transition-transform duration-300 bg-transparent border-none shadow-none rounded-none">
			<a href={`/nomadsland/${post.slug}`}>
				<div className="relative aspect-video w-full">
					<Image
						src={post.imageUrl}
						alt={post.title}
						className="object-contain"
					/>
				</div>
				<CardContent className="pt-4">
					<div className='inline-flex items-center gap-x-4'>
						{post.categories?.map((category, index) => (
							<Badge key={index} variant={'ghost'} className='lowercase text-sm text-brand-white hover:text-white'>
								{category}
							</Badge>
						))}
					</div>
					<h3 className="mb-2 text-xl leading-6 text-brand-white group-hover:text-cold-ivory">
						{post.title}
					</h3>
					{post.author && (
						<p className="text-sm text-brand-white group-hover:text-cold-ivory">
							By {post.author.name}
						</p>
					)}
					{showDescription && (
						<p className="text-base text-brand-white group-hover:text-cold-ivory mt-2 font-spectral font-normal">
							{post.description}
						</p>
					)}
				</CardContent>
			</a>
		</Card>
	);
}

export function FilteredBlogContent({ posts }: { posts: Post[] }) {
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const routeApi = getRouteApi('/nomadsland/')
	// const { searchQuery } = useSearch();
	const { search } = routeApi.useSearch();

	// Filter posts based on both category and search query
	const filteredPosts = posts.filter((post) => {
		// Check if post matches selected categories (if any are selected)
		const matchesCategory = selectedCategories.length === 0 ||
			post.categories?.some(category => selectedCategories.includes(category));

		// Check if post matches search query (if there is one)
		const matchesSearch = !search ||
			post.title?.toLowerCase().includes(search.toLowerCase()) ||
			post.description?.toLowerCase().includes(search.toLowerCase());

		// Post must match both conditions
		return matchesCategory && matchesSearch;
	})
		// Sort posts by date, most recent first
		.sort((a, b) => {
			if (a.date && b.date) {
				return new Date(b.date).getTime() - new Date(a.date).getTime();
			}
			return 0;
		});

	return (
		<>
			<div className='text-center'>
				<h1 className='mb-8 uppercase'>Nomad's <span className="italic">L</span>and</h1>

				<div className="flex flex-col md:flex-row items-center md:justify-center my-6 mx-auto space-x-6">
					<PostFilter
						posts={posts}
						onCategorySelect={setSelectedCategories}
						selectedCategories={selectedCategories}
					/>
				</div>
			</div>
			<div className='grid gap-8'>
				<Posts posts={filteredPosts} />
			</div>
		</>
	);
}
