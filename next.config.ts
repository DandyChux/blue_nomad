import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	// images: {
	// 	localPatterns: [
	// 		{
	// 			pathname: '/public/**/*',
	// 			search: ''
	// 		}
	// 	]
	// }
	headers: async () => {
		return [
			{
				source: '/(.*)', // Match all pages
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable" // Cache assets for 1 year
					}
				]
			}
		]
	}
};

export default nextConfig;
