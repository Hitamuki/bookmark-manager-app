import type { SampleEntity } from '../entities/sample.entity';

export const SAMPLE_REPOSITORY = Symbol('SampleRepository');

export interface SampleRepository {
  search(title: string | null): Promise<SampleEntity[]>;
  findById(id: string): Promise<SampleEntity | null>;
  create(sample: SampleEntity): Promise<void>;
  update(sample: SampleEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
