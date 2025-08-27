import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '~/components/theme-provider'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
		},
	},
})

const router = createRouter({
	routeTree,
	context: {
		queryClient,
	},
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider defaultTheme="light" storageKey="blue-nomad-theme">
				<RouterProvider router={router} />
			</ThemeProvider>
		</QueryClientProvider>
	</React.StrictMode>,
)
