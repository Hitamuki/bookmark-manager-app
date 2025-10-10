import { v7 as uuidv7 } from 'uuid';
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
  readonly id: string;
  readonly title: string | null;
  readonly isDeleted: boolean;
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly updatedBy: string | null;
  readonly updatedAt: Date | null;

  constructor(props: SampleProps) {
    // バリデーション
    const validProps = SampleSchema.parse(props);
    this.id = new SampleId(validProps.id).value;
    this.title = validProps.title;
    this.isDeleted = validProps.isDeleted;
    this.createdBy = validProps.createdBy;
    this.createdAt = validProps.createdAt;
    this.updatedBy = validProps.updatedBy;
    this.updatedAt = validProps.updatedAt;
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
