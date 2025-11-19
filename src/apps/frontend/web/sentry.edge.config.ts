import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // staging環境でも有効化（developmentのみ無効）
  enabled: process.env.NODE_ENV !== 'development',

  // エラーは全て記録
  sampleRate: 1.0,

  // トレースは控えめ
  tracesSampleRate: 0.05, // 5%

  // Edgeランタイム向けのトレーシング設定
  tracesSampler: ({ name }) => {
    // ヘルスチェックは記録しない
    if (name.includes('health')) return 0;

    // Middleware処理は20%
    if (name.includes('middleware')) return 0.2;

    // その他は5%
    return 0.05;
  },
});
