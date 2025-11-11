/**
 * ログ出力の設定（コンソール・MongoDB）とログレベル管理
 */
import * as winston from 'winston';
import { format, transports } from 'winston';
import 'winston-mongodb';
const { combine, timestamp, colorize } = format;

/**
 * Winston設定を返す関数
 * @returns Winston設定オブジェクト
 */
export const WinstonConfig = () => {
  // ローカル環境ではカラー表示、本番環境ではカラーなし
  const isLocal = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local';

  // カラー表示設定を条件付きで追加
  const formatters = [
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    ...(isLocal ? [colorize({ level: true })] : []),
    winston.format.printf(({ timestamp, level, message, context, trace }) => {
      // messageが既にJSON文字列の場合はそのまま、オブジェクトの場合はJSON化
      const messageStr = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;

      // contextとtraceは存在する場合のみ追加
      const parts = [timestamp, level];
      if (context) {
        const contextStr = typeof context === 'object' ? JSON.stringify(context) : `[${context}]`;
        parts.push(contextStr);
      }
      parts.push(messageStr);
      if (trace) {
        parts.push(trace);
      }

      return parts.join(' ');
    }),
  ];

  return {
    transports: [
      // コンソール出力
      new transports.Console({
        level: 'info',
        format: combine(...formatters),
      }),
      // MongoDB出力
      new transports.MongoDB({
        db: process.env.MONGODB_URI,
        collection: 'app_logs',
        options: {},
        tryReconnect: true,
      }),
    ],
  };
};
