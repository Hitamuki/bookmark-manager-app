/**
 * instrumentation
 * モジュール定義
 */
import * as Sentry from '@sentry/nextjs';

export async function register() {
  const port = process.env.PORT || 3000;
  console.log(`🚀 Application is running on: http://localhost:${port}`);

  // Sentry初期化（サーバーサイドのみ、クライアントサイドはwithSentryConfigが自動処理）
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

// Next.js 15のネストされたReact Server Componentsからのエラーをキャプチャ
export const onRequestError = Sentry.captureRequestError;
