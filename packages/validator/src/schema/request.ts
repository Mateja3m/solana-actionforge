import { z } from 'zod';

export const actionRequestSchema = z
  .object({
    account: z.string().min(1),
    input: z.record(z.unknown()).optional(),
    state: z.string().optional(),
    step: z.number().int().nonnegative().optional(),
    idempotencyKey: z.string().min(1).optional(),
  })
  .strict();

export type ActionRequest = z.infer<typeof actionRequestSchema>;
