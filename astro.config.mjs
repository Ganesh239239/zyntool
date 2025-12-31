import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://zyntool.pages.dev', // No trailing slash
  integrations: [sitemap()],
  output: 'static'
});
