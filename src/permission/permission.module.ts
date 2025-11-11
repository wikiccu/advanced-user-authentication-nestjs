import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [PermissionService],
  exports: [PermissionService],
  controllers: [PermissionController],
})
export class PermissionModule {}
