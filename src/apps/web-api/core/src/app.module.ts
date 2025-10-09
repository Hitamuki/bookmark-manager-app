import { Logger, type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from './bootstrap/prisma.module';
import { LoggerMiddleware } from './presentation/middleware/logger.middleware';
import { SampleModule } from './presentation/sample/sample.module';

@Module({
  providers: [Logger],
  controllers: [],
  imports: [CqrsModule.forRoot(), PrismaModule, SampleModule],
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
