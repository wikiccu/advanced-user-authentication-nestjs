import {
  Controller,
  Get,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto, ChangePasswordDto } from './dto';
import { UserResponseDto } from './dto/user-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get current user profile
   */
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUser() user: any): Promise<UserResponseDto> {
    return this.userService.findById(user.id);
  }

  /**
   * Update current user profile
   */
  @Put('profile')
  @HttpCode(HttpStatus.OK)
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
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    await this.userService.delete(id);
    return { message: 'User deleted successfully' };
  }
}
