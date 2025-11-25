/**
 * Error Logging Service
 * Centralized error logging and reporting
 */

class ErrorLogger {
    constructor() {
        this.isProduction = process.env.NODE_ENV === 'production';
        this.isDevelopment = process.env.NODE_ENV === 'development';
    }

    /**
     * Log error to console and external service
     */
    logError(error, context = {}) {
        const errorData = {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            context,
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
            url: typeof window !== 'undefined' ? window.location.href : context.url,
        };

        // Always log to console in development
        if (this.isDevelopment) {
            console.error('Error logged:', errorData);
        }

        // Log to external service in production
        if (this.isProduction) {
            this.sendToExternalService(errorData);
        }

        // Log to database if available
        this.logToDatabase(errorData);

        return errorData;
    }

    /**
     * Log API error
     */
    logApiError(error, request = {}) {
        return this.logError(error, {
            type: 'API_ERROR',
            method: request.method,
            url: request.url,
            headers: request.headers,
            body: request.body,
        });
    }

    /**
     * Log client error
     */
    logClientError(error, componentStack = null) {
        return this.logError(error, {
            type: 'CLIENT_ERROR',
            componentStack,
        });
    }

    /**
     * Log authentication error
     */
    logAuthError(error, userId = null) {
        return this.logError(error, {
            type: 'AUTH_ERROR',
            userId,
        });
    }

    /**
     * Send error to external monitoring service
     * TODO: Integrate with Sentry, LogRocket, or similar
     */
    async sendToExternalService(errorData) {
        try {
            // Example: Sentry integration
            // if (typeof window !== 'undefined' && window.Sentry) {
            //   window.Sentry.captureException(new Error(errorData.message), {
            //     extra: errorData.context,
            //   });
            // }

            // For now, just log that we would send it
            console.log('Would send to external service:', errorData);
        } catch (err) {
            console.error('Failed to send error to external service:', err);
        }
    }

    /**
     * Log error to database
     */
    async logToDatabase(errorData) {
        try {
            // Only log to database on server side
            if (typeof window === 'undefined') {
                // TODO: Implement database logging
                // await prisma.errorLog.create({
                //   data: {
                //     message: errorData.message,
                //     stack: errorData.stack,
                //     context: errorData.context,
                //     timestamp: errorData.timestamp,
                //   },
                // });
            }
        } catch (err) {
            console.error('Failed to log error to database:', err);
        }
    }

    /**
     * Create error report
     */
    createErrorReport(error, context = {}) {
        return {
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
            },
            context,
            environment: {
                nodeEnv: process.env.NODE_ENV,
                platform: typeof window !== 'undefined' ? 'client' : 'server',
            },
        };
    }

    /**
     * Generate unique error ID
     */
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Singleton instance
const errorLogger = new ErrorLogger();

export default errorLogger;

/**
 * Helper function to log errors
 */
export function logError(error, context) {
    return errorLogger.logError(error, context);
}

/**
 * Helper function to log API errors
 */
export function logApiError(error, request) {
    return errorLogger.logApiError(error, request);
}

/**
 * Helper function to log client errors
 */
export function logClientError(error, componentStack) {
    return errorLogger.logClientError(error, componentStack);
}

/**
 * Helper function to log auth errors
 */
export function logAuthError(error, userId) {
    return errorLogger.logAuthError(error, userId);
}
