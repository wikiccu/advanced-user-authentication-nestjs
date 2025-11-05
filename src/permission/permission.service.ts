import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionResponseDto } from './dto/permission-response.dto';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new permission
   */
  async create(
    createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionResponseDto> {
    // Check if permission already exists
    const existingPermission = await this.prisma.permission.findUnique({
      where: { name: createPermissionDto.name },
    });

    if (existingPermission) {
      throw new ConflictException('Permission with this name already exists');
    }

    // Create permission
    const permission = await this.prisma.permission.create({
      data: {
        name: createPermissionDto.name,
        description: createPermissionDto.description,
        resource: createPermissionDto.resource,
        action: createPermissionDto.action,
      },
    });

    return new PermissionResponseDto(permission);
  }

  /**
   * Find all permissions
   */
  async findAll(): Promise<PermissionResponseDto[]> {
    const permissions = await this.prisma.permission.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return permissions.map((permission) => new PermissionResponseDto(permission));
  }

  /**
   * Find permission by ID
   */
  async findById(id: string): Promise<PermissionResponseDto> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return new PermissionResponseDto(permission);
  }

  /**
   * Find permission by name
   */
  async findByName(name: string) {
    return this.prisma.permission.findUnique({
      where: { name },
    });
  }

  /**
   * Find permissions by resource
   */
  async findByResource(resource: string): Promise<PermissionResponseDto[]> {
    const permissions = await this.prisma.permission.findMany({
      where: { resource },
      orderBy: { createdAt: 'desc' },
    });

    return permissions.map((permission) => new PermissionResponseDto(permission));
  }

  /**
   * Update permission
   */
  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    // Check if permission exists
    const existingPermission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!existingPermission) {
      throw new NotFoundException('Permission not found');
    }

    // Check if new name conflicts with existing permission
    if (
      updatePermissionDto.name &&
      updatePermissionDto.name !== existingPermission.name
    ) {
      const permissionWithSameName = await this.prisma.permission.findUnique({
        where: { name: updatePermissionDto.name },
      });

      if (permissionWithSameName) {
        throw new ConflictException(
          'Permission with this name already exists',
        );
      }
    }

    // Update permission
    const permission = await this.prisma.permission.update({
      where: { id },
      data: updatePermissionDto,
    });

    return new PermissionResponseDto(permission);
  }

  /**
   * Delete permission
   */
  async delete(id: string): Promise<void> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.prisma.permission.delete({
      where: { id },
    });
  }

  /**
   * Get all permissions for a role
   */
  async getRolePermissions(roleId: string) {
    return this.prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
    });
  }

  /**
   * Get all permissions for a user (through roles)
   */
  async getUserPermissions(userId: string) {
    // Get user roles
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // Extract unique permissions
    const permissionsMap = new Map();
    userRoles.forEach((userRole) => {
      userRole.role.rolePermissions.forEach((rolePermission) => {
        const permission = rolePermission.permission;
        if (!permissionsMap.has(permission.id)) {
          permissionsMap.set(permission.id, permission);
        }
      });
    });

    return Array.from(permissionsMap.values());
  }
}
