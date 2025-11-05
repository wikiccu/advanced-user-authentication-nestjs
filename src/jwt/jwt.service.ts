import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, RefreshTokenPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate access token
   */
  async generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
    const secret = this.configService.get<string>('JWT_SECRET') || 'default-secret';
    const expiresIn = this.configService.get<string>('JWT_EXPIRATION') || '15m';
    
    return this.jwtService.signAsync(payload as any, {
      secret,
      expiresIn: expiresIn as any,
    });
  }

  /**
   * Generate refresh token
   */
  async generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): Promise<string> {
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret';
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
    
    return this.jwtService.signAsync(payload as any, {
      secret,
      expiresIn: expiresIn as any,
    });
  }

  /**
   * Verify access token
   */
  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'default-secret';
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  /**
   * Verify refresh token
   */
  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      const secret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret';
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
        secret,
      });
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken<T = any>(token: string): T {
    return this.jwtService.decode(token) as T;
  }

  /**
   * Generate token pair (access + refresh)
   */
  async generateTokenPair(
    userId: string,
    email: string,
    refreshTokenId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken({ sub: userId, email }),
      this.generateRefreshToken({ sub: userId, tokenId: refreshTokenId }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
