import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata, Viewport } from 'next';
import { David_Libre, Source_Code_Pro } from 'next/font/google';
import localFont from 'next/font/local';
import { PropsWithChildren } from 'react';
import { Toaster } from 'sonner';
import { Footer } from '~/components/footer';
import { Navbar } from '~/components/navbar';
import { Providers } from '~/components/providers';
import './globals.css';

export const david_libre = David_Libre({
	subsets: ['latin'],
	display: 'swap',
	weight: ['400', '500', '700'],
	variable: '--font-david-libre',
});

export const source_code_pro = Source_Code_Pro({
	subsets: ['latin'],
	display: 'swap',
	weight: ['400', '500', '700'],
	variable: '--font-source-code-pro',
});

export const harmony = localFont({
	src: [
		{
			path: './fonts/Harmony.woff',
			weight: '400',
			style: 'normal',
		},
	],
	variable: '--font-harmony',
	weight: '400 700',
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

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<html
			lang='en'
			suppressHydrationWarning
			className={`${david_libre.variable} ${source_code_pro.variable} ${harmony.variable}`}
		>
			<body className={`antialiased relative`}>
				<Providers>
					<Navbar />
					<main className='w-full'>
						{children}
						<Footer />
					</main>
				</Providers>
				<Toaster
					richColors
					expand
					closeButton
					theme='system'
					position='top-center'
				/>
			</body>
			<GoogleAnalytics gaId={process.env.GOOGLE_MEASUREMENT_ID!} />
		</html>
	);
}
