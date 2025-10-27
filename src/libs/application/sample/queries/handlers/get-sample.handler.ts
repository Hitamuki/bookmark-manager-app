import { Inject, NotFoundException } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SAMPLE_REPOSITORY, type SampleRepository } from '@/libs/domain/sample/repositories/sample.repository';
import { SampleDto } from '../../dto/sample.dto';
import { GetSampleQuery } from '../get-sample.query';

@QueryHandler(GetSampleQuery)
export class GetSampleHandler implements IQueryHandler<GetSampleQuery> {
  constructor(
    @Inject(SAMPLE_REPOSITORY)
    private readonly sampleRepository: SampleRepository,
  ) {}

  async execute(query: GetSampleQuery): Promise<SampleDto> {
    const sampleEntity = await this.sampleRepository.findById(query.id);

    if (sampleEntity === null) {
      throw new NotFoundException();
    }

    const sampleDto = new SampleDto();
    sampleDto.id = sampleEntity.id;
    sampleDto.title = sampleEntity.title;

    return sampleDto;
  }
}
