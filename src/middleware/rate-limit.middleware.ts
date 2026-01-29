import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import colors from 'colors';
import logger from '../utils/logger';

// In-memory storage for rate limiting (replace with Redis in production if needed)
const rateLimitStore = new Map<string, {
  count: number;
  resetTime: number;
  windowMs: number;
  max: number;
}>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}

export const createRateLimiter = (config: RateLimitConfig) => {
  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later.',
    standardHeaders = true,
    legacyHeaders = false,
  } = config;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = req.ip || req.connection.remoteAddress || 'unknown';
      const key = `ratelimit:${identifier}`;

      const now = Date.now();
      const existing = rateLimitStore.get(key);

      if (!existing || now > existing.resetTime) {
        // New window or expired window
        rateLimitStore.set(key, {
          count: 1,
          resetTime: now + windowMs,
          windowMs,
          max,
        });
        return next();
      }

      // Increment counter
      existing.count++;

      if (existing.count > max) {
        // Rate limit exceeded
        const resetTime = Math.ceil((existing.resetTime - now) / 1000);

        if (standardHeaders) {
          res.set('RateLimit-Limit', max.toString());
          res.set('RateLimit-Remaining', '0');
          res.set('RateLimit-Reset', resetTime.toString());
        }

        if (legacyHeaders) {
          res.set('X-RateLimit-Limit', max.toString());
          res.set('X-RateLimit-Remaining', '0');
          res.set('X-RateLimit-Reset', resetTime.toString());
        }

        logger.warn(colors.yellow(`🚫 Rate limit exceeded for ${identifier}: ${existing.count}/${max}`));

        return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
          success: false,
          message,
          retryAfter: resetTime,
        });
      }

      // Update remaining requests
      const remaining = Math.max(0, max - existing.count);

      if (standardHeaders) {
        res.set('RateLimit-Limit', max.toString());
        res.set('RateLimit-Remaining', remaining.toString());
        res.set('RateLimit-Reset', Math.ceil((existing.resetTime - now) / 1000).toString());
      }

      if (legacyHeaders) {
        res.set('X-RateLimit-Limit', max.toString());
        res.set('X-RateLimit-Remaining', remaining.toString());
        res.set('X-RateLimit-Reset', Math.ceil((existing.resetTime - now) / 1000).toString());
      }

      next();
    } catch (error: any) {
      logger.error(colors.red('❌ Rate limiter error:'), error);
      next(); // Allow request if rate limiter fails
    }
  };
};

// Predefined rate limiters
export const generalApiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});

export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again after 15 minutes.',
});

export const passwordResetRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset attempts per hour
  message: 'Too many password reset attempts, please try again after 1 hour.',
});

export const registrationRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 registration attempts per hour
  message: 'Too many registration attempts, please try again after 1 hour.',
});

// Utility functions
export const resetRateLimit = async (identifier: string): Promise<void> => {
  try {
    const key = `ratelimit:${identifier}`;
    rateLimitStore.delete(key);
    logger.info(colors.blue(`🔄 Rate limit reset: ${key}`));
  } catch (error: any) {
    logger.error(colors.red('❌ Failed to reset rate limit:'), error);
  }
};

export const getRateLimitStatus = async (identifier: string): Promise<{
  currentRequests: number;
  remainingRequests: number;
  resetTime: number | null;
} | null> => {
  try {
    const key = `ratelimit:${identifier}`;
    const data = rateLimitStore.get(key);

    if (!data) {
      return null;
    }

    const now = Date.now();
    const remaining = Math.max(0, data.max - data.count);
    const resetTime = now > data.resetTime ? null : data.resetTime;

    return {
      currentRequests: data.count,
      remainingRequests: remaining,
      resetTime,
    };
  } catch (error: any) {
    logger.error(colors.red('❌ Failed to get rate limit status:'), error);
    return null;
  }
};

// Cleanup function to remove expired entries (call this periodically)
export const cleanupExpiredRateLimits = (): void => {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logger.info(colors.blue(`🧹 Cleaned up ${cleaned} expired rate limit entries`));
  }
};

// Auto-cleanup every 5 minutes
setInterval(cleanupExpiredRateLimits, 5 * 60 * 1000);
