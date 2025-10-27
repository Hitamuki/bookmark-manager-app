/**
 * サンプル削除コマンドを処理し、関連データを適切に処理して削除実行
 */
import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { SAMPLE_REPOSITORY, type SampleRepository } from '@/libs/domain/sample/repositories/sample.repository';
import { DeleteSampleCommand } from '../delete-sample.command';

@CommandHandler(DeleteSampleCommand)
export class DeleteSampleHandler implements ICommandHandler<DeleteSampleCommand> {
  constructor(
    @Inject(SAMPLE_REPOSITORY)
    private readonly sampleRepository: SampleRepository,
  ) {}

  async execute(command: DeleteSampleCommand) {
    const sampleEntity = await this.sampleRepository.findById(command.sampleId);
    if (sampleEntity === null) {
      throw new NotFoundException();
    }

    await this.sampleRepository.delete(command.sampleId);
  }
}
