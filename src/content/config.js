import { defineCollection, z } from 'astro:content';

const toolsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    color: z.string(),
    icon: z.string(),
    category: z.string().optional(), // Adding optional so it doesn't crash if missing
  }),
});

export const collections = {
  'tools': toolsCollection,
};
