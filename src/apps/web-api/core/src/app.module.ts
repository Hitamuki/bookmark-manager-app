import { Module } from '@nestjs/common';
import { PrismaModule } from './bootstrap/prisma.module';
import { SampleModule } from './presentation/sample/sample.module';

@Module({
  imports: [PrismaModule, SampleModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
