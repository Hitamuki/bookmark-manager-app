/**
 * sample.module
 * モジュール定義
 */
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateSampleHandler } from '@/libs/application/sample/commands/handlers/create-sample.handler';
import { DeleteSampleHandler } from '@/libs/application/sample/commands/handlers/delete-sample.handler';
import { UpdateSampleHandler } from '@/libs/application/sample/commands/handlers/update-sample.handler';
import { GetSampleHandler } from '@/libs/application/sample/queries/handlers/get-sample.handler';
import { GetSamplesHandler } from '@/libs/application/sample/queries/handlers/get-samples.handler';
import { SAMPLE_REPOSITORY } from '@/libs/domain/sample/repositories/sample.repository';
import { SampleDomainService } from '@/libs/domain/sample/services/sample.domain-service';
import { SamplePrismaRepository } from '@/libs/infrastructure/prisma/repositories/sample.prisma.repository';
import { PrismaModule } from '../../bootstrap/prisma.module';
import { SampleController } from './sample.controller';

@Module({
  imports: [PrismaModule, CqrsModule],
  controllers: [SampleController],
  providers: [
    SampleDomainService,
    { provide: SAMPLE_REPOSITORY, useClass: SamplePrismaRepository },
    GetSamplesHandler,
    GetSampleHandler,
    CreateSampleHandler,
    UpdateSampleHandler,
    DeleteSampleHandler,
  ],
})
export class SampleModule {}
