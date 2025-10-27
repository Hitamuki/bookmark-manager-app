/**
 * Prismaクライアントのライフサイクル管理とデータベース接続の制御
 */
import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * モジュール初期化時にデータベースに接続
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * モジュール破棄時にデータベース接続を切断
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
