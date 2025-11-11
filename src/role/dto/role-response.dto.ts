import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty({ example: 'clx123abc', description: 'Role ID' })
  id: string;

  @ApiProperty({ example: 'admin', description: 'Role name' })
  name: string;

  @ApiPropertyOptional({ example: 'Administrator with full access', description: 'Role description' })
  description?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Last update timestamp' })
  updatedAt: Date;

  constructor(role: any) {
    this.id = role.id;
    this.name = role.name;
    this.description = role.description;
    this.createdAt = role.createdAt;
    this.updatedAt = role.updatedAt;
  }
}

