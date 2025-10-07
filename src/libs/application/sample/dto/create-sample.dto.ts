import { z } from 'zod';

export const CreateSampleDtoSchema = z.object({
  title: z.string().min(1).max(50).nullable(),
});

export type CreateSampleDto = z.infer<typeof CreateSampleDtoSchema>;
