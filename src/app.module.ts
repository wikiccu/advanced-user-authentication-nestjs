import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { JwtModule } from './jwt/jwt.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth/jwt-auth.guard';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter';
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
    PrismaModule,
    UserModule,
    JwtModule,
    AuthModule,
    RoleModule,
    PermissionModule,
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
