/**
 * Rate limiting middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimitCheck } from '@/lib/cache/redis';
import { RateLimitError, formatErrorResponse } from '@/lib/errors/http';

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
  message?: string;
}

export const RATE_LIMITS = {
  // Authentication endpoints
  LOGIN: { maxRequests: 5, windowSeconds: 60 * 15 }, // 5 per 15 min
  REGISTER: { maxRequests: 3, windowSeconds: 60 * 60 }, // 3 per hour
  PASSWORD_RESET: { maxRequests: 3, windowSeconds: 60 * 60 }, // 3 per hour

  // AI endpoints
  CHAT: { maxRequests: 20, windowSeconds: 60 }, // 20 per minute
  EXAM_ANALYSIS: { maxRequests: 5, windowSeconds: 60 * 60 }, // 5 per hour
  VOICE_TRANSCRIPTION: { maxRequests: 10, windowSeconds: 60 }, // 10 per minute

  // General API
  API_DEFAULT: { maxRequests: 60, windowSeconds: 60 }, // 60 per minute
} as const;

/**
 * Check rate limit for a user action
 */
export async function checkRateLimit(
  userId: string,
  action: string,
  config: RateLimitConfig
): Promise<void> {
  const result = await rateLimitCheck(
    userId,
    action,
    config.maxRequests,
    config.windowSeconds
  );

  if (!result.allowed) {
    throw new RateLimitError(
      config.message || 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
      config.windowSeconds
    );
  }
}

/**
 * Rate limit middleware factory
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Extract user ID from request (requires auth middleware first)
      const userId = req.headers.get('x-user-id');
      if (!userId) {
        // No user ID, skip rate limiting (should be caught by auth middleware)
        return handler(req);
      }

      // Check rate limit
      await checkRateLimit(userId, req.nextUrl.pathname, config);

      // Proceed with handler
      const response = await handler(req);

      // Add rate limit headers to response
      const result = await rateLimitCheck(
        userId,
        req.nextUrl.pathname,
        config.maxRequests,
        config.windowSeconds
      );

      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set(
        'X-RateLimit-Reset',
        new Date(Date.now() + config.windowSeconds * 1000).toISOString()
      );

      return response;
    } catch (error) {
      if (error instanceof RateLimitError) {
        return NextResponse.json(formatErrorResponse(error), {
          status: error.statusCode,
          headers: {
            'Retry-After': error.details?.retryAfter
              ? error.details.retryAfter.toString()
              : config.windowSeconds.toString(),
          },
        });
      }
      throw error;
    }
  };
}

/**
 * IP-based rate limiting for unauthenticated endpoints
 */
export async function checkIPRateLimit(
  ip: string,
  action: string,
  config: RateLimitConfig
): Promise<void> {
  const result = await rateLimitCheck(
    `ip:${ip}`,
    action,
    config.maxRequests,
    config.windowSeconds
  );

  if (!result.allowed) {
    throw new RateLimitError(
      config.message || 'Demasiadas solicitudes desde esta dirección IP.',
      config.windowSeconds
    );
  }
}
