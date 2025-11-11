import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

@Injectable()
export class AuthRateLimitMiddleware implements NestMiddleware {
  private limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs for auth endpoints
    message: {
      statusCode: 429,
      message: 'Too many authentication attempts, please try again later.',
      error: 'Too Many Requests',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
  });

  use(req: Request, res: Response, next: NextFunction) {
    this.limiter(req, res, next);
  }
}

