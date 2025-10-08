import { type CreateSampleDto, CreateSampleDtoSchema } from '@libs/application/sample/dto/create-sample.dto';
import { SampleEntity } from '@libs/domain/sample/entities/sample.entity';
import { SAMPLE_REPOSITORY, type SampleRepository } from '@libs/domain/sample/repositories/sample.repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class SampleService {
  constructor(
    @Inject(SAMPLE_REPOSITORY)
    private readonly sampleRepository: SampleRepository,
  ) {}

  async createSample(dto: CreateSampleDto): Promise<void> {
    const valid = CreateSampleDtoSchema.parse(dto);
    const entity = SampleEntity.create(valid.title, '仮ユーザー'); // TODO: Userテーブル対応
    await this.sampleRepository.create(entity);
  }
}
