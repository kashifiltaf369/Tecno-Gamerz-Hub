import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FastifyRequest } from 'fastify';
import type { ApiResponse } from '@tecno-gamerz/types';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    
    return next.handle().pipe(
      map((data) => {
        // If the data is already a properly formatted API response, return it as is
        if (data && typeof data === 'object' && 'success' in data && 'meta' in data) {
          return data;
        }

        // Otherwise, wrap the data in a standard API response format
        const response: ApiResponse<T> = {
          success: true,
          data,
          meta: {
            requestId: request.id,
            timestamp: new Date().toISOString(),
          },
        };

        return response;
      }),
    );
  }
}