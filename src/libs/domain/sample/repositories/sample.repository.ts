import type { SampleEntity } from '../entities/sample.entity';

export const SAMPLE_REPOSITORY = Symbol('SampleRepository');

export interface SampleRepository {
  search(limit: number | null, offset: number | null, title: string | null): Promise<SampleEntity[]>;
  count(title: string | null): Promise<number>;
  findById(id: string): Promise<SampleEntity | null>;
  exists(id: string): Promise<boolean>;
  create(sampleEntity: SampleEntity): Promise<void>;
  update(id: string, sampleEntity: SampleEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
