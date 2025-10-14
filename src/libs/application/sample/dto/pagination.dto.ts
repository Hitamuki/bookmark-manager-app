export class PaginationDto<T> {
  // 総件数
  total: number;
  // 取得開始位置
  offset: number;
  // 取得上限
  limit: number;
  // 取得件数
  count: number;
  // データ
  data: T[];
}
