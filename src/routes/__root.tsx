import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import Navbar from '~/components/navbar'
import { Footer } from '~/components/footer'
import { SanityLive } from '~/sanity/lib/live'
import { Toaster } from 'sonner'
import { BookingButton } from '~/components/booking-button'

interface RouterContext {
	queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
})

function RootComponent() {
	return (
		<>
			<Navbar />
			<main className='w-full overflow-hidden'>
				<Outlet />
				<SanityLive />
			</main>
			<BookingButton />
			<Footer />

			<Toaster
				richColors
				expand
				closeButton
				theme='system'
				position='top-center'
			/>
		</>
	)
}
