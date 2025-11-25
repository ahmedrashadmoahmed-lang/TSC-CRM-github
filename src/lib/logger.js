/**
 * Winston Logger Configuration
 * Centralized logging for the application
 */

import winston from 'winston';
import path from 'path';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    // Add metadata if present
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }

    // Add stack trace for errors
    if (stack) {
        msg += `\n${stack}`;
    }

    return msg;
});

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

// Logger configuration
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    defaultMeta: { service: 'erp-system' },
    transports: [
        // Error logs
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),

        // Combined logs
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),

        // Separate file for warnings
        new winston.transports.File({
            filename: path.join(logsDir, 'warnings.log'),
            level: 'warn',
            maxsize: 5242880, // 5MB
            maxFiles: 3,
        }),
    ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: combine(
                colorize(),
                timestamp({ format: 'HH:mm:ss' }),
                logFormat
            ),
        })
    );
}

/**
 * Log levels:
 * - error: Error messages
 * - warn: Warning messages
 * - info: Informational messages
 * - debug: Debug messages
 */

export default logger;

/**
 * Helper functions for common logging scenarios
 */

export function logError(error, context = {}) {
    logger.error(error.message, {
        error: error.name,
        stack: error.stack,
        ...context,
    });
}

export function logApiRequest(req, duration) {
    logger.info('API Request', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        userAgent: req.headers.get('user-agent'),
    });
}

export function logDatabaseQuery(query, duration) {
    logger.debug('Database Query', {
        query,
        duration: `${duration}ms`,
    });
}

export function logAuth(action, userId, success = true) {
    logger.info('Authentication', {
        action,
        userId,
        success,
    });
}

export function logSecurity(event, details = {}) {
    logger.warn('Security Event', {
        event,
        ...details,
    });
}
