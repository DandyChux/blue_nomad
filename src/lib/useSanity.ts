import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { sanityFetch } from '~/sanity/lib/live'
import * as queries from '~/sanity/lib/queries'
import type { Post, Category } from '~/app/nomadsland/types'

// Fetch all posts
export function usePosts(options?: UseQueryOptions<Post[]>) {
	return useQuery({
		queryKey: ['posts'],
		queryFn: () => sanityFetch<Post[]>(queries.POSTS_QUERY),
		staleTime: 1000 * 60 * 5, // 5 minutes
		...options,
	})
}

// Fetch single post
export function usePost(slug: string, options?: UseQueryOptions<Post>) {
	return useQuery({
		queryKey: ['post', slug],
		queryFn: () => sanityFetch<Post>(queries.POST_QUERY, { slug }),
		enabled: !!slug,
		...options,
	})
}

// Fetch categories
export function useCategories(options?: UseQueryOptions<Category[]>) {
	return useQuery({
		queryKey: ['categories'],
		queryFn: () => sanityFetch<Category[]>(queries.CATEGORIES_QUERY),
		staleTime: 1000 * 60 * 30, // 30 minutes - categories change less often
		...options,
	})
}

// Fetch posts by category
export function usePostsByCategory(categoryId: string, options?: UseQueryOptions<Post[]>) {
	return useQuery({
		queryKey: ['posts', 'category', categoryId],
		queryFn: () => sanityFetch<Post[]>(queries.POSTS_BY_CATEGORY_QUERY, { categoryId }),
		enabled: !!categoryId,
		...options,
	})
}

// Fetch recent posts
export function useRecentPosts(options?: UseQueryOptions<Post[]>) {
	return useQuery({
		queryKey: ['posts', 'recent'],
		queryFn: () => sanityFetch<Post[]>(queries.RECENT_POSTS_QUERY),
		...options,
	})
}
