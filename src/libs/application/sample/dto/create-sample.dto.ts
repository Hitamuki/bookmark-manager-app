import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const CreateSampleDtoSchema = z.object({
  title: z.string().min(1).max(50).nullable(),
});

export class CreateSampleDto extends createZodDto(CreateSampleDtoSchema) {}
