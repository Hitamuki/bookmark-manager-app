import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // staging環境でも有効化（developmentのみ無効）
  enabled: process.env.NODE_ENV !== 'development',

  // エラーは全て記録（最優先）
  sampleRate: 1.0,

  // パフォーマンストレースは控えめ（無料枠内に収める）
  tracesSampleRate: 0.05, // 5%

  // 動的サンプリング設定
  tracesSampler: ({ name }) => {
    // 静的アセットは記録しない
    if (name.match(/\/_next\//)) return 0;

    // APIルートは100%
    if (name.startsWith('/api/')) return 1;

    // ページビューは5%
    return 0.05;
  },

  // セッションリプレイは最小限
  replaysSessionSampleRate: 0, // 通常時は無効
  replaysOnErrorSampleRate: 0.1, // エラー時のみ10%

  // 不要なエラーをフィルタリング
  beforeSend(event) {
    // ローカル開発環境のエラーのみ送信しない
    if (process.env.NODE_ENV === 'development') return null;

    // ChunkLoadErrorは除外（Next.jsのビルド更新時に頻発）
    if (event.exception?.values?.[0]?.type === 'ChunkLoadError') {
      return null;
    }

    return event;
  },
});

// Next.js 15でナビゲーショントラッキングを有効化
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
