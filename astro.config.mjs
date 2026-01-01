import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // 1. MUST be your exact URL (No trailing slash)
  site: 'https://zyntool.pages.dev',
  
  // 2. The official integration
  integrations: [sitemap()],
  
  // 3. Ensure static output
  output: 'static',
  
  build: {
    // This creates clean URLs like /compress-image/
    format: 'directory'
  }
});
