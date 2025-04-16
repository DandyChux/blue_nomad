import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata, Viewport } from 'next';
import { VisualEditing } from 'next-sanity';
import { draftMode } from 'next/headers';
import { PropsWithChildren } from 'react';
import { Toaster } from 'sonner';
import { DisableDraftMode } from '~/components/DisableDraftMode';
import { Footer } from '~/components/footer';
import { Navbar } from '~/components/navbar';
import { Providers } from '~/components/providers';
// import localFont from 'next/font/local'

import './globals.css';

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
		icon: '/icon.ico',
	},
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
	userScalable: false,
};

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<html
			lang='en'
			suppressHydrationWarning
		>
			<body className={`antialiased relative`}>
				<Providers>
					<Navbar />
					<main className='w-full'>
						{children}
						{(await draftMode()).isEnabled && (
							<>
								<VisualEditing />
								<DisableDraftMode />
							</>
						)}
					</main>
					<Footer />
				</Providers>
				<Toaster
					richColors
					expand
					closeButton
					theme='system'
					position='top-center'
				/>
				<GoogleAnalytics gaId={process.env.GOOGLE_MEASUREMENT_ID!} />
			</body>
		</html>
	);
}
