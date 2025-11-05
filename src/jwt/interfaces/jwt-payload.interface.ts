export interface JwtPayload {
  sub: string; // User ID
  email: string;
  iat?: number; // Issued at
  exp?: number; // Expiration
}

export interface RefreshTokenPayload {
  sub: string; // User ID
  tokenId: string; // Refresh token ID
  iat?: number;
  exp?: number;
}

