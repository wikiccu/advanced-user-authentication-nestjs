import { Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from './jwt.service';

@Module({
  imports: [
    NestJwtModule.register({
      global: false,
    }),
  ],
  providers: [JwtService],
  exports: [JwtService, NestJwtModule],
})
export class JwtModule {}
