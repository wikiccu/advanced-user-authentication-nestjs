import { UserResponseDto } from '../../user/dto/user-response.dto';

export class AuthResponseDto {
  user: UserResponseDto;
  accessToken: string;
  refreshToken: string;

  constructor(user: UserResponseDto, accessToken: string, refreshToken: string) {
    this.user = user;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}

