"use client"

import { useState } from "react"
import { PostFilter } from "./post-filter"
import type { Post } from "~/app/blog/types"
import { Badge } from "./ui/badge";
import Link from 'next/link';
import { Card, CardContent } from "./ui/card";
import Image from "next/image";
import { SearchBar } from "./search-bar";

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

	// Check if we have enough posts for the featured section
	const hasFeaturedSection = posts.length >= 5;

	// Split posts into featured and remaining
	const featuredPosts = hasFeaturedSection ? posts.slice(0, 5) : [];
	const remainingPosts = hasFeaturedSection ? posts.slice(5) : posts;

	return (
		<div className="py-16 sm:py-24">
			<div className="mx-auto px-6 lg:px-8">
				{hasFeaturedSection && (
					<div className="mb-16">
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
							{/* Left column - two stacked posts */}
							<div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
								<PostCard post={featuredPosts[1]} />
								<PostCard post={featuredPosts[2]} />
							</div>

							{/* Middle column - featured post (50% width) */}
							<div className="lg:col-span-6 flex items-center justify-center order-1 lg:order-2">
								<div className="w-full max-w-xl transform scale-105">
									<PostCard post={featuredPosts[0]} isMainPost={true} />
								</div>
							</div>

							{/* Right column - two stacked posts */}
							<div className="lg:col-span-3 space-y-6 order-3">
								<PostCard post={featuredPosts[3]} />
								<PostCard post={featuredPosts[4]} />
							</div>
						</div>
					</div>
				)}

				{/* Regular grid for remaining posts */}
				{remainingPosts.length > 0 && (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{remainingPosts.map((post) => (
							<PostCard key={post.title} post={post} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}

function PostCard({ post, isMainPost = false }: { post: Post, isMainPost?: boolean }) {
	return (
		<Card className="overflow-hidden transition-transform duration-300 bg-transparent border-none shadow-none rounded-none">
			<Link href={`/blog/${post.file}`}>
				<div className="relative aspect-video w-full">
					<Image
						src={post.imageUrl}
						alt={post.title}
						fill
						className="object-cover"
					/>
				</div>
				<CardContent className="pt-4">
					<div className='inline-flex items-center gap-x-4'>
						{post.categories.map((category, index) => (
							<Badge key={index} variant={'ghost'} className='text-sm text-cold-ivory hover:text-white'>
								{category}
							</Badge>
						))}
					</div>
					<h3 className="mb-2 text-xl leading-6 text-cold-ivory group-hover:text-gray-600">
						{post.title}
					</h3>
					{post.author && (
						<p className="text-sm text-cold-ivory group-hover:text-gray-600">
							By {post.author.name}
						</p>
					)}
					{isMainPost && (
						<p className="text-base text-cold-ivory group-hover:text-gray-600 mt-2 font-spectral font-normal">
							{post.description}
						</p>
					)}
				</CardContent>
			</Link>
		</Card>
	);
}

export function FilteredBlogContent({ posts }: { posts: Post[] }) {
	const [selectedCategories, setSelectedCategories] = useState<string[]>([])
	const [searchQuery, setSearchQuery] = useState<string>('')

	// Filter posts based on both category and search query
	const filteredPosts = posts.filter((post) => {
		// Check if post matches selected categories (if any are selected)
		const matchesCategory = selectedCategories.length === 0 ||
			post.categories.some(category => selectedCategories.includes(category))

		// Check if post matches search query (if there is one)
		const matchesSearch = !searchQuery ||
			post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			post.description.toLowerCase().includes(searchQuery.toLowerCase())

		// Post must match both conditions
		return matchesCategory && matchesSearch
	})

	return (
		<>
			<div className='text-center'>
				<h1 className='mb-8 uppercase'>Nomad's <span className="italic">L</span>and</h1>

				<div className="flex items-center justify-center my-6 mx-auto space-x-6">
					<PostFilter
						posts={posts}
						onCategorySelect={setSelectedCategories}
						selectedCategories={selectedCategories}
					/>

					<SearchBar onSearch={setSearchQuery} />
				</div>
			</div>
			<div className='grid gap-8'>
				<Posts posts={filteredPosts} />
			</div>
		</>
	)
}
