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

  // サーバーサイドのトレーシング設定
  tracesSampler: ({ name }) => {
    // ヘルスチェックは記録しない
    if (name.includes('health')) return 0;

    // APIルートは100%
    if (name.startsWith('/api/')) return 1;

    // その他は5%
    return 0.05;
  },
});
