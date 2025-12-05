// Client-Safe Logger
// Simple console-based logger that works everywhere

/**
 * Log levels
 */
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevel = LogLevel[process.env.LOG_LEVEL?.toUpperCase()] || LogLevel.INFO;

/**
 * Format timestamp
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Logger class
 */
class Logger {
  info(message, metadata = {}) {
    if (currentLevel <= LogLevel.INFO) {
      console.log(`[${getTimestamp()}] [INFO]:`, message, metadata);
    }
  }

  error(message, metadata = {}) {
    if (currentLevel <= LogLevel.ERROR) {
      console.error(`[${getTimestamp()}] [ERROR]:`, message, metadata);
    }
  }

  warn(message, metadata = {}) {
    if (currentLevel <= LogLevel.WARN) {
      console.warn(`[${getTimestamp()}] [WARN]:`, message, metadata);
    }
  }

  debug(message, metadata = {}) {
    if (currentLevel <= LogLevel.DEBUG) {
      console.debug(`[${getTimestamp()}] [DEBUG]:`, message, metadata);
    }
  }
}

const logger = new Logger();

/**
 * Log API request
 */
export function logRequest(req, res, duration) {
  logger.info('API Request', {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    duration: `${duration}ms`,
  });
}

/**
 * Log error
 */
export function logError(error, context = {}) {
  logger.error(error.message, {
    stack: error.stack,
    ...context,
  });
}

/**
 * Log user activity
 */
export function logActivity(userId, action, details = {}) {
  logger.info('User Activity', {
    userId,
    action,
    ...details,
  });
}

/**
 * Log database query
 */
export function logQuery(query, duration) {
  logger.debug('Database Query', {
    query,
    duration: `${duration}ms`,
  });
}

/**
 * Middleware for logging requests
 */
export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logRequest(req, res, duration);
  });

  next();
}

export default logger;
