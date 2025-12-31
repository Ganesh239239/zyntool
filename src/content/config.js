import { defineCollection, z } from 'astro:content';

const toolsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    color: z.string(),
    icon: z.string(),
  }),
});

export const collections = {
  'tools': toolsCollection,
};
