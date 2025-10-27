/**
 * delete-sample.commandコマンド
 * データ変更処理を定義
 */
export class DeleteSampleCommand {
  constructor(public readonly sampleId: string) {}
}
