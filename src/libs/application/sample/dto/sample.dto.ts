/**
 * サンプル情報のレスポンスデータ構造とAPI仕様定義
 */
import { ApiProperty } from '@nestjs/swagger';

export class SampleDto {
  /** サンプルの一意識別子（UUID v7形式） */
  @ApiProperty()
  id: string;

  /** サンプルのタイトル（1-50文字、null許可） */
  @ApiProperty()
  title: string | null;
}
