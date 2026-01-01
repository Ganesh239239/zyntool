import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // 1. Ensure this is your EXACT URL (No trailing slash)
  site: 'https://zyntool.pages.dev',
  
  integrations: [
    sitemap({
      // 2. This forces Astro to include all dynamically generated pages
      serialize(item) {
        // You can customize priority here if you want
        if (/image-to-pdf|compress-image/.test(item.url)) {
          item.priority = 0.9;
        }
        return item;
      },
    })
  ],
  
  output: 'static',
  build: {
    format: 'directory'
  }
});
