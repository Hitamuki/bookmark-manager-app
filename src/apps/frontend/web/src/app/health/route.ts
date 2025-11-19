/**
 * Health Check Endpoint for Next.js Frontend
 * ALBヘルスチェック用のエンドポイント（フロントエンド専用）
 *
 * このエンドポイントはNext.jsアプリケーション自体の健全性を確認します。
 * バックエンドAPIのヘルスチェックは /api/health で提供されます。
 */
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // シンプルなヘルスチェック: アプリが起動していればOK
    // Sentryやその他の監視ツールで詳細なメトリクスを取得
    return NextResponse.json(
      {
        status: 'ok',
        service: 'bookmark-manager-web',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        service: 'bookmark-manager-web',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 },
    );
  }
}
