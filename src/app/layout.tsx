import type { Metadata, Viewport } from 'next';
import { David_Libre, Source_Code_Pro } from 'next/font/google';
import localFont from 'next/font/local';
import { PropsWithChildren } from 'react';
// import { Toaster } from 'sonner';
import { Footer } from '~/components/footer';
import { Navbar } from '~/components/navbar';
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
    default: 'Blue Nomad',
    template: '%s | Blue Nomad',
  },
  description:
    'Blue Nomad is a private skin health studio in the heart of New York City.',
  keywords: ['skin', 'health', 'studio', 'new york city'],
  icons: {
    icon: '/logo.svg',
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
        url: 'https://bluenomad.com/logo.svg',
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
        <Navbar />
        <main className='w-full'>
          {children}
          <Footer />
        </main>
        {/* <Toaster
          richColors
          expand
          closeButton
          theme='system'
          position='bottom-right'
        /> */}
      </body>
    </html>
  );
}
