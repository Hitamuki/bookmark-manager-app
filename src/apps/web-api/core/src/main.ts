import { WinstonConfig } from '@libs/infrastructure/logging/winston.config';
import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './presentation/filters/all-exceptions.filter';

async function bootstrap() {
  // Nestロガーの交換
  const logger = WinstonModule.createLogger(WinstonConfig());

  const app = await NestFactory.create(AppModule, { logger: logger });

  // 例外フィルター
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
