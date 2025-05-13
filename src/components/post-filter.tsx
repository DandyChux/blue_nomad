"use client"

import { useState } from "react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import type { Post } from "~/app/nomadsland/types"
import { cn } from "~/lib/utils"

interface PostFilterProps {
	posts: Post[]
	selectedCategories: string[]
	onCategorySelect: (categories: string[]) => void
}

export function PostFilter({ posts, selectedCategories, onCategorySelect }: PostFilterProps) {
	// Define exact category order
	const categoryOrder = [
		'Skin',
		'Scent & Body',
		'Self',
		'Culture',
		'People & Community',
		'Place'
	];

	// Extract all unique categories from posts
	let uniqueCategories = posts
		.flatMap((post) => post.categories || [])
		.filter(Boolean)
		.filter((tag, index, self) => index === self.findIndex((t) => t === tag));

	// Manual sorting based on the categoryOrder array
	const allCategories = [...uniqueCategories].sort((a, b) => {
		const indexA = categoryOrder.findIndex(
			cat => cat.toLowerCase() === a.toLowerCase()
		);
		const indexB = categoryOrder.findIndex(
			cat => cat.toLowerCase() === b.toLowerCase()
		);

		// If both categories are in our defined order list
		if (indexA !== -1 && indexB !== -1) {
			return indexA - indexB;
		}

		// If only a is in the predefined list, it comes first
		if (indexA !== -1) return -1;

		// If only b is in the predefined list, it comes first
		if (indexB !== -1) return 1;

		// Alphabetical sorting for any other categories
		return a.localeCompare(b);
	});

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
			<div className={cn("flex flex-wrap items-center justify-center gap-2", {
				"hidden": allCategories.length === 0
			})}>
				{allCategories.map((category) => (
					<Badge
						key={category}
						variant={selectedCategories.includes(category) ? "default" : "ghost"}
						className="cursor-pointer uppercase hover:underline text-sm hover:text-cold-ivory"
						onClick={() => toggleTag(category)}
					>
						{category}
					</Badge>
				))}
			</div>
			{/* <div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Filter by Tags</h2>
				{selectedCategories.length > 0 && (
					<Button variant="ghost" size="sm" onClick={clearFilters}>
						Clear filters
					</Button>
				)}
			</div> */}
		</div>
	)
}
