import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'post:create', description: 'Permission name (unique)', minLength: 2 })
  @IsString()
  @MinLength(2, { message: 'Permission name must be at least 2 characters long' })
  name: string;

  @ApiPropertyOptional({ example: 'Create posts', description: 'Permission description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'post', description: 'Resource name', minLength: 2 })
  @IsString()
  @MinLength(2, { message: 'Resource must be at least 2 characters long' })
  resource: string;

  @ApiProperty({ example: 'create', description: 'Action name (create, read, update, delete)', minLength: 2 })
  @IsString()
  @MinLength(2, { message: 'Action must be at least 2 characters long' })
  action: string;
}

