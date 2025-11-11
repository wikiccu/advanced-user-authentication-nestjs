import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PermissionResponseDto {
  @ApiProperty({ example: 'clx123abc', description: 'Permission ID' })
  id: string;

  @ApiProperty({ example: 'user:create', description: 'Permission name' })
  name: string;

  @ApiPropertyOptional({ example: 'Create users', description: 'Permission description' })
  description?: string;

  @ApiProperty({ example: 'user', description: 'Resource name' })
  resource: string;

  @ApiProperty({ example: 'create', description: 'Action name' })
  action: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Last update timestamp' })
  updatedAt: Date;

  constructor(permission: any) {
    this.id = permission.id;
    this.name = permission.name;
    this.description = permission.description;
    this.resource = permission.resource;
    this.action = permission.action;
    this.createdAt = permission.createdAt;
    this.updatedAt = permission.updatedAt;
  }
}

