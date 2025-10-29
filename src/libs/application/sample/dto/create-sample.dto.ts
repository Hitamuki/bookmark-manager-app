/**
 * サンプル作成時のリクエストデータ検証とバリデーションルール定義
 */
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * サンプル作成DTOのスキーマ定義
 */
export const CreateSampleDtoSchema = z.object({
  title: z.string().min(1).max(50).nullable(),
});

export class CreateSampleDto extends createZodDto(CreateSampleDtoSchema) {}
