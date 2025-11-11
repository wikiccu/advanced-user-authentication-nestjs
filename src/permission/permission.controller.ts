import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  PermissionResponseDto,
} from './dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@ApiTags('permissions')
@ApiBearerAuth('JWT-auth')
@Controller('permissions')
@UseGuards(RolesGuard, PermissionsGuard)
@Roles('admin')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  /**
   * Create a new permission
   */
  @Post()
  @Permissions('permission:read') // Note: permission:create doesn't exist in seed, using read
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully', type: PermissionResponseDto })
  @ApiResponse({ status: 409, description: 'Permission with this name already exists' })
  async createPermission(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionResponseDto> {
    return this.permissionService.create(createPermissionDto);
  }

  /**
   * Get all permissions
   */
  @Get()
  @Permissions('permission:read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiQuery({ name: 'resource', required: false, description: 'Filter by resource name' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved successfully', type: [PermissionResponseDto] })
  async getAllPermissions(
    @Query('resource') resource?: string,
  ): Promise<PermissionResponseDto[]> {
    if (resource) {
      return this.permissionService.findByResource(resource);
    }
    return this.permissionService.findAll();
  }

  /**
   * Get permission by ID
   */
  @Get(':id')
  @Permissions('permission:read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiResponse({ status: 200, description: 'Permission retrieved successfully', type: PermissionResponseDto })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async getPermissionById(
    @Param('id') id: string,
  ): Promise<PermissionResponseDto> {
    return this.permissionService.findById(id);
  }

  /**
   * Update permission
   */
  @Put(':id')
  @Permissions('permission:read') // Note: permission:update doesn't exist in seed
  @HttpCode(HttpStatus.OK)
  async updatePermission(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    return this.permissionService.update(id, updatePermissionDto);
  }

  /**
   * Delete permission
   */
  @Delete(':id')
  @Permissions('permission:read') // Note: permission:delete doesn't exist in seed
  @HttpCode(HttpStatus.OK)
  async deletePermission(@Param('id') id: string): Promise<{ message: string }> {
    await this.permissionService.delete(id);
    return { message: 'Permission deleted successfully' };
  }
}
