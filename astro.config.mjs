import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://zyntool.pages.dev', // REPLACE with your real domain later
  integrations: [sitemap()],
  output: 'static'
});
