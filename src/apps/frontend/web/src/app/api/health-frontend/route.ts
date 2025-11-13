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
    // 必要に応じて追加のヘルスチェックを実装
    // 例: メモリ使用量、重要な設定値の確認など
    const memoryUsage = process.memoryUsage();
    const isHealthy = memoryUsage.heapUsed < memoryUsage.heapTotal * 0.9; // 90%以下

    if (!isHealthy) {
      return NextResponse.json(
        {
          status: 'degraded',
          service: 'bookmark-manager-web',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: {
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          },
        },
        { status: 503 },
      );
    }

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
