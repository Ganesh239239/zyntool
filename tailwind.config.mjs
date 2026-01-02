/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
	theme: {
		extend: {
			colors: {
				brand: '#4f46e5',
				fontWeight: {
        black: '900',
				},
			},
		},
	},
	corePlugins: {
		preflight: false, // THIS IS THE KEY: Stops Tailwind from breaking Bootstrap
	}
}
