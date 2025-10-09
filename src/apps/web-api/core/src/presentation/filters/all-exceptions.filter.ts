import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
// import * as Sentry from '@sentry/node';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? exception.message : 'Internal server error';

    // ログ出力
    this.logger.error({
      timestamp: new Date().toISOString(),
      statusCode: status,
      httpMethod: request.method,
      url: request.url,
      message,
      stack: (exception as Error).stack,
    });

    // Sentryへ通知（重大エラーのみ）
    if (status === 500) {
      // Sentry.captureException(exception);
    }

    response.status(status).json({
      timestamp: new Date().toISOString(),
      statusCode: status,
      httpMethod: request.method,
      url: request.url,
      message,
    });
  }
}
