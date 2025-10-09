import { patchNestjsSwagger } from '@anatine/zod-nestjs';
import { WinstonConfig } from '@libs/infrastructure/logging/winston.config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './presentation/filters/all-exceptions.filter';

async function bootstrap() {
  // Nestロガーの交換
  const logger = WinstonModule.createLogger(WinstonConfig());

  const app = await NestFactory.create(AppModule, { logger });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Swagger設定 TODO: ローカル環境のみ
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Bookmark Manager App API')
    .setDescription('APIドキュメント')
    .setVersion('v0.0')
    // .addBearerAuth() // JWTなどを使う場合
    .build();
  patchNestjsSwagger();
  const documentFactory = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, documentFactory, {
    jsonDocumentUrl: 'swagger/json',
  });

  // 例外フィルター
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
