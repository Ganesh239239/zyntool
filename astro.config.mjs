import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://zyntool.pages.dev',
  integrations: [
    react(), 
    tailwind({ applyBaseStyles: false }), // applyBaseStyles: false prevents Tailwind from breaking your Native CSS
    sitemap()
  ],
  output: 'static'
});
