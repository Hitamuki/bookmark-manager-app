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
export const WinstonConfig = () => ({
  transports: [
    // コンソール出力
    new transports.Console({
      level: 'info',
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, context, trace }) => {
          const traceStr = trace ? `${trace}` : '';
          const messageStr = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;
          const contextStr = context ? (typeof context === 'object' ? JSON.stringify(context) : `[${context}]`) : '';
          return `${timestamp} ${level} ${contextStr} ${messageStr} ${traceStr}`;
        }),
      ),
    }),
    // MongoDB出力
    new transports.MongoDB({
      db: process.env.MONGODB_URI,
      collection: 'app_logs',
      options: {},
      tryReconnect: true,
    }),
  ],
});
