import { NextResponse } from 'next/server';

/**
 * Rate Limiter using in-memory store
 * For production, use Redis or similar
 */
class RateLimiter {
    constructor() {
        this.requests = new Map();
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Cleanup every minute
    }

    /**
     * Check if request should be rate limited
     * @param {string} identifier - IP address or user ID
     * @param {number} maxRequests - Maximum requests allowed
     * @param {number} windowMs - Time window in milliseconds
     * @returns {boolean} - True if rate limit exceeded
     */
    isRateLimited(identifier, maxRequests = 100, windowMs = 15 * 60 * 1000) {
        const now = Date.now();
        const windowStart = now - windowMs;

        // Get or create request log for this identifier
        if (!this.requests.has(identifier)) {
            this.requests.set(identifier, []);
        }

        const requestLog = this.requests.get(identifier);

        // Remove old requests outside the window
        const recentRequests = requestLog.filter(timestamp => timestamp > windowStart);
        this.requests.set(identifier, recentRequests);

        // Check if limit exceeded
        if (recentRequests.length >= maxRequests) {
            return true;
        }

        // Add current request
        recentRequests.push(now);
        this.requests.set(identifier, recentRequests);

        return false;
    }

    /**
     * Get remaining requests for identifier
     */
    getRemaining(identifier, maxRequests = 100, windowMs = 15 * 60 * 1000) {
        const now = Date.now();
        const windowStart = now - windowMs;

        if (!this.requests.has(identifier)) {
            return maxRequests;
        }

        const requestLog = this.requests.get(identifier);
        const recentRequests = requestLog.filter(timestamp => timestamp > windowStart);

        return Math.max(0, maxRequests - recentRequests.length);
    }

    /**
     * Get reset time for identifier
     */
    getResetTime(identifier, windowMs = 15 * 60 * 1000) {
        if (!this.requests.has(identifier)) {
            return Date.now() + windowMs;
        }

        const requestLog = this.requests.get(identifier);
        if (requestLog.length === 0) {
            return Date.now() + windowMs;
        }

        return requestLog[0] + windowMs;
    }

    /**
     * Cleanup old entries
     */
    cleanup() {
        const now = Date.now();
        const maxAge = 60 * 60 * 1000; // 1 hour

        for (const [identifier, requestLog] of this.requests.entries()) {
            const recentRequests = requestLog.filter(timestamp => timestamp > now - maxAge);

            if (recentRequests.length === 0) {
                this.requests.delete(identifier);
            } else {
                this.requests.set(identifier, recentRequests);
            }
        }
    }

    /**
     * Clear all rate limit data
     */
    clear() {
        this.requests.clear();
    }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Rate limiting middleware for API routes
 * @param {Object} options - Configuration options
 * @param {number} options.maxRequests - Maximum requests allowed (default: 100)
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 minutes)
 * @param {string} options.message - Custom error message
 */
export function rateLimit(options = {}) {
    const {
        maxRequests = 100,
        windowMs = 15 * 60 * 1000, // 15 minutes
        message = 'Too many requests, please try again later',
    } = options;

    return (handler) => {
        return async (req, context) => {
            try {
                // Get identifier (IP address or user ID)
                const forwarded = req.headers.get('x-forwarded-for');
                const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';

                // Use IP as identifier (in production, consider using user ID for authenticated requests)
                const identifier = ip;

                // Check rate limit
                if (rateLimiter.isRateLimited(identifier, maxRequests, windowMs)) {
                    const resetTime = rateLimiter.getResetTime(identifier, windowMs);
                    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

                    return NextResponse.json(
                        {
                            error: message,
                            retryAfter,
                            limit: maxRequests,
                            window: windowMs / 1000,
                        },
                        {
                            status: 429,
                            headers: {
                                'Retry-After': retryAfter.toString(),
                                'X-RateLimit-Limit': maxRequests.toString(),
                                'X-RateLimit-Remaining': '0',
                                'X-RateLimit-Reset': resetTime.toString(),
                            }
                        }
                    );
                }

                // Get remaining requests
                const remaining = rateLimiter.getRemaining(identifier, maxRequests, windowMs);
                const resetTime = rateLimiter.getResetTime(identifier, windowMs);

                // Execute handler
                const response = await handler(req, context);

                // Add rate limit headers to response
                if (response instanceof NextResponse) {
                    response.headers.set('X-RateLimit-Limit', maxRequests.toString());
                    response.headers.set('X-RateLimit-Remaining', remaining.toString());
                    response.headers.set('X-RateLimit-Reset', resetTime.toString());
                }

                return response;
            } catch (error) {
                console.error('Rate limit middleware error:', error);
                return handler(req, context);
            }
        };
    };
}

/**
 * Strict rate limit for sensitive endpoints (e.g., login, signup)
 */
export function strictRateLimit(handler) {
    return rateLimit({
        maxRequests: 5,
        windowMs: 15 * 60 * 1000, // 15 minutes
        message: 'Too many attempts, please try again in 15 minutes',
    })(handler);
}

/**
 * Moderate rate limit for API endpoints
 */
export function moderateRateLimit(handler) {
    return rateLimit({
        maxRequests: 100,
        windowMs: 15 * 60 * 1000, // 15 minutes
    })(handler);
}

/**
 * Generous rate limit for public endpoints
 */
export function generousRateLimit(handler) {
    return rateLimit({
        maxRequests: 1000,
        windowMs: 15 * 60 * 1000, // 15 minutes
    })(handler);
}

export { rateLimiter };
