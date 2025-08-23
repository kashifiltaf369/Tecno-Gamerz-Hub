import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import type { ApiResponse } from '@tecno-gamerz/types';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    let status: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = HttpStatus[status] || 'Unknown Error';
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        error = responseObj.error || HttpStatus[status] || 'Unknown Error';
      } else {
        message = exception.message;
        error = HttpStatus[status] || 'Unknown Error';
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      error = 'Internal Server Error';
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred';
      error = 'Internal Server Error';
    }

    // Log the exception
    const errorLog = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      statusCode: status,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
      userId: (request as any).user?.userId,
      requestId: request.id,
    };

    if (status >= 500) {
      this.logger.error(errorLog, 'Internal server error');
    } else if (status >= 400) {
      this.logger.warn(errorLog, 'Client error');
    }

    // Prepare API response
    const apiResponse: ApiResponse = {
      success: false,
      error: {
        code: error,
        message,
      },
      meta: {
        requestId: request.id,
        timestamp: new Date().toISOString(),
      },
    };

    // Send response
    response.status(status).send(apiResponse);
  }
}