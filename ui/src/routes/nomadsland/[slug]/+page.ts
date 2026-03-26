import type { PageLoad } from './$types';
import type { SanityPost } from '$lib/schemas/post';
import { apiClient, ApiError } from '$lib/api';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	try {
		const post = await apiClient.get<SanityPost>(`/api/posts/${params.slug}`);

		return {
			post
		};
	} catch (err) {
		if (err instanceof ApiError && err.isNotFound) {
			error(404, { message: 'Post not found' });
		}
		error(500, { message: 'Failed to load post' });
	}
};
