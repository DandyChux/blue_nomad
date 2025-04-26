"use client"

import { useState } from "react"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { Search } from "lucide-react"
import { cn } from "~/lib/utils"

interface SearchBarProps {
	onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
	const [searchQuery, setSearchQuery] = useState<string>("")
	const [isExpanded, setIsExpanded] = useState<boolean>(false)

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		onSearch(searchQuery)
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newQuery = e.target.value
		setSearchQuery(newQuery)
		onSearch(newQuery) // Real-time filtering as user types
	}

	const toggleSearch = () => {
		setIsExpanded(!isExpanded)
		// Focus the input when expanded
		if (!isExpanded) {
			setTimeout(() => document.getElementById("search-input")?.focus(), 100)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="flex items-center">
			<div className="relative flex items-center">
				<div className={`overflow-hidden transition-all duration-300 ${isExpanded ? "w-64" : "w-0"}`}>
					<Input
						id="search-input"
						type="text"
						placeholder="Search posts..."
						value={searchQuery}
						onChange={handleInputChange}
						className="w-full"
					/>
				</div>
				<Button
					type="button"
					variant="ghost"
					onClick={toggleSearch}
					className={cn("hover:cursor-pointer", {
						'ml-2': isExpanded
					})}
				>
					<Search className="h-4 w-4" />
				</Button>
			</div>
		</form>
	)
}
