import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';
import { SampleId } from '../value-objects/sample.vo';

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
  private readonly props: SampleProps;

  constructor(props: SampleProps) {
    // バリデーション
    this.props = SampleSchema.parse(props);
  }

  get id(): SampleId {
    return new SampleId(this.props.id);
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

  static create(inputTitle: string | null, createdBy: string): SampleEntity {
    const props: SampleProps = {
      id: uuidv7(),
      title: inputTitle,
      isDeleted: false,
      createdBy: createdBy,
      createdAt: new Date(),
      updatedBy: null,
      updatedAt: null,
    };
    return new SampleEntity(props);
  }
}
