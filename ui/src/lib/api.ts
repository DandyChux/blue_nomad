import { goto } from "$app/navigation";

export const BASE_URL = "/api";

/**
 * The shape the backend uses for JSON error bodies. Any subset of fields is OK.
 */
export interface ApiErrorBody {
	error?: string;
	message?: string;
	details?: unknown;
	[key: string]: unknown;
}

/**
 * Custom API error class that preserves the server response so callers can
 * render richer messages (e.g. insufficient-stock details on 409).
 */
export class ApiError extends Error {
	public readonly status: number;
	public readonly statusText: string;
	/** Parsed JSON body if the server returned JSON, otherwise the raw text. */
	public readonly data: ApiErrorBody | string | null;
	/** Short machine code. Prefers `error` field from JSON body. */
	public readonly code: string | null;
	/** Request URL for debugging. */
	public readonly url: string;

	constructor(opts: {
		message: string;
		status: number;
		statusText: string;
		data: ApiErrorBody | string | null;
		url: string;
	}) {
		super(opts.message);
		this.name = "ApiError";
		this.status = opts.status;
		this.statusText = opts.statusText;
		this.data = opts.data;
		this.url = opts.url;
		this.code =
			(isJsonBody(opts.data) && typeof opts.data.error === "string"
				? opts.data.error
				: null) ?? null;
	}

	/** Human-readable message for toasts / alerts. */
	get userMessage(): string {
		if (isJsonBody(this.data)) {
			if (typeof this.data.message === "string" && this.data.message) {
				return this.data.message;
			}
			if (typeof this.data.error === "string" && this.data.error) {
				return this.data.error;
			}
		} else if (typeof this.data === "string" && this.data.trim()) {
			return this.data;
		}
		return this.message || this.statusText || "Request failed";
	}

	/** Typed accessor for callers that know the expected JSON shape. */
	body<T extends ApiErrorBody = ApiErrorBody>(): T | null {
		return isJsonBody(this.data) ? (this.data as T) : null;
	}

	get isBadRequest(): boolean {
		return this.status === 400;
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
	get isConflict(): boolean {
		return this.status === 409;
	}
	get isRateLimited(): boolean {
		return this.status === 429;
	}
	get isServerError(): boolean {
		return this.status >= 500;
	}
}

function isJsonBody(v: unknown): v is ApiErrorBody {
	return !!v && typeof v === "object" && !Array.isArray(v);
}

/**
 * Request configuration options
 */
export interface RequestConfig extends Omit<RequestInit, "body"> {
	body?: unknown;
	params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Build URL with query parameters
 */
function buildUrl(
	endpoint: string,
	params?: Record<string, string | number | boolean | undefined>,
): string {
	// Ensure the endpoint starts with a forward slash
	const normalizedEndpoint = endpoint.startsWith("/")
		? endpoint
		: `/${endpoint}`;

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
 * Parse an error response preserving JSON when possible, falling back to text.
 * Uses the raw text buffer so we never throw while building the error.
 */
async function parseErrorBody(
	response: Response,
): Promise<ApiErrorBody | string | null> {
	let raw = "";
	try {
		raw = await response.text();
	} catch {
		return null;
	}
	if (!raw) return null;

	const contentType = response.headers.get("content-type") || "";
	if (contentType.includes("application/json")) {
		try {
			return JSON.parse(raw) as ApiErrorBody;
		} catch {
			return raw;
		}
	}

	// Some backends return JSON without the header — give it one best-effort try
	try {
		return JSON.parse(raw) as ApiErrorBody;
	} catch {
		return raw;
	}
}

async function request<T>(
	endpoint: string,
	config: RequestConfig = {},
): Promise<T> {
	const { body, params, headers: customHeaders, ...fetchConfig } = config;
	const url = buildUrl(endpoint, params);

	const headers: HeadersInit = {
		"Content-Type": "application/json",
		Accept: "application/json",
		...customHeaders,
	};

	const response = await fetch(url, {
		...fetchConfig,
		headers,
		credentials: "include",
		body: body !== undefined ? JSON.stringify(body) : undefined,
	});

	if (!response.ok) {
		const data = await parseErrorBody(response);

		let message = response.statusText || `HTTP ${response.status}`;
		if (isJsonBody(data)) {
			if (typeof data.message === "string" && data.message) {
				message = data.message;
			} else if (typeof data.error === "string" && data.error) {
				message = data.error;
			}
		} else if (typeof data === "string" && data.trim()) {
			message = data.trim();
		}

		throw new ApiError({
			message,
			status: response.status,
			statusText: response.statusText,
			data,
			url,
		});
	}

	if (response.status === 204) {
		return undefined as T;
	}

	// Empty body success path (e.g. 200 with no content)
	const contentType = response.headers.get("content-type") || "";
	if (!contentType.includes("application/json")) {
		const text = await response.text();
		if (!text) return undefined as T;
		try {
			return JSON.parse(text) as T;
		} catch {
			return text as unknown as T;
		}
	}

	try {
		return (await response.json()) as T;
	} catch {
		return undefined as T;
	}
}

/**
 * API client with typed HTTP methods
 */
export const apiClient = {
	get<T>(endpoint: string, config?: Omit<RequestConfig, "body">): Promise<T> {
		return request<T>(endpoint, { ...config, method: "GET" });
	},

	post<T, B = unknown>(
		endpoint: string,
		body?: B,
		config?: RequestConfig,
	): Promise<T> {
		return request<T>(endpoint, { ...config, method: "POST", body });
	},

	put<T, B = unknown>(
		endpoint: string,
		body?: B,
		config?: RequestConfig,
	): Promise<T> {
		return request<T>(endpoint, { ...config, method: "PUT", body });
	},

	patch<T, B = unknown>(
		endpoint: string,
		body?: B,
		config?: RequestConfig,
	): Promise<T> {
		return request<T>(endpoint, { ...config, method: "PATCH", body });
	},

	delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
		return request<T>(endpoint, { ...config, method: "DELETE" });
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
	const { endpoint, method = "GET", body, params } = config;
	return request<T>(endpoint, { method, body, params });
}

export default apiClient;
