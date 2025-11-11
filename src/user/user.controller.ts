import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto, ChangePasswordDto, AssignRoleDto } from './dto';
import { UserResponseDto } from './dto/user-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get current user profile
   */
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully', type: UserResponseDto })
  async getProfile(@CurrentUser() user: any): Promise<UserResponseDto> {
    return this.userService.findById(user.id);
  }

  /**
   * Update current user profile
   */
  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: UserResponseDto })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(user.id, updateUserDto);
  }

  /**
   * Change current user password
   */
  @Patch('profile/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.userService.changePassword(user.id, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  /**
   * Get all users (admin only)
   */
  @Get()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('user:read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully', type: [UserResponseDto] })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getAllUsers(): Promise<UserResponseDto[]> {
    return this.userService.findAll();
  }

  /**
   * Get user by ID (admin only)
   */
  @Get(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('user:read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.findById(id);
  }

  /**
   * Update user by ID (admin only)
   */
  @Put(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('user:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  /**
   * Delete user by ID (admin only)
   */
  @Delete(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('user:delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    await this.userService.delete(id);
    return { message: 'User deleted successfully' };
  }

  /**
   * Get user roles list (admin only) - must come before :id/roles
   */
  @Get(':id/roles/list')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('user:read', 'role:read')
  @HttpCode(HttpStatus.OK)
  async getUserRoles(@Param('id') id: string) {
    return this.userService.getUserRoles(id);
  }

  /**
   * Get user with roles (admin only)
   */
  @Get(':id/roles')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('user:read', 'role:read')
  @HttpCode(HttpStatus.OK)
  async getUserWithRoles(@Param('id') id: string) {
    return this.userService.findWithRoles(id);
  }

  /**
   * Assign roles to user (admin only)
   */
  @Post(':id/roles')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin')
  @Permissions('user:update', 'role:read')
  @HttpCode(HttpStatus.OK)
  async assignRoles(
    @Param('id') id: string,
    @Body() assignRoleDto: AssignRoleDto,
  ): Promise<UserResponseDto> {
    return this.userService.assignRoles(id, assignRoleDto);
  }
}
