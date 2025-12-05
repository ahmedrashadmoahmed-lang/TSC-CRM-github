/**
 * API Response Standardization
 * Consistent response format for all API endpoints
 */

/**
 * Success response format
 */
export const successResponse = (data, message = 'Success', metadata = {}) => ({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    ...metadata
});

/**
 * Error response format
 */
export const errorResponse = (error, statusCode = 500, metadata = {}) => ({
    success: false,
    error: {
        message: error.message || 'An error occurred',
        code: error.code || 'INTERNAL_ERROR',
        statusCode,
        details: error.details || null
    },
    timestamp: new Date().toISOString(),
    ...metadata
});

/**
 * Paginated response format
 */
export const paginatedResponse = (data, page, limit, total, metadata = {}) => {
    const totalPages = Math.ceil(total / limit);
    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);

    return {
        success: true,
        data,
        pagination: {
            page: currentPage,
            limit: itemsPerPage,
            total,
            totalPages,
            hasNextPage: currentPage < totalPages,
            hasPreviousPage: currentPage > 1,
            nextPage: currentPage < totalPages ? currentPage + 1 : null,
            previousPage: currentPage > 1 ? currentPage - 1 : null
        },
        timestamp: new Date().toISOString(),
        ...metadata
    };
};

/**
 * Created response format (201)
 */
export const createdResponse = (data, message = 'Resource created successfully', metadata = {}) => ({
    success: true,
    message,
    data,
    statusCode: 201,
    timestamp: new Date().toISOString(),
    ...metadata
});

/**
 * No content response (204)
 */
export const noContentResponse = () => ({
    success: true,
    statusCode: 204
});

/**
 * Batch operation response
 */
export const batchResponse = (results, metadata = {}) => {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return {
        success: failed.length === 0,
        message: `${successful.length} succeeded, ${failed.length} failed`,
        data: {
            successful: successful.length,
            failed: failed.length,
            total: results.length,
            results
        },
        timestamp: new Date().toISOString(),
        ...metadata
    };
};

/**
 * Validation error response
 */
export const validationErrorResponse = (errors) => ({
    success: false,
    error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: errors
    },
    timestamp: new Date().toISOString()
});

/**
 * Create Next.js response with standard format
 */
export const createResponse = (data, status = 200, headers = {}) => {
    const { NextResponse } = require('next/server');

    return NextResponse.json(data, {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    });
};

/**
 * Success response helper for Next.js
 */
export const sendSuccess = (data, message, status = 200) => {
    return createResponse(successResponse(data, message), status);
};

/**
 * Error response helper for Next.js
 */
export const sendError = (error, statusCode = 500) => {
    return createResponse(errorResponse(error, statusCode), statusCode);
};

/**
 * Paginated response helper for Next.js
 */
export const sendPaginated = (data, page, limit, total) => {
    return createResponse(paginatedResponse(data, page, limit, total), 200);
};

/**
 * Created response helper for Next.js
 */
export const sendCreated = (data, message) => {
    return createResponse(createdResponse(data, message), 201);
};

export default {
    successResponse,
    errorResponse,
    paginatedResponse,
    createdResponse,
    noContentResponse,
    batchResponse,
    validationErrorResponse,
    createResponse,
    sendSuccess,
    sendError,
    sendPaginated,
    sendCreated
};
