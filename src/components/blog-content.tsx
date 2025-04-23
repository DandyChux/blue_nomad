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

	return (
		<div className="py-16 sm:py-24">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				{posts.length === 0 ? (
					<div className="text-center py-12">
						<h3 className="text-xl lg:text-2xl font-semibold mb-2">No posts available yet</h3>
						<p className='text-lg lg:text-xl'>Please check back later for new content!</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{posts.map((post) => (
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
					<h3 className="mb-2 font-david text-lg leading-6 group-hover:text-gray-600">
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
				<h1 className='mb-8 uppercase'>Nomad's Land</h1>

				<SearchBar onSearch={setSearchQuery} />

				<PostFilter
					posts={posts}
					onCategorySelect={setSelectedCategories}
					selectedCategories={selectedCategories}
				/>
			</div>
			<div className='grid gap-8'>
				<Posts posts={filteredPosts} />
			</div>
		</>
	)
}
