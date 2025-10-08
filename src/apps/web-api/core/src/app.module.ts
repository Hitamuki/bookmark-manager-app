import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from './bootstrap/prisma.module';
import { SampleModule } from './presentation/sample/sample.module';

@Module({
  imports: [CqrsModule.forRoot(), PrismaModule, SampleModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
