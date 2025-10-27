/**
 * update-sample.commandコマンド
 * データ変更処理を定義
 */
import type { UpdateSampleDto } from '../dto/update-sample.dto';

export class UpdateSampleCommand {
  constructor(
    public readonly sampleId: string,
    public readonly reqBody: UpdateSampleDto,
  ) {}
}
