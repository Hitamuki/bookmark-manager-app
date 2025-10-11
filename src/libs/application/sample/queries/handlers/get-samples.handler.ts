import type { SampleEntity, SampleProps } from '@libs/domain/sample/entities/sample.entity';
import { SAMPLE_REPOSITORY, type SampleRepository } from '@libs/domain/sample/repositories/sample.repository';
import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetSamplesQuery } from '../get-samples.query';

@QueryHandler(GetSamplesQuery)
export class GetSamplesHandler implements IQueryHandler<GetSamplesQuery> {
  constructor(
    @Inject(SAMPLE_REPOSITORY)
    private readonly sampleRepository: SampleRepository,
  ) {}

  async execute(query: GetSamplesQuery): Promise<SampleProps[]> {
    return await this.sampleRepository.search(query.title);
  }
}
