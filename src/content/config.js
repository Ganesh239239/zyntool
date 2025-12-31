import { defineCollection, z } from 'astro:content';

const toolsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    color: z.string(),
    icon: z.string(),
    category: z.string(), // ADD THIS LINE
  }),
});

export const collections = {
  'tools': toolsCollection,
};
