import type { SampleEntity } from '../entities/sample.entity';

export const SAMPLE_REPOSITORY = Symbol('SampleRepository');

export interface SampleRepository {
  search(title: string | null): Promise<SampleEntity[]>;
  findById(id: string): Promise<SampleEntity | null>;
  create(sampleEntity: SampleEntity): Promise<void>;
  update(id: string, sampleEntity: SampleEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
