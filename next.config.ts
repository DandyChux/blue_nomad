import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		formats: ['image/webp', 'image/avif'],
		deviceSizes: [320, 480, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		remotePatterns: [
			{
				hostname: 'cdn.sanity.io',
				pathname: '/images/**/*'
			},
			{
				hostname: "blue-nomad.nyc3.cdn.digitaloceanspaces.com",
				// pathname: '/**/*'
			}
		]
	},
	headers: async () => {
		return [
			{
				source: '/((?!blog).*)', // Match all pages EXCEPT '/blog'
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable" // Cache assets for 1 year
					}
				]
			},
			{
				source: '/(.*)', // Match all pages
				headers: [
					{
						key: "Content-Security-Policy",
						// value: "default-src 'self'; img-src 'self' cdn.sanity.io; script-src 'self' cdn.sanity.io; style-src 'self' cdn.sanity.io; font-src 'self' cdn.sanity.io",
						value: `script-src 'self' 'unsafe-eval' https://www.googletagmanager.com https://*.doubleclick.net https://www.googleadservices.com https://www.google.com https://www.gstatic.com https://*.squarecdn.com https://js.squareup.com https://cdn.cookielaw.org https://booking-flow-production-c.squarecdn.com https://square.site https://app.squareup.com https://plausible.blackstacksolutions.com 'unsafe-inline'; script-src-attr 'unsafe-inline';`
					}

				]
			}
		]
	},
	allowedDevOrigins: [
		"192.168.1.197"
	]
};

export default nextConfig;
