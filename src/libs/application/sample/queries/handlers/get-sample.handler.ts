import type { SampleProps } from '@libs/domain/sample/entities/sample.entity';
import { SAMPLE_REPOSITORY, type SampleRepository } from '@libs/domain/sample/repositories/sample.repository';
import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetSampleQuery } from '../get-sample.query';

@QueryHandler(GetSampleQuery)
export class GetSampleHandler implements IQueryHandler<GetSampleQuery> {
  constructor(
    @Inject(SAMPLE_REPOSITORY)
    private readonly sampleRepository: SampleRepository,
  ) {}

  async execute(query: GetSampleQuery): Promise<SampleProps | null> {
    return await this.sampleRepository.findById(query.id);
  }
}
