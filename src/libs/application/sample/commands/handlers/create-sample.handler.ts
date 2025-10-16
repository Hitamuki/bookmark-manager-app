import { SampleEntity } from '@libs/domain/sample/entities/sample.entity';
import { SAMPLE_REPOSITORY, type SampleRepository } from '@libs/domain/sample/repositories/sample.repository';
// biome-ignore lint/style/useImportType: NestJS needs this for dependency injection
import { SampleDomainService } from '@libs/domain/sample/services/sample.domain-service';
import { BadRequestException, ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { ZodError } from 'zod';
import { CreateSampleCommand } from '../../commands/create-sample.command';
import { CreateSampleDtoSchema } from '../../dto/create-sample.dto';

@CommandHandler(CreateSampleCommand)
export class CreateSampleHandler implements ICommandHandler<CreateSampleCommand> {
  constructor(
    @Inject(SAMPLE_REPOSITORY)
    private readonly sampleRepository: SampleRepository,
    private readonly sampleDomainService: SampleDomainService,
  ) {}

  async execute(command: CreateSampleCommand) {
    // DTOのZodバリデーション
    try {
      CreateSampleDtoSchema.parse(command.reqBody);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(error);
      }
      throw error;
    }

    const sampleEntity = SampleEntity.createFromCreateSampleDto(command.reqBody, '仮ユーザー'); // TODO: Userテーブル対応

    // ID重複チェック
    const duplicationResult = await this.sampleDomainService.existsSampleId(sampleEntity.id);
    if (duplicationResult === true) {
      throw new ConflictException();
    }

    await this.sampleRepository.create(sampleEntity);
  }
}
