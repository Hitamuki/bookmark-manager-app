/**
 * main
 * モジュール定義
 */

// Datadogトレーサー初期化（他のインポートより前に記述）
import tracer from 'dd-trace';

tracer.init({
  env: process.env.DD_ENV || 'development',
  service: process.env.DD_SERVICE || 'bookmark-api',
  version: process.env.DD_VERSION || '1.0.0',

  // サンプリング: 20%（コスト削減）
  sampleRate: 0.2,

  // レート制限: 秒あたり最大50スパン
  rateLimit: 50,

  // ログ連携（ERROR以上のみ）
  logInjection: true,
});

import * as fs from 'node:fs';
import path from 'node:path';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { WinstonConfig } from '@/libs/infrastructure/logging/winston.config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './presentation/filters/all-exceptions.filter';

/**
 * bootstrap関数
 */
async function bootstrap() {
  // Nestロガーの交換
  const logger = WinstonModule.createLogger(WinstonConfig());

  const app = await NestFactory.create(AppModule, { logger });

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    methods: 'GET,PUT,PATCH,POST,DELETE', // 許可するHTTPメソッド
    credentials: true, // TODO: Cookie を送信する場合に設定
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Swagger設定 TODO: ローカル環境のみ
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Bookmark Manager App API')
    .setDescription('APIドキュメント')
    .setVersion('v0.0')
    // .addBearerAuth() // JWTなどを使う場合
    .build();
  const openApiDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, cleanupOpenApiDoc(openApiDoc));

  // nestjs-zodのOpenAPI制御

  // openapi.jsonを自動更新
  const openApiPath = path.join(process.cwd(), 'docs/openapi/openapi.json');
  fs.mkdirSync(path.dirname(openApiPath), { recursive: true });
  fs.writeFileSync(openApiPath, JSON.stringify(openApiDoc, null, 2));

  // 例外フィルター
  // biome-ignore lint/correctness/useHookAtTopLevel: NestJSのコードなのでReact Hooksのルールは適用しない
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
