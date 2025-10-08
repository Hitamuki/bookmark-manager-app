import { SampleEntity } from '@libs/domain/sample/entities/sample.entity';
import { SAMPLE_REPOSITORY, type SampleRepository } from '@libs/domain/sample/repositories/sample.repository';
import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler, type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CreateSampleCommand } from '../../commands/create-sample.command';
import { CreateSampleDtoSchema } from '../../dto/create-sample.dto';

@CommandHandler(CreateSampleCommand)
export class CreateSampleHandler implements ICommandHandler<CreateSampleCommand> {
  constructor(
    @Inject(SAMPLE_REPOSITORY)
    private readonly sampleRepository: SampleRepository,
  ) {}

  async execute(command: CreateSampleCommand) {
    // DTOのZodバリデーション
    CreateSampleDtoSchema.parse(command.reqBody);
    const entity = SampleEntity.create(command.reqBody.title, '仮ユーザー'); // TODO: Userテーブル対応
    await this.sampleRepository.create(entity);
  }
}
