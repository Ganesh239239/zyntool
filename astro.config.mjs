import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // 1. Double check: NO trailing slash
  site: 'https://zyntool.pages.dev',
  
  integrations: [
    sitemap({
      // This ensures your dynamic tools from [slug].astro are prioritized
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    })
  ],
  
  output: 'static',
  
  build: {
    format: 'directory'
  }
});
