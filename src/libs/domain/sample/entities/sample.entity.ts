import { z } from 'zod';
import { SampleId } from '../value-objects/sample.vo';

const SampleSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(50).nullable(),
  isDeleted: z.boolean().default(false),
  createdBy: z.string().min(1).max(50),
  createdAt: z.date(),
  updatedBy: z.string().min(1).max(50).nullable(),
  updatedAt: z.date(),
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

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
