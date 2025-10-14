import type { SampleEntity, SampleProps } from '../entities/sample.entity';

export const SAMPLE_REPOSITORY = Symbol('SampleRepository');

export interface SampleRepository {
  search(limit: number | null, offset: number | null, title: string | null): Promise<SampleProps[]>;
  count(title: string | null): Promise<number>;
  findById(id: string): Promise<SampleProps | null>;
  exists(id: string): Promise<boolean>;
  create(sampleEntity: SampleEntity): Promise<void>;
  update(id: string, sampleEntity: SampleEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
