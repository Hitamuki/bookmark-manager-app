import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { Logger, type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from './bootstrap/prisma.module';
import { LoggerMiddleware } from './presentation/middleware/logger.middleware';
import { SampleModule } from './presentation/sample/sample.module';

@Module({
  providers: [
    Logger,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
  controllers: [],
  imports: [ConfigModule.forRoot(), CqrsModule.forRoot(), PrismaModule, SampleModule],
  exports: [],
})

// ルートモジュール
export class AppModule implements NestModule {
  // ミドルウェアの適用
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude(
        // 除外ルート
      )
      .forRoutes('*');
  }
}
