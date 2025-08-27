import { createFileRoute } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'

export const Route = createFileRoute('/error')({
	component: ErrorComponent,
})

function ErrorComponent() {
	const error = Route.useRouteError()
	const router = Route.useRouter()

	return (
		<div className="container mx-auto px-4 py-16 text-center">
			<h1 className="text-4xl font-bold mb-4">Oops! Something went wrong</h1>
			<p className="text-lg text-muted-foreground mb-8">
				{error?.message || 'An unexpected error occurred'}
			</p>
			<Button onClick={() => router.navigate({ to: '/' })}>
				Go back home
			</Button>
		</div>
	)
}
