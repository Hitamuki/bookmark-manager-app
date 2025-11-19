/**
 * instrumentation
 * モジュール定義
 */
export async function register() {
  const port = process.env.PORT || 3000;
  console.log(`🚀 Application is running on: http://localhost:${port}`);

  // Sentry初期化
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }

  // クライアントサイドの初期化
  if (typeof window !== 'undefined') {
    await import('../instrumentation-client');
  }
}
