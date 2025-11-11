import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'clx123abc', description: 'User ID' })
  id: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;

  @ApiPropertyOptional({ example: 'John', description: 'User first name' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'User last name' })
  lastName?: string;

  @ApiProperty({ example: true, description: 'User active status' })
  isActive: boolean;

  @ApiProperty({ example: false, description: 'Email verification status' })
  isEmailVerified: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Last update timestamp' })
  updatedAt: Date;

  constructor(user: any) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.isActive = user.isActive;
    this.isEmailVerified = user.isEmailVerified;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}

