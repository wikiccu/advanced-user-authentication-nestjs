import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/dto/user-response.dto';

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto, description: 'User information' })
  user: UserResponseDto;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT refresh token' })
  refreshToken: string;

  constructor(user: UserResponseDto, accessToken: string, refreshToken: string) {
    this.user = user;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}

