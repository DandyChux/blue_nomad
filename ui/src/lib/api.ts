import { goto } from '$app/navigation';

// export const BASE_URL = import.meta.env.VITE_API_URL;
export const BASE_URL = "/api"

/**
 * Custom API error class with additional context
 */
export class ApiError extends Error {
	public readonly status: number;
	public readonly statusText: string;
	public readonly data: unknown;

	constructor(message: string, status: number, statusText: string, data?: unknown) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.statusText = statusText;
		this.data = data;
	}

	get isUnauthorized(): boolean {
		return this.status === 401;
	}

	get isForbidden(): boolean {
		return this.status === 403;
	}

	get isNotFound(): boolean {
		return this.status === 404;
	}

	get isServerError(): boolean {
		return this.status >= 500;
	}
}

/**
 * Request configuration options
 */
export interface RequestConfig extends Omit<RequestInit, 'body'> {
	body?: unknown;
	params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Build URL with query parameters
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
	// Ensure the endpoint starts with a forward slash
	const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

	// Combine base URL and endpoint directly to preserve path components like /v1.0
	const fullUrl = `${BASE_URL}${normalizedEndpoint}`;
	const url = new URL(fullUrl, window.location.origin);

	if (params) {
		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined) {
				url.searchParams.append(key, String(value));
			}
		});
	}

	return url.toString();
}

/**
 * Core request function
 */
async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
	const { body, params, headers: customHeaders, ...fetchConfig } = config;

	const url = buildUrl(endpoint, params);

	const headers: HeadersInit = {
		'Content-Type': 'application/json',
		...customHeaders,
	};

	const response = await fetch(url, {
		...fetchConfig,
		headers,
		credentials: 'include', // Always include cookies for auth
		body: body ? JSON.stringify(body) : undefined,
	});

	// Handle non-OK responses
	if (!response.ok) {
		let errorData: unknown;
		try {
			errorData = await response.json();
		} catch {
			errorData = await response.text();
		}

		const errorMessage =
			(errorData as { message?: string })?.message ||
			(errorData as { error?: string })?.error ||
			response.statusText;

		throw new ApiError(errorMessage, response.status, response.statusText, errorData);
	}

	// Handle empty responses (204 No Content)
	if (response.status === 204) {
		return undefined as T;
	}

	// Parse JSON response
	try {
		return await response.json() as T;
	} catch {
		return undefined as T;
	}
}

/**
 * API client with typed HTTP methods
 */
export const apiClient = {
	get<T>(endpoint: string, config?: Omit<RequestConfig, 'body'>): Promise<T> {
		return request<T>(endpoint, { ...config, method: 'GET' });
	},

	post<T, B = unknown>(endpoint: string, body?: B, config?: RequestConfig): Promise<T> {
		return request<T>(endpoint, { ...config, method: 'POST', body });
	},

	put<T, B = unknown>(endpoint: string, body?: B, config?: RequestConfig): Promise<T> {
		return request<T>(endpoint, { ...config, method: 'PUT', body });
	},

	patch<T, B = unknown>(endpoint: string, body?: B, config?: RequestConfig): Promise<T> {
		return request<T>(endpoint, { ...config, method: 'PATCH', body });
	},

	delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
		return request<T>(endpoint, { ...config, method: 'DELETE' });
	},
};

/**
 * Generic request function for use with TanStack Query
 * @example
 * const { data } = createQuery({
 *   queryKey: ['posts'],
 *   queryFn: () => apiRequest<Post[]>({ endpoint: '/posts' })
 * });
 */
export async function apiRequest<T>(config: {
	endpoint: string;
	method?: string;
	body?: unknown;
	params?: Record<string, string | number | boolean | undefined>;
}): Promise<T> {
	const { endpoint, method = 'GET', body, params } = config;
	return request<T>(endpoint, { method, body, params });
}

export default apiClient;
