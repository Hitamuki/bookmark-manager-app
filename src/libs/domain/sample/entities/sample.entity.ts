import type { CreateSampleDto } from '@libs/application/sample/dto/create-sample.dto';
import type { UpdateSampleDto } from '@libs/application/sample/dto/update-sample.dto';
import { z } from 'zod';
import { SampleId } from '../value-objects/sample-id.vo';

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
  get id(): string {
    return new SampleId(this.props.id).value;
  }

  get title(): string | null {
    return this.props.title;
  }

  get isDeleted(): boolean {
    return this.props.isDeleted;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedBy(): string | null {
    return this.props.updatedBy;
  }

  get updatedAt(): Date | null {
    return this.props.updatedAt;
  }

  constructor(private readonly props: SampleProps) {}

  // DB復元用
  restore(): SampleProps {
    const parsed = SampleSchema.parse(this.props);
    return parsed;
  }

  // 新規登録用
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

  // 更新用
  fromUpdateDto(updateSampleDto: UpdateSampleDto, userId: string) {
    this.props.updatedAt = new Date();
    this.props.updatedBy = userId;
    this.props.title = updateSampleDto.title;
    SampleSchema.parse(this.props);
  }
}
