import { CreateSampleHandler } from '@libs/application/sample/commands/handlers/create-sample.handler';
import { GetSamplesHandler } from '@libs/application/sample/queries/handlers/get-samples.handler';
import { SAMPLE_REPOSITORY } from '@libs/domain/sample/repositories/sample.repository';
import { SamplePrismaRepository } from '@libs/infrastructure/prisma/repositories/sample.prisma.repository';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '../../bootstrap/prisma.module';
import { SampleController } from './sample.controller';

@Module({
  imports: [PrismaModule, CqrsModule],
  controllers: [SampleController],
  providers: [{ provide: SAMPLE_REPOSITORY, useClass: SamplePrismaRepository }, CreateSampleHandler, GetSamplesHandler],
})
export class SampleModule {}
