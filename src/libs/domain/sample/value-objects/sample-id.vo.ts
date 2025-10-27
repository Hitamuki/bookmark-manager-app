/**
 * サンプルの一意識別子を型安全に管理し、UUID v7形式で生成
 */
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

/**
 * サンプルIDのスキーマ定義
 */
const SampleIdSchema = z.string().uuid();

export class SampleId {
  private readonly _value: string;

  /**
   * コンストラクタ
   * @param value UUID文字列
   */
  constructor(value: string) {
    this._value = SampleIdSchema.parse(value);
  }

  /** ID値を取得 */
  get value(): string {
    return this._value;
  }

  /**
   * 新しいサンプルIDを生成
   * @returns 新しいサンプルIDインスタンス
   */
  static generate() {
    return new SampleId(uuidv7());
  }
}
