import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create an audit log entry
   */
  async createAuditLog(dto: CreateAuditLogDto): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: dto.userId,
          action: dto.action,
          resource: dto.resource,
          resourceId: dto.resourceId,
          ipAddress: dto.ipAddress,
          userAgent: dto.userAgent,
          method: dto.method,
          path: dto.path,
          statusCode: dto.statusCode,
          metadata: dto.metadata ? JSON.stringify(dto.metadata) : null,
        },
      });
    } catch (error) {
      // Don't throw error if audit logging fails - log it instead
      console.error('Failed to create audit log:', error);
    }
  }

  /**
   * Get audit logs for a user
   */
  async getUserAuditLogs(userId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get audit logs by action
   */
  async getAuditLogsByAction(action: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { action },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get audit logs by resource
   */
  async getAuditLogsByResource(resource: string, resourceId?: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        resource,
        resourceId: resourceId || undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
