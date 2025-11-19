/**
 * index
 * モジュール定義
 */
async function initMocks() {
  // 開発環境のみMSWを有効化
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  if (typeof window === 'undefined') {
    const { server } = await import('./server');
    server.listen({
      onUnhandledRequest: 'bypass', // Sentryなど外部サービスへのリクエストは通す
    });
  } else {
    const { worker } = await import('./browser');
    worker.start({
      onUnhandledRequest: 'bypass', // Sentryなど外部サービスへのリクエストは通す
    });
  }
}
initMocks();

export {};
