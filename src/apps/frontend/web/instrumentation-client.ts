import * as Sentry from '@sentry/nextjs';

// 環境を取得（NODE_ENVはNext.jsの型定義に'staging'が含まれないため、文字列として扱う）
const environment = (process.env.NODE_ENV || 'development') as string;
const isProduction = environment === 'production';
const isStaging = environment === 'staging';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment,

  // staging環境でも有効化（developmentのみ無効）
  enabled: environment !== 'development',

  // エラーは全て記録（最優先）
  sampleRate: 1.0,

  // パフォーマンストレース: staging=5%, production=20%
  tracesSampleRate: isProduction ? 0.2 : isStaging ? 0.05 : 0,

  // 動的サンプリング設定
  tracesSampler: ({ name }) => {
    // 静的アセットは記録しない
    if (name.match(/\/_next\//)) return 0;

    // APIルートの記録: staging=20%, production=100%
    if (name.startsWith('/api/')) {
      return isProduction ? 1.0 : isStaging ? 0.2 : 0;
    }

    // ページビューの記録: staging=5%, production=20%
    return isProduction ? 0.2 : isStaging ? 0.05 : 0;
  },

  // セッションリプレイ: stagingは無効、productionは最小限
  replaysSessionSampleRate: isProduction ? 0 : 0, // 通常時は無効
  replaysOnErrorSampleRate: isProduction ? 0.1 : 0, // productionのみエラー時10%

  // 不要なエラーをフィルタリング
  beforeSend(event) {
    // ローカル開発環境のエラーのみ送信しない
    if (environment === 'development') return null;

    // ChunkLoadErrorは除外（Next.jsのビルド更新時に頻発）
    if (event.exception?.values?.[0]?.type === 'ChunkLoadError') {
      return null;
    }

    return event;
  },
});

// Next.js 15でナビゲーショントラッキングを有効化
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
