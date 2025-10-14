import { SampleEntity } from '@libs/domain/sample/entities/sample.entity';
import { SAMPLE_REPOSITORY, type SampleRepository } from '@libs/domain/sample/repositories/sample.repository';
import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler, type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ZodError } from 'zod';
import { UpdateSampleDtoSchema } from '../../dto/update-sample.dto';
import { UpdateSampleCommand } from '../update-sample.command';

@CommandHandler(UpdateSampleCommand)
export class UpdateSampleHandler implements ICommandHandler<UpdateSampleCommand> {
  constructor(
    @Inject(SAMPLE_REPOSITORY)
    private readonly sampleRepository: SampleRepository,
  ) {}

  async execute(command: UpdateSampleCommand) {
    // DTOのZodバリデーション
    try {
      UpdateSampleDtoSchema.parse(command.reqBody);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(error);
      }
      throw error;
    }

    const sampleProps = await this.sampleRepository.findById(command.sampleId);
    if (sampleProps === null) {
      throw new NotFoundException();
    }

    const entity = new SampleEntity(sampleProps);
    entity.fromUpdateDto(command.reqBody, '仮ユーザー'); // TODO: Userテーブル対応

    await this.sampleRepository.update(command.sampleId, entity);
  }
}
