/**
 * Security Headers Middleware
 * Adds security headers to all responses
 */

/**
 * Security headers configuration
 */
export const securityHeaders = [
    // Prevent clickjacking attacks
    {
        key: 'X-Frame-Options',
        value: 'DENY',
    },
    // Prevent MIME type sniffing
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
    },
    // Enable XSS protection
    {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
    },
    // Referrer policy
    {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
    },
    // Permissions policy
    {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
    },
];

/**
 * Content Security Policy
 * Adjust based on your needs
 */
export const contentSecurityPolicy = {
    key: 'Content-Security-Policy',
    value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval and unsafe-inline
        "style-src 'self' 'unsafe-inline'", // CSS modules require unsafe-inline
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://generativelanguage.googleapis.com", // For Google Gemini API
        "frame-ancestors 'none'",
    ].join('; '),
};

/**
 * Strict Transport Security (HSTS)
 * Only enable in production with HTTPS
 */
export const strictTransportSecurity = {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
};

/**
 * Get all security headers
 * @param {boolean} includeHSTS - Include HSTS header (only for production HTTPS)
 */
export function getSecurityHeaders(includeHSTS = false) {
    const headers = [...securityHeaders, contentSecurityPolicy];

    if (includeHSTS && process.env.NODE_ENV === 'production') {
        headers.push(strictTransportSecurity);
    }

    return headers;
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response, includeHSTS = false) {
    const headers = getSecurityHeaders(includeHSTS);

    headers.forEach(({ key, value }) => {
        response.headers.set(key, value);
    });

    return response;
}
