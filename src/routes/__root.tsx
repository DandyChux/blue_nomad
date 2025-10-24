import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { Navbar } from '~/components/navbar'
import { Footer } from '~/components/footer'
import { SanityLive } from '~/components/sanity-live'
import { Toaster } from 'sonner'
import { BookingButton } from '~/components/booking-button'
import { Image } from '~/components/ui/image'
import z from 'zod'

interface RouterContext {
	queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
})

function RootComponent() {
	return (
		<>
			<Image
				src="/background_gradient.jpg"
				alt="Background"
				className="object-cover w-full h-full"
				wrapperClassName='absolute inset-0 -z-10'
				loading='eager'
			/>

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
