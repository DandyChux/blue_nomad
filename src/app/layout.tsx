import type { Metadata, Viewport } from 'next';
import { PropsWithChildren } from 'react';
import { Toaster } from 'sonner';
import { Footer } from '~/components/footer';
import { Navbar } from '~/components/navbar';
import { Providers } from '~/components/providers';
import { BookingButton } from '~/components/booking-button';
import localFont from 'next/font/local'
import { Spectral, Source_Code_Pro } from 'next/font/google'
import Image from 'next/image';

import './globals.css';

// Load Google fonts
const spectral = Spectral({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-spectral',
	fallback: ['Arial', 'sans-serif'],
	weight: ['200', '300', '400', '500', '600', '700', '800'],
});

const sourceCodePro = Source_Code_Pro({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-source-code-pro',
	fallback: ['Arial', 'sans-serif'],
	weight: ['200', '300', '400', '500', '600', '700', '800']
});

// Load local font
const harmony = localFont({
	src: [
		{
			path: './fonts/Harmony/Web Fonts/harmony-webfont-webfont.woff2',
			weight: '400',
			style: 'normal'
		},
		{
			path: './fonts/Harmony/Web Fonts/harmony-webfont-webfont.woff',
			weight: '400',
			style: 'normal'
		},
	],
	variable: '--font-harmony',
	display: 'swap',
	weight: '200 900',
	preload: true,
	fallback: ['system-ui', 'sans-serif']
});

export const metadata: Metadata = {
	title: {
		default: 'BLUE NOMAD: A Private Skin Health Studio in NYC',
		template: '%s | BLUE NOMAD: A Private Skin Health Studio in NYC',
	},
	description:
		'Blue Nomad is a private skin health studio in the heart of New York City.',
	keywords: [
		'skin',
		'health',
		'studio',
		'new york city',
		'skincare',
		'beauty',
		'wellness',
		'facials',
	],
	icons: {
		icon: '/favicon.ico',
	},
	manifest: "/manifest.json",
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'https://bluenomad.com',
		siteName: 'Blue Nomad',
		title: 'Blue Nomad',
		description:
			'Blue Nomad is a private skin health studio in the heart of New York City.',
		images: [
			{
				url: 'https://bluenomad.com/icon.ico',
				width: 800,
				height: 600,
				alt: 'Blue Nomad',
			},
		],
	},
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	minimumScale: 1,
	maximumScale: 5,
};

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<html
			lang='en'
			suppressHydrationWarning
			className={`${spectral.variable} ${sourceCodePro.variable} ${harmony.variable}`}
		>
			<body className={`antialiased relative`}>
				<div className="absolute inset-0 -z-10">
					<Image
						src="/background_gradient.png"
						alt="Background"
						fill
						priority
						className="object-cover object-center"
						sizes="100vw"
						quality={75}
					/>
				</div>
				<Providers>
					<Navbar />
					<main className='w-full overflow-hidden'>
						{children}
					</main>
					<BookingButton />
					<Footer />
				</Providers>
				<Toaster
					richColors
					expand
					closeButton
					theme='system'
					position='top-center'
				/>
			</body>
		</html>
	);
}

// Embed code for Square:
// <!-- Start Square Appointments Embed Code --><script src='https://square.site/appointments/buyer/widget/augj56g525h4rw/LSP68REJT9SVH.js'></script><!-- End Square Appointments Embed Code -->
