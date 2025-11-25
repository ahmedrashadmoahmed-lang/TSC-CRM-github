/**
 * API Error Handler Utility
 * Standardized error handling for API routes
 */

import { NextResponse } from 'next/server';
import { logApiError } from '@/services/ErrorLogService';

/**
 * Standard error response format
 */
export class ApiError extends Error {
    constructor(message, statusCode = 500, code = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'ApiError';
    }
}

/**
 * Common API errors
 */
export const ApiErrors = {
    UNAUTHORIZED: new ApiError('Unauthorized', 401, 'UNAUTHORIZED'),
    FORBIDDEN: new ApiError('Forbidden', 403, 'FORBIDDEN'),
    NOT_FOUND: new ApiError('Resource not found', 404, 'NOT_FOUND'),
    VALIDATION_ERROR: new ApiError('Validation error', 400, 'VALIDATION_ERROR'),
    INTERNAL_ERROR: new ApiError('Internal server error', 500, 'INTERNAL_ERROR'),
    RATE_LIMIT: new ApiError('Too many requests', 429, 'RATE_LIMIT'),
    CONFLICT: new ApiError('Resource conflict', 409, 'CONFLICT'),
};

/**
 * Handle API errors and return standardized response
 */
export function handleApiError(error, req = null) {
    // Log the error
    if (req) {
        logApiError(error, {
            method: req.method,
            url: req.url,
        });
    }

    // Determine status code
    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';

    if (error instanceof ApiError) {
        statusCode = error.statusCode;
        errorCode = error.code || errorCode;
        message = error.message;
    } else if (error.name === 'PrismaClientKnownRequestError') {
        // Handle Prisma errors
        statusCode = 400;
        errorCode = 'DATABASE_ERROR';
        message = getPrismaErrorMessage(error);
    } else if (error.name === 'ZodError') {
        // Handle Zod validation errors
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
        message = 'Validation failed';
    }

    // Create error response
    const errorResponse = {
        error: message,
        code: errorCode,
        timestamp: new Date().toISOString(),
    };

    // Add validation details for Zod errors
    if (error.name === 'ZodError') {
        errorResponse.details = error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
        }));
    }

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = error.stack;
    }

    return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Get user-friendly message for Prisma errors
 */
function getPrismaErrorMessage(error) {
    switch (error.code) {
        case 'P2002':
            return 'A record with this value already exists';
        case 'P2025':
            return 'Record not found';
        case 'P2003':
            return 'Foreign key constraint failed';
        case 'P2014':
            return 'Invalid relation';
        default:
            return 'Database operation failed';
    }
}

/**
 * Async error handler wrapper for API routes
 */
export function withErrorHandler(handler) {
    return async (req, context) => {
        try {
            return await handler(req, context);
        } catch (error) {
            return handleApiError(error, req);
        }
    };
}

/**
 * Validate request body with Zod schema
 */
export async function validateRequest(req, schema) {
    try {
        const body = await req.json();
        const validated = schema.parse(body);
        return { success: true, data: validated };
    } catch (error) {
        if (error.name === 'ZodError') {
            return {
                success: false,
                error: {
                    message: 'Validation failed',
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message,
                    })),
                },
            };
        }
        throw error;
    }
}

/**
 * Success response helper
 */
export function successResponse(data, statusCode = 200) {
    return NextResponse.json({
        success: true,
        data,
        timestamp: new Date().toISOString(),
    }, { status: statusCode });
}

/**
 * Pagination response helper
 */
export function paginatedResponse(data, pagination) {
    return NextResponse.json({
        success: true,
        data,
        pagination: {
            page: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            totalPages: pagination.totalPages,
        },
        timestamp: new Date().toISOString(),
    });
}
