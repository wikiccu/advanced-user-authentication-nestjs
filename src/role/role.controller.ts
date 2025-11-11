import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from './role.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionDto,
  RoleResponseDto,
} from './dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@ApiTags('roles')
@ApiBearerAuth('JWT-auth')
@Controller('roles')
@UseGuards(RolesGuard, PermissionsGuard)
@Roles('admin')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * Create a new role
   */
  @Post()
  @Permissions('role:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully', type: RoleResponseDto })
  @ApiResponse({ status: 409, description: 'Role with this name already exists' })
  async createRole(
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<RoleResponseDto> {
    return this.roleService.create(createRoleDto);
  }

  /**
   * Get all roles
   */
  @Get()
  @Permissions('role:read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully', type: [RoleResponseDto] })
  async getAllRoles(): Promise<RoleResponseDto[]> {
    return this.roleService.findAll();
  }

  /**
   * Get role by ID
   */
  @Get(':id')
  @Permissions('role:read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async getRoleById(@Param('id') id: string): Promise<RoleResponseDto> {
    return this.roleService.findById(id);
  }

  /**
   * Get role with permissions
   */
  @Get(':id/permissions')
  @Permissions('role:read', 'permission:read')
  @HttpCode(HttpStatus.OK)
  async getRoleWithPermissions(@Param('id') id: string) {
    return this.roleService.findWithPermissions(id);
  }

  /**
   * Update role
   */
  @Put(':id')
  @Permissions('role:update')
  @HttpCode(HttpStatus.OK)
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    return this.roleService.update(id, updateRoleDto);
  }

  /**
   * Assign permissions to role
   */
  @Post(':id/permissions')
  @Permissions('role:update', 'permission:read')
  @HttpCode(HttpStatus.OK)
  async assignPermissions(
    @Param('id') id: string,
    @Body() assignPermissionDto: AssignPermissionDto,
  ): Promise<RoleResponseDto> {
    return this.roleService.assignPermissions(id, assignPermissionDto);
  }

  /**
   * Delete role
   */
  @Delete(':id')
  @Permissions('role:delete')
  @HttpCode(HttpStatus.OK)
  async deleteRole(@Param('id') id: string): Promise<{ message: string }> {
    await this.roleService.delete(id);
    return { message: 'Role deleted successfully' };
  }
}
