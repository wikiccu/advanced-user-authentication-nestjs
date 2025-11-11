import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { JwtModule } from './jwt/jwt.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth/jwt-auth.guard';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { AuditModule } from './audit/audit.module';
import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import {
  RateLimitMiddleware,
  AuthRateLimitMiddleware,
  SecurityHeadersMiddleware,
} from './common/middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true,
                },
              }
            : undefined,
        serializers: {
          req: (req) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            headers: {
              host: req.headers.host,
              'user-agent': req.headers['user-agent'],
            },
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },
      },
    }),
    PrismaModule,
    UserModule,
    JwtModule,
    AuthModule,
    RoleModule,
    PermissionModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    RateLimitMiddleware,
    AuthRateLimitMiddleware,
    SecurityHeadersMiddleware,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply security headers to all routes
    consumer.apply(SecurityHeadersMiddleware).forRoutes('*');

    // Apply general rate limiting to all routes
    consumer.apply(RateLimitMiddleware).forRoutes('*');

    // Apply stricter rate limiting to auth routes
    consumer
      .apply(AuthRateLimitMiddleware)
      .forRoutes('auth/register', 'auth/login', 'auth/refresh');
  }
}
