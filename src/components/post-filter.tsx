"use client"

import { useState } from "react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import type { Post } from "~/app/blog/types"

interface PostFilterProps {
	posts: Post[]
	selectedCategories: string[]
	onCategorySelect: (categories: string[]) => void
}

export function PostFilter({ posts, selectedCategories, onCategorySelect }: PostFilterProps) {
	// Extract all unique tags from posts
	const allCategories = posts
		.flatMap((post) => post.categories || [])
		.filter(Boolean)
		.filter((tag, index, self) =>
			index === self.findIndex((t) => t === tag)
		)
		.sort((a, b) => a.localeCompare(b))

	const toggleTag = (tag: string) => {
		if (selectedCategories.includes(tag)) {
			onCategorySelect(selectedCategories.filter((t) => t !== tag))
		} else {
			onCategorySelect([...selectedCategories, tag])
		}
	}

	const clearFilters = () => {
		onCategorySelect([])
	}

	if (allCategories.length < 1) return null;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				{/* <h2 className="text-xl font-semibold">Filter by Tags</h2> */}
				{selectedCategories.length > 0 && (
					<Button variant="ghost" size="sm" onClick={clearFilters}>
						Clear filters
					</Button>
				)}
			</div>
			<div className="flex flex-wrap gap-2">
				{allCategories.map((category) => (
					<Badge
						key={category}
						variant={selectedCategories.includes(category) ? "default" : "outline"}
						className="cursor-pointer"
						onClick={() => toggleTag(category)}
					>
						{category}
					</Badge>
				))}
			</div>
		</div>
	)
}
