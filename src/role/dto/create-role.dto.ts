import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'editor', description: 'Role name (unique)', minLength: 2 })
  @IsString()
  @MinLength(2, { message: 'Role name must be at least 2 characters long' })
  name: string;

  @ApiPropertyOptional({ example: 'Can edit content', description: 'Role description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'clx123abc', description: 'Parent role ID for role hierarchy' })
  @IsOptional()
  @IsString()
  parentRoleId?: string;
}

