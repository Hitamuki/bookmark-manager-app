/**
 * get-samples.queryクエリ
 * データ取得処理を定義
 */
export class GetSamplesQuery {
  constructor(
    public readonly limit: number | null,
    public readonly offset: number | null,
    public readonly title: string | null,
  ) {}
}
