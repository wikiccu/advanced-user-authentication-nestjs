import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const user = (request as any).user;

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: async (data) => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const duration = Date.now() - startTime;

          // Log request
          console.log(
            `${method} ${url} ${statusCode} - ${duration}ms - ${ip}`,
          );

          // Create audit log for authenticated requests
          if (user) {
            await this.auditService.createAuditLog({
              userId: user.id,
              action: `${method.toLowerCase()}_${url.split('/').pop() || 'unknown'}`,
              resource: url.split('/')[2] || undefined, // e.g., 'auth', 'user', 'role'
              resourceId: (data as any)?.id || undefined,
              ipAddress: ip,
              userAgent,
              method,
              path: url,
              statusCode,
              metadata: {
                duration,
                timestamp: new Date().toISOString(),
              },
            });
          }
        },
        error: async (error) => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode || 500;
          const duration = Date.now() - startTime;

          // Log error
          console.error(
            `${method} ${url} ${statusCode} - ${duration}ms - ${ip} - ERROR: ${error.message}`,
          );

          // Create audit log for errors
          if (user) {
            await this.auditService.createAuditLog({
              userId: user.id,
              action: `${method.toLowerCase()}_${url.split('/').pop() || 'unknown'}_error`,
              resource: url.split('/')[2] || undefined,
              ipAddress: ip,
              userAgent,
              method,
              path: url,
              statusCode,
              metadata: {
                duration,
                error: error.message,
                timestamp: new Date().toISOString(),
              },
            });
          }
        },
      }),
    );
  }
}

