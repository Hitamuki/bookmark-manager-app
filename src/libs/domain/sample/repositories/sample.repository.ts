/**
 * サンプルエンティティの永続化操作を抽象化し、データアクセス層を定義
 */
import type { SampleEntity } from '../entities/sample.entity';

export const SAMPLE_REPOSITORY = Symbol('SampleRepository');

export interface SampleRepository {
  /**
   * サンプルを検索
   * @param limit 取得件数制限
   * @param offset オフセット
   * @param title タイトル検索条件
   * @returns サンプルエンティティ配列
   */
  search(limit: number | null, offset: number | null, title: string | null): Promise<SampleEntity[]>;

  /**
   * サンプル件数を取得
   * @param title タイトル検索条件
   * @returns 件数
   */
  count(title: string | null): Promise<number>;

  /**
   * IDでサンプルを取得
   * @param id サンプルID
   * @returns サンプルエンティティまたはnull
   */
  findById(id: string): Promise<SampleEntity | null>;

  /**
   * サンプルの存在確認
   * @param id サンプルID
   * @returns 存在するかどうか
   */
  exists(id: string): Promise<boolean>;

  /**
   * サンプルを作成
   * @param sampleEntity サンプルエンティティ
   */
  create(sampleEntity: SampleEntity): Promise<void>;

  /**
   * サンプルを更新
   * @param id サンプルID
   * @param sampleEntity サンプルエンティティ
   */
  update(id: string, sampleEntity: SampleEntity): Promise<void>;

  /**
   * サンプルを削除
   * @param id サンプルID
   */
  delete(id: string): Promise<void>;
}
