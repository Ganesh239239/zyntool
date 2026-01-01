import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://zyntool.pages.dev',
  integrations: [
    sitemap({
      // FORCE these pages to be in the sitemap even if Astro misses them
      customPages: [
        'https://zyntool.pages.dev/compress-image/',
        'https://zyntool.pages.dev/resize-image/',
        'https://zyntool.pages.dev/crop-image/',
        'https://zyntool.pages.dev/watermark-image/',
        'https://zyntool.pages.dev/blur-image/',
        'https://zyntool.pages.dev/convert-from-jpg/',
        'https://zyntool.pages.dev/convert-to-jpg/',
        'https://zyntool.pages.dev/meme-generator/',
        'https://zyntool.pages.dev/html-to-image/',
        'https://zyntool.pages.dev/upscale-image/',
        'https://zyntool.pages.dev/remove-background/',
        'https://zyntool.pages.dev/photo-editor/',
      ]
    })
  ],
  output: 'static',
  build: {
    format: 'directory'
  }
});
