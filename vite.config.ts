import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-vite-plugin'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		react(),
		tanstackRouter({ autoCodeSplitting: true, target: 'react' }),
		tailwindcss(),
	],
	resolve: {
		alias: {
			'~': path.resolve(__dirname, './src'),
		},
	},
	server: {
		port: 3000,
		proxy: {
			'/api': {
				target: 'http://localhost:8080',
				changeOrigin: true,
			},
		},
	},
})
