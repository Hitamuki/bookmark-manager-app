import * as Sentry from '@sentry/nextjs';

// 環境を取得（NODE_ENVはNext.jsの型定義に'staging'が含まれないため、文字列として扱う）
const environment = (process.env.NODE_ENV || 'development') as string;
const isProduction = environment === 'production';
const isStaging = environment === 'staging';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment,

  // staging環境でも有効化（developmentのみ無効）
  enabled: environment !== 'development',

  // エラーは全て記録
  sampleRate: 1.0,

  // トレース: staging=5%, production=20%
  tracesSampleRate: isProduction ? 0.2 : isStaging ? 0.05 : 0,

  // Edgeランタイム向けのトレーシング設定
  tracesSampler: ({ name }) => {
    // ヘルスチェックは記録しない
    if (name.includes('health')) return 0;

    // Middleware処理: staging=10%, production=30%
    if (name.includes('middleware')) {
      return isProduction ? 0.3 : isStaging ? 0.1 : 0;
    }

    // その他: staging=5%, production=20%
    return isProduction ? 0.2 : isStaging ? 0.05 : 0;
  },
});
