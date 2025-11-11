/**
 * app.module
 * モジュール定義
 */

import { Logger, type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { TerminusModule } from '@nestjs/terminus';
import { ZodValidationPipe } from 'nestjs-zod';
import { PrismaModule } from './bootstrap/prisma.module';
import { HealthController } from './presentation/health/health.controller';
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
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot(),
    CqrsModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI || ''),
    PrismaModule,
    SampleModule,
    TerminusModule,
  ],
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
        '/api/health',
      )
      .forRoutes('*path');
  }
}
