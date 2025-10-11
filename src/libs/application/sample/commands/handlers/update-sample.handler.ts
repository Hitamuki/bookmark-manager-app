import { SampleEntity } from '@libs/domain/sample/entities/sample.entity';
import { SAMPLE_REPOSITORY, type SampleRepository } from '@libs/domain/sample/repositories/sample.repository';
import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler, type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UpdateSampleCommand } from '../update-sample.command';

@CommandHandler(UpdateSampleCommand)
export class UpdateSampleHandler implements ICommandHandler<UpdateSampleCommand> {
  constructor(
    @Inject(SAMPLE_REPOSITORY)
    private readonly sampleRepository: SampleRepository,
  ) {}

  async execute(command: UpdateSampleCommand) {
    const sampleProps = await this.sampleRepository.findById(command.sampleId);
    // TODO: nullで例外をThrow
    const entity = new SampleEntity(sampleProps);
    entity.fromUpdateDto(command.reqBody, '仮ユーザー');
    await this.sampleRepository.update(command.sampleId, entity);
  }
}
