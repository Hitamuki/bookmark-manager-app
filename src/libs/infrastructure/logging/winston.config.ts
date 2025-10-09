import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import { format, transports } from 'winston';
import 'winston-mongodb';

export const WinstonConfig = () => ({
  transports: [
    // コンソール出力
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.colorize(),
        nestWinstonModuleUtilities.format.nestLike('API', { prettyPrint: true }),
      ),
    }),

    // MongoDB出力
    //   new transports.MongoDB({
    //     level: 'info',
    //     db: process.env.MONGO_LOG_URI,
    //     collection: 'app_logs',
    //     options: {
    //       useUnifiedTopology: true,
    //     },
    //     tryReconnect: true,
    //     format: winston.format.simple(),
    //   }),
  ],
});
