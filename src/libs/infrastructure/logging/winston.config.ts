import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
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
    // new transports.MongoDB({
    //   level: 'info',
    //   db: process.env.MONGO_LOG_URI,
    //   options: { useUnifiedTopology: true },
    //   collection: 'application_logs',
    //   tryReconnect: true,
    //   format: format.combine(format.timestamp(), format.json()),
    // }),
  ],
});
