import { SAMPLE_REPOSITORY, type SampleRepository } from '@libs/domain/sample/repositories/sample.repository';
import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginationDto } from '../../dto/pagination.dto';
import { SampleDto } from '../../dto/sample.dto';
import { GetSamplesQuery } from '../get-samples.query';

@QueryHandler(GetSamplesQuery)
export class GetSamplesHandler implements IQueryHandler<GetSamplesQuery> {
  constructor(
    @Inject(SAMPLE_REPOSITORY)
    private readonly sampleRepository: SampleRepository,
  ) {}

  async execute(query: GetSamplesQuery): Promise<PaginationDto<SampleDto>> {
    const [samples, total] = await Promise.all([
      this.sampleRepository.search(query.limit, query.offset, query.title),
      this.sampleRepository.count(query.title),
    ]);

    const responseDto = new PaginationDto<SampleDto>();
    responseDto.total = total;
    responseDto.offset = query.offset;
    responseDto.limit = query.limit;
    responseDto.count = samples.length;
    responseDto.data = samples.map((sample) => {
      const sampleDto = new SampleDto();
      sampleDto.id = sample.id;
      sampleDto.title = sample.title;
      return sampleDto;
    });

    return responseDto;
  }
}
