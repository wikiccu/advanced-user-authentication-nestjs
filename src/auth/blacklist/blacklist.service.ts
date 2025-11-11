import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { JwtService } from '../../jwt/jwt.service';

interface BlacklistedToken {
  token: string;
  expiresAt: number; // Unix timestamp in milliseconds
}

@Injectable()
export class BlacklistService implements OnModuleInit, OnModuleDestroy {
  private blacklist: Map<string, number> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private jwtService: JwtService) {}

  onModuleInit() {
    // Clean up expired tokens every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredTokens();
    }, 5 * 60 * 1000);
  }

  /**
   * Add token to blacklist
   */
  async addToBlacklist(token: string): Promise<void> {
    try {
      // Decode token to get expiration
      const decoded = this.jwtService.decodeToken<{ exp?: number }>(token);
      
      if (decoded && decoded.exp) {
        // Convert expiration to milliseconds
        const expiresAt = decoded.exp * 1000;
        this.blacklist.set(token, expiresAt);
      } else {
        // If no expiration, set a default expiration (24 hours)
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
        this.blacklist.set(token, expiresAt);
      }
    } catch (error) {
      // If token can't be decoded, still add it with default expiration
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      this.blacklist.set(token, expiresAt);
    }
  }

  /**
   * Check if token is blacklisted
   */
  isBlacklisted(token: string): boolean {
    const expiresAt = this.blacklist.get(token);
    
    if (!expiresAt) {
      return false;
    }

    // If token has expired, remove it and return false
    if (expiresAt < Date.now()) {
      this.blacklist.delete(token);
      return false;
    }

    return true;
  }

  /**
   * Remove token from blacklist
   */
  removeFromBlacklist(token: string): void {
    this.blacklist.delete(token);
  }

  /**
   * Clean up expired tokens
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now();
    const tokensToRemove: string[] = [];

    this.blacklist.forEach((expiresAt, token) => {
      if (expiresAt < now) {
        tokensToRemove.push(token);
      }
    });

    tokensToRemove.forEach((token) => {
      this.blacklist.delete(token);
    });

    if (tokensToRemove.length > 0) {
      console.log(`Cleaned up ${tokensToRemove.length} expired blacklisted tokens`);
    }
  }

  /**
   * Get blacklist size (for monitoring)
   */
  getBlacklistSize(): number {
    return this.blacklist.size;
  }

  /**
   * Clear all blacklisted tokens (use with caution)
   */
  clearBlacklist(): void {
    this.blacklist.clear();
  }

  /**
   * Cleanup on module destroy
   */
  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}
