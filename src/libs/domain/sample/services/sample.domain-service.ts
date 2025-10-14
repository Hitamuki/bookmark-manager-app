import { SAMPLE_REPOSITORY, type SampleRepository } from '@libs/domain/sample/repositories/sample.repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class SampleDomainService {
  constructor(
    @Inject(SAMPLE_REPOSITORY)
    private readonly sampleRepository: SampleRepository,
  ) {}
  // IDの重複チェック
  async existsSampleId(id: string): Promise<boolean> {
    return await this.sampleRepository.exists(id);
  }
}
