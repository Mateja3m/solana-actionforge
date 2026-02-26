import { z } from 'zod';

export const actionLinkSchema = z
  .object({
    label: z.string().min(1),
    href: z.string().min(1),
    method: z.enum(['GET', 'POST']).optional(),
    parameters: z.record(z.unknown()).optional(),
  })
  .strict();

export const actionResponseSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    icon: z.string().min(1),
    links: z
      .object({
        actions: z.array(actionLinkSchema).min(1),
      })
      .strict(),
  })
  .strict();

export type ActionResponse = z.infer<typeof actionResponseSchema>;
