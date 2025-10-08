import { SampleService } from '@libs/application/sample/sample.usecase';
import { SAMPLE_REPOSITORY } from '@libs/domain/sample/repositories/sample.repository';
import { SamplePrismaRepository } from '@libs/infrastructure/prisma/repositories/sample.prisma.repository';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../bootstrap/prisma.module';
import { SampleController } from './sample.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SampleController],
  providers: [SampleService, { provide: SAMPLE_REPOSITORY, useClass: SamplePrismaRepository }],
})
export class SampleModule {}
