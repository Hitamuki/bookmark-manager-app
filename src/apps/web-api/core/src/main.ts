/**
 * main
 * モジュール定義
 */

// Datadogトレーサー初期化（他のインポートより前に記述）
import tracer from 'dd-trace';

// 環境を取得
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const isStaging = environment === 'staging';

// 環境別のDatadog設定
tracer.init({
  env: process.env.DD_ENV || environment,
  service: process.env.DD_SERVICE || 'bookmark-api',
  version: process.env.DD_VERSION || '1.0.0',

  // サンプリング率: staging=5%, production=20%
  sampleRate: isProduction ? 0.2 : isStaging ? 0.05 : 1.0,

  // レート制限: staging=10スパン/秒, production=50スパン/秒
  rateLimit: isProduction ? 50 : isStaging ? 10 : 100,

  // ログ連携（ERROR以上のみ）
  logInjection: true,

  // プロファイリング: stagingでは無効化（無料枠節約）
  profiling: isProduction,

  // ランタイムメトリクス: stagingでは無効化
  runtimeMetrics: isProduction,
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

  const port = process.env.PORT || 3001;
  await app.listen(port);

  // 環境に応じた適切なURLを表示
  const publicUrl = process.env.PUBLIC_URL;
  const baseUrl = publicUrl ? `${publicUrl}/${globalPrefix}` : `http://localhost:${port}/${globalPrefix}`;

  logger.log(`🚀 Application is running on: ${baseUrl}`);
}

bootstrap();
