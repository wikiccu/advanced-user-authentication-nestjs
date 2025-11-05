import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { RoleResponseDto } from './dto/role-response.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new role
   */
  async create(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    // Check if role already exists
    const existingRole = await this.prisma.role.findUnique({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    // Create role
    const role = await this.prisma.role.create({
      data: {
        name: createRoleDto.name,
        description: createRoleDto.description,
      },
    });

    return new RoleResponseDto(role);
  }

  /**
   * Find all roles
   */
  async findAll(): Promise<RoleResponseDto[]> {
    const roles = await this.prisma.role.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return roles.map((role) => new RoleResponseDto(role));
  }

  /**
   * Find role by ID
   */
  async findById(id: string): Promise<RoleResponseDto> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return new RoleResponseDto(role);
  }

  /**
   * Find role by name
   */
  async findByName(name: string) {
    return this.prisma.role.findUnique({
      where: { name },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  /**
   * Update role
   */
  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    // Check if role exists
    const existingRole = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      throw new NotFoundException('Role not found');
    }

    // Check if new name conflicts with existing role
    if (updateRoleDto.name && updateRoleDto.name !== existingRole.name) {
      const roleWithSameName = await this.prisma.role.findUnique({
        where: { name: updateRoleDto.name },
      });

      if (roleWithSameName) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    // Update role
    const role = await this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });

    return new RoleResponseDto(role);
  }

  /**
   * Delete role
   */
  async delete(id: string): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.prisma.role.delete({
      where: { id },
    });
  }

  /**
   * Assign permissions to role
   */
  async assignPermissions(
    roleId: string,
    assignPermissionDto: AssignPermissionDto,
  ): Promise<RoleResponseDto> {
    // Check if role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Verify all permissions exist
    const permissions = await this.prisma.permission.findMany({
      where: {
        id: {
          in: assignPermissionDto.permissionIds,
        },
      },
    });

    if (permissions.length !== assignPermissionDto.permissionIds.length) {
      throw new NotFoundException('One or more permissions not found');
    }

    // Remove existing permissions
    await this.prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Assign new permissions
    await this.prisma.rolePermission.createMany({
      data: assignPermissionDto.permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
      })),
    });

    // Return updated role
    const updatedRole = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    return new RoleResponseDto(updatedRole!);
  }

  /**
   * Get role with permissions
   */
  async findWithPermissions(id: string) {
    return this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string) {
    return this.prisma.userRole.findMany({
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
  }
}
