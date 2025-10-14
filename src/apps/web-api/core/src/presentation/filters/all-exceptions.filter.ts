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
    let parsedMessage: string;
    try {
      // messageがJSON文字列の場合、パースしてオブジェクトとして扱う
      parsedMessage = JSON.parse(message);
    } catch (e) {
      // パースに失敗した場合は、元のmessage文字列をそのまま使う
      parsedMessage = message;
    }

    this.logger.error('', (exception as Error).stack, {
      timestamp: new Date().toISOString(),
      statusCode: status,
      httpMethod: request.method,
      url: request.url,
      message: parsedMessage,
    });

    response.status(status).json({
      timestamp: new Date().toISOString(),
      statusCode: status,
      httpMethod: request.method,
      url: request.url,
      message: parsedMessage,
    });
  }
}
