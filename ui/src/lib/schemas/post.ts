import { z } from 'zod';
// import { PortableTextComponent } from '@portabletext/to-html'

export const authorSchema = z.object({
	name: z.string(),
	bio: z.string().nullable().optional(),
});

export const categorySchema = z.object({
	title: z.string(),
	slug: z.string().optional(),
});

export const postSchema = z.object({
	_id: z.string(),
	_createdAt: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	slug: z.string(),
	imageUrl: z.string().nullable(),
	categories: z.array(categorySchema).nullable(),
	author: authorSchema.nullable(),
});

export const formattedPostSchema = z.object({
	title: z.string(),
	file: z.string(),
	description: z.string(),
	date: z.string(),
	datetime: z.string(),
	author: z.object({
		name: z.string(),
		role: z.string(),
		href: z.string(),
		imageUrl: z.string(),
	}).nullable(),
	imageUrl: z.string(),
	categories: z.array(z.string()),
})

export const postDetailSchema = z.object({
	_id: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	slug: z.string(),
	mainImage: z.any().nullable(),
	body: z.array(z.any()).nullable(), // Portable Text blocks — typed loosely, rendered by @portabletext/svelte
	categories: z.array(categorySchema).nullable(),
	date: z.string(),
	authorName: z.string().nullable(),
	authorImage: z.any().nullable(),
});

export const recentPostSchema = z.object({
	slug: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	date: z.string(),
	image: z.string().nullable(),
});

export type SanityPost = z.infer<typeof postSchema>;
export type SanityPostDetail = z.infer<typeof postDetailSchema>;
export type RecentPost = z.infer<typeof recentPostSchema>;
export type Post = z.infer<typeof formattedPostSchema>;
export type SanityCategory = z.infer<typeof categorySchema>;
// export type Post = {
// 	title: string;
// 	file: string;
// 	description: string;
// 	date: string;
// 	datetime: string;
// 	author: {
// 		name: string;
// 		role: string;
// 		href: string;
// 		imageUrl: string;
// 	} | null;
// 	imageUrl: string;
// 	categories: string[];
// };
