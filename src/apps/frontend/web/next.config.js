/**
 * next.configファイル
 * JavaScript設定・実行ファイル
 */
//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
const { withSentryConfig } = require('@sentry/nextjs');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 */
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
    incomingRequests: {
      ignore: [],
    },
  },
  output: 'standalone',
  async rewrites() {
    // ECS環境ではALB経由、ローカルではlocalhost:3001
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    return [
      {
        // 全ての /api/* をバックエンドAPIへプロキシ（/healthはApp Routerで処理）
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

// Sentryの設定オプション
const sentryWebpackPluginOptions = {
  // Sentryへのソースマップアップロードを無効化（必要に応じて有効化）
  silent: true,
  hideSourceMaps: true,
  widenClientFileUpload: true,
};

// NxとSentryを組み合わせる
module.exports = withSentryConfig(composePlugins(...plugins)(nextConfig), sentryWebpackPluginOptions);
