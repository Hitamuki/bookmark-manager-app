/**
 * next.configファイル
 * JavaScript設定・実行ファイル
 */
//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

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
    // ECS環境ではALB経由、ローカルではlocalhost:4000
    const apiUrl = process.env.API_URL || 'http://localhost:4000';
    return [
      {
        // /api/health-frontend 以外の /api/* をバックエンドAPIへプロキシ
        source: '/api/:path((?!health-frontend).*)',
        destination: `${apiUrl}/api/:path`,
      },
    ];
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
