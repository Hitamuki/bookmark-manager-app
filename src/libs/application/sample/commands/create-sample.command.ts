/**
 * create-sample.commandコマンド
 * データ変更処理を定義
 */
import type { CreateSampleDto } from '../dto/create-sample.dto';

export class CreateSampleCommand {
  constructor(public readonly reqBody: CreateSampleDto) {}
}
