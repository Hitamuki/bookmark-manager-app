/**
 * サンプルのビジネスロジックとデータ整合性を管理するドメインエンティティ
 */
import { z } from 'zod';
import type { CreateSampleDto } from '@/libs/application/sample/dto/create-sample.dto';
import type { UpdateSampleDto } from '@/libs/application/sample/dto/update-sample.dto';
import { SampleId } from '../value-objects/sample-id.vo';

/**
 * サンプルエンティティのスキーマ定義
 */
const SampleSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(50).nullable(),
  isDeleted: z.boolean().default(false),
  createdBy: z.string().min(1).max(50),
  createdAt: z.date(),
  updatedBy: z.string().min(1).max(50).nullable(),
  updatedAt: z.date().nullable(),
});

export type SampleProps = z.infer<typeof SampleSchema>;

export class SampleEntity {
  /** サンプルの一意識別子（UUID v7形式） */
  get id(): string {
    return new SampleId(this.props.id).value;
  }

  /** サンプルのタイトル（1-50文字、null許可） */
  get title(): string | null {
    return this.props.title;
  }

  /** 論理削除フラグ（true: 削除済み） */
  get isDeleted(): boolean {
    return this.props.isDeleted;
  }

  /** サンプル作成者のユーザーID */
  get createdBy(): string {
    return this.props.createdBy;
  }

  /** サンプル作成日時（UTC） */
  get createdAt(): Date {
    return this.props.createdAt;
  }

  /** サンプル最終更新者のユーザーID */
  get updatedBy(): string | null {
    return this.props.updatedBy;
  }

  /** サンプル最終更新日時（UTC） */
  get updatedAt(): Date | null {
    return this.props.updatedAt;
  }

  constructor(private readonly props: SampleProps) {}

  /**
   * 新規作成用ファクトリメソッド
   * @param createSampleDto 作成用DTO
   * @param userId ユーザーID
   * @returns サンプルエンティティ
   */
  static createFromCreateSampleDto(createSampleDto: CreateSampleDto, userId: string): SampleEntity {
    const props: SampleProps = {
      id: SampleId.generate().value,
      title: createSampleDto.title,
      isDeleted: false,
      createdBy: userId,
      createdAt: new Date(),
      updatedBy: null,
      updatedAt: null,
    };
    SampleSchema.parse(props);
    return new SampleEntity(props);
  }

  /**
   * 更新処理
   * @param updateSampleDto 更新用DTO
   * @param userId ユーザーID
   */
  fromUpdateDto(updateSampleDto: UpdateSampleDto, userId: string) {
    this.props.updatedAt = new Date();
    this.props.updatedBy = userId;
    this.props.title = updateSampleDto.title;
    SampleSchema.parse(this.props);
  }
}
