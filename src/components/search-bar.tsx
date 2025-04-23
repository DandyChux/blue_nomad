"use client"

import { useState } from "react"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { Search } from "lucide-react"

interface SearchBarProps {
	onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
	const [searchQuery, setSearchQuery] = useState<string>("")

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		onSearch(searchQuery)
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newQuery = e.target.value
		setSearchQuery(newQuery)
		onSearch(newQuery) // Real-time filtering as user types
	}

	return (
		<form onSubmit={handleSubmit} className="flex w-full gap-2 mb-6">
			<Input
				type="text"
				placeholder="Search posts..."
				value={searchQuery}
				onChange={handleInputChange}
				className="flex-1"
			/>
			<Button type="submit" variant="outline">
				<Search className="h-4 w-4 mr-2" />
				Search
			</Button>
		</form>
	)
}
