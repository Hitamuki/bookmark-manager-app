/**
 * pagination.dto
 * モジュール定義
 */
import { applyDecorators, type Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class PaginationDto<T> {
  // 総件数
  @ApiProperty()
  total: number;
  // 取得件数
  @ApiProperty()
  count: number;
  @ApiProperty({ required: false })
  // 取得開始位置
  offset: number | null;
  // 取得上限
  @ApiProperty({ required: false })
  limit: number | null;
  // データ
  data: T[];
}

// カスタムデコレーター
export const ApiOkResponsePagination = <DataDto extends Type<unknown>>(dataDto: DataDto) =>
  applyDecorators(
    ApiExtraModels(PaginationDto, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginationDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(dataDto) },
              },
            },
          },
        ],
      },
    }),
  );
