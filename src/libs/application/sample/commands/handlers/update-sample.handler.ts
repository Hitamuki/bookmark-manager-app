import { SampleEntity } from '@libs/domain/sample/entities/sample.entity';
import { SAMPLE_REPOSITORY, type SampleRepository } from '@libs/domain/sample/repositories/sample.repository';
import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler, type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CreateSampleDtoSchema } from '../../dto/create-sample.dto';
import { UpdateSampleCommand } from '../update-sample.command';

@CommandHandler(UpdateSampleCommand)
export class UpdateSampleHandler implements ICommandHandler<UpdateSampleCommand> {
  constructor(
    @Inject(SAMPLE_REPOSITORY)
    private readonly sampleRepository: SampleRepository,
  ) {}

  async execute(command: UpdateSampleCommand) {
    const entity = SampleEntity.create(command.reqBody.title, '仮ユーザー'); // TODO: Userテーブル対応
    await this.sampleRepository.update(command.sampleId, entity);
  }
}
