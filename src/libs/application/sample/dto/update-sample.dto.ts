/**
 * サンプル更新時のリクエストデータ検証とバリデーションルール定義
 */
import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

/**
 * サンプル更新DTOのスキーマ定義
 */
export const UpdateSampleDtoSchema = z.object({
  title: z.string().min(1).max(50).nullable(),
});

export class UpdateSampleDto extends createZodDto(UpdateSampleDtoSchema) {}
