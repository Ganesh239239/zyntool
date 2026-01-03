export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  corePlugins: {
    preflight: false, // Prevents Tailwind from overriding your Studio CSS
  }
}
