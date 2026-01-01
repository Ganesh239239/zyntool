import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // IMPORTANT: Replace with your actual domain if you buy one later
  site: 'https://zyntool.pages.dev',
  integrations: [sitemap()],
  output: 'static',
  build: {
    format: 'directory'
  }
});
