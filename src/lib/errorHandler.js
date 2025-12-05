/**
 * Centralized Error Handler
 * Custom error classes and error handling utilities
 */

/**
 * Base API Error class
 */
export class APIError extends Error {
    constructor(message, statusCode = 500, details = null) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.details = details;
        this.timestamp = new Date().toISOString();

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            details: this.details,
            timestamp: this.timestamp
        };
    }
}

/**
 * Validation Error - 400
 */
export class ValidationError extends APIError {
    constructor(message, details = null) {
        super(message, 400, details);
        this.name = 'ValidationError';
    }
}

/**
 * Authentication Error - 401
 */
export class AuthenticationError extends APIError {
    constructor(message = 'Authentication required') {
        super(message, 401);
        this.name = 'AuthenticationError';
    }
}

/**
 * Authorization Error - 403
 */
export class AuthorizationError extends APIError {
    constructor(message = 'Access denied') {
        super(message, 403);
        this.name = 'AuthorizationError';
    }
}

/**
 * Not Found Error - 404
 */
export class NotFoundError extends APIError {
    constructor(resource = 'Resource', id = null) {
        const message = id ? `${resource} with ID '${id}' not found` : `${resource} not found`;
        super(message, 404);
        this.name = 'NotFoundError';
        this.resource = resource;
        this.resourceId = id;
    }
}

/**
 * Conflict Error - 409
 */
export class ConflictError extends APIError {
    constructor(message, details = null) {
        super(message, 409, details);
        this.name = 'ConflictError';
    }
}

/**
 * Database Error - 500
 */
export class DatabaseError extends APIError {
    constructor(message, originalError = null) {
        super(message, 500, originalError?.message);
        this.name = 'DatabaseError';
        this.originalError = originalError;
    }
}

/**
 * External Service Error - 502
 */
export class ExternalServiceError extends APIError {
    constructor(service, message = 'External service unavailable') {
        super(message, 502);
        this.name = 'ExternalServiceError';
        this.service = service;
    }
}

/**
 * Main error handler for API routes
 */
export const handleAPIError = (error, context = {}) => {
    // If it's already an APIError, use it as is
    if (error instanceof APIError) {
        return {
            success: false,
            error: {
                name: error.name,
                message: error.message,
                statusCode: error.statusCode,
                details: error.details,
                timestamp: error.timestamp,
                ...context
            }
        };
    }

    // Handle Prisma errors
    if (error.code?.startsWith('P')) {
        return handlePrismaError(error, context);
    }

    // Handle unexpected errors
    console.error('Unexpected error:', error);

    return {
        success: false,
        error: {
            name: 'InternalServerError',
            message: process.env.NODE_ENV === 'production'
                ? 'An unexpected error occurred'
                : error.message,
            statusCode: 500,
            timestamp: new Date().toISOString(),
            ...context
        }
    };
};

/**
 * Handle Prisma-specific errors
 */
const handlePrismaError = (error, context = {}) => {
    const errorMap = {
        'P2002': { message: 'A record with this value already exists', status: 409 },
        'P2025': { message: 'Record not found', status: 404 },
        'P2003': { message: 'Foreign key constraint failed', status: 400 },
        'P2014': { message: 'Invalid relation', status: 400 },
    };

    const mapped = errorMap[error.code] || {
        message: 'Database operation failed',
        status: 500
    };

    return {
        success: false,
        error: {
            name: 'DatabaseError',
            message: mapped.message,
            statusCode: mapped.status,
            details: process.env.NODE_ENV === 'development' ? error.meta : null,
            timestamp: new Date().toISOString(),
            ...context
        }
    };
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn) => {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            const errorResponse = handleAPIError(error);
            const { NextResponse } = await import('next/server');
            return NextResponse.json(
                errorResponse,
                { status: errorResponse.error.statusCode }
            );
        }
    };
};

/**
 * Validation helper
 */
export const validate = (schema, data) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
        const value = data[field];

        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push({ field, message: `${field} is required` });
        }

        if (rules.type && value !== undefined && typeof value !== rules.type) {
            errors.push({ field, message: `${field} must be of type ${rules.type}` });
        }

        if (rules.min && value < rules.min) {
            errors.push({ field, message: `${field} must be at least ${rules.min}` });
        }

        if (rules.max && value > rules.max) {
            errors.push({ field, message: `${field} must not exceed ${rules.max}` });
        }

        if (rules.pattern && !rules.pattern.test(value)) {
            errors.push({ field, message: `${field} format is invalid` });
        }
    }

    if (errors.length > 0) {
        throw new ValidationError('Validation failed', errors);
    }
};

export default {
    APIError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    DatabaseError,
    ExternalServiceError,
    handleAPIError,
    asyncHandler,
    validate
};
