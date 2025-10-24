const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export interface SendMailRequest {
	email: string
	sendTo?: string
	subject: string
	text: string
	html?: string
}

export interface SubscribeRequest {
	email: string;
	properties?: Record<string, any>;
}

class ApiClient {
	async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
		const url = `${API_URL}${endpoint}`

		const config: RequestInit = {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...options?.headers,
			},
		}

		const response = await fetch(url, config)

		if (!response.ok) {
			throw new Error(`API Error: ${response.statusText}`)
		}

		return response.json()
	}

	async health() {
		return this.request<{ status: string }>('/health')
	}

	async subscribe(data: SubscribeRequest) {
		return this.request('/subscribe', {
			method: 'POST',
			body: JSON.stringify(data),
		})
	}

	async sendMail(data: SendMailRequest) {
		return this.request<{ message: string, to: string }>('/send-mail', {
			method: 'POST',
			body: JSON.stringify(data),
		})
	}
}

export const apiClient = new ApiClient()

// Export a function to replace server actions
export async function sendMail(data: SendMailRequest) {
	return apiClient.sendMail(data)
}
