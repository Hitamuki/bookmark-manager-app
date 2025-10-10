import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const UpdateSampleDtoSchema = z.object({
  title: z.string().min(1).max(50).nullable(),
});

export class UpdateSampleDto extends createZodDto(UpdateSampleDtoSchema) {}
