// Optional Sentry integration - only load if installed
let Sentry = null;
try {
    Sentry = require('@sentry/nextjs');
} catch (e) {
    console.log('ℹ️ Sentry not installed - monitoring will use console logging only');
}

// Enhanced Monitoring Configuration
export function initMonitoring() {
    if (process.env.NODE_ENV === 'production' && Sentry) {
        Sentry.init({
            dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
            environment: process.env.NODE_ENV,
            tracesSampleRate: 1.0,

            // Enhanced error filtering
            beforeSend(event, hint) {
                // Filter out known non-critical errors
                if (event.exception) {
                    const error = hint.originalException;

                    // Ignore network errors
                    if (error?.message?.includes('NetworkError')) {
                        return null;
                    }

                    // Ignore cancelled requests
                    if (error?.message?.includes('cancelled')) {
                        return null;
                    }
                }

                return event;
            },

            // Performance monitoring
            integrations: [
                new Sentry.BrowserTracing({
                    tracingOrigins: ['localhost', /^\//],
                }),
            ],

            // Error grouping
            beforeBreadcrumb(breadcrumb) {
                if (breadcrumb.category === 'console') {
                    return null; // Don't send console logs
                }
                return breadcrumb;
            },
        });

        console.log('✅ Sentry monitoring initialized');
    } else {
        console.log('ℹ️ Monitoring initialized (console mode)');
    }
}

// Alert thresholds
const ERROR_THRESHOLD = 10; // errors per minute
const ERROR_WINDOW = 60000; // 1 minute

let errorCount = 0;
let windowStart = Date.now();

export function trackError(error, context = {}) {
    // Count errors
    const now = Date.now();
    if (now - windowStart > ERROR_WINDOW) {
        errorCount = 0;
        windowStart = now;
    }

    errorCount++;

    // Alert if threshold exceeded
    if (errorCount > ERROR_THRESHOLD) {
        sendAlert({
            type: 'error_spike',
            message: `Error spike detected: ${errorCount} errors in last minute`,
            severity: 'critical',
        });
    }

    // Send to Sentry if available, otherwise log to console
    if (Sentry) {
        Sentry.captureException(error, {
            contexts: {
                custom: context,
            },
        });
    } else {
        console.error('Error tracked:', error, context);
    }
}

// Send alerts to Slack/Email
async function sendAlert(alert) {
    try {
        // Send to Slack
        if (process.env.SLACK_WEBHOOK_URL) {
            await fetch(process.env.SLACK_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: `🚨 ${alert.type.toUpperCase()}`,
                    blocks: [
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: `*${alert.message}*\nSeverity: ${alert.severity}`,
                            },
                        },
                    ],
                }),
            });
        }

        // Log to console
        console.error('🚨 ALERT:', alert);
    } catch (error) {
        console.error('Failed to send alert:', error);
    }
}

// Health check endpoint helper
export async function performHealthCheck() {
    const checks = {
        database: false,
        cache: false,
        api: false,
    };

    try {
        // Check database
        // checks.database = await checkDatabase();

        // Check cache
        // checks.cache = await checkCache();

        // Check API
        checks.api = true;

        const allHealthy = Object.values(checks).every(check => check === true);

        return {
            status: allHealthy ? 'healthy' : 'unhealthy',
            checks,
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        trackError(error, { context: 'health_check' });
        return {
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString(),
        };
    }
}
