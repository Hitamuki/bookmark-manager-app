import type { SampleProps } from '@libs/domain/sample/entities/sample.entity';
import { SAMPLE_REPOSITORY, type SampleRepository } from '@libs/domain/sample/repositories/sample.repository';
import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginationDto } from '../../dto/pagination.dto';
import { GetSamplesQuery } from '../get-samples.query';

@QueryHandler(GetSamplesQuery)
export class GetSamplesHandler implements IQueryHandler<GetSamplesQuery> {
  constructor(
    @Inject(SAMPLE_REPOSITORY)
    private readonly sampleRepository: SampleRepository,
  ) {}

  async execute(query: GetSamplesQuery): Promise<PaginationDto<SampleProps>> {
    const [samples, total] = await Promise.all([
      this.sampleRepository.search(query.limit, query.offset, query.title),
      this.sampleRepository.count(query.title),
    ]);

    const samplesDto = new PaginationDto<SampleProps>();
    samplesDto.total = total;
    samplesDto.offset = query.offset;
    samplesDto.limit = query.limit;
    samplesDto.count = samples.length;
    samplesDto.data = samples;

    return samplesDto;
  }
}
