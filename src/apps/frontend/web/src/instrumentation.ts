/**
 * instrumentation
 * モジュール定義
 */
import * as Sentry from '@sentry/nextjs';

export async function register() {
  // 環境に応じた適切なURLを表示
  const publicUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
  const port = process.env.PORT || 3000;
  const baseUrl = publicUrl
    ? publicUrl.startsWith('http')
      ? publicUrl
      : `https://${publicUrl}`
    : `http://localhost:${port}`;

  console.log(`🚀 Application is running on: ${baseUrl}`);

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
