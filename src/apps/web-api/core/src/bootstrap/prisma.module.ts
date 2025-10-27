/**
 * prisma.moduleの機能実装
 */
import { Global, Module } from '@nestjs/common';
import { PrismaService } from '@/libs/infrastructure/prisma/prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})

/**
 * PrismaModuleの実装
 */
export class PrismaModule {}
