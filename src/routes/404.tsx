import { createFileRoute } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/404')({
	component: NotFoundComponent,
})

function NotFoundComponent() {
	return (
		<div className="container mx-auto px-4 py-16 text-center">
			<h1 className="text-6xl font-bold mb-4">404</h1>
			<p className="text-xl text-muted-foreground mb-8">
				Page not found
			</p>
			<Button asChild>
				<Link to="/">Go back home</Link>
			</Button>
		</div>
	)
}
