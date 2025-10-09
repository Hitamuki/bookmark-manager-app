// biome-ignore lint/style/useImportType: NestJS needs this for dependency injection
import { Injectable, NestMiddleware } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS needs this for dependency injection
import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on('finish', () => {
      const elapsed = Date.now() - start;
      this.logger.log({
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: `${elapsed}ms`,
      });
    });
    next();
  }
}
