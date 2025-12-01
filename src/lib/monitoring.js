// Monitoring Configuration - Works with or without Sentry
// If @sentry/nextjs is not installed, only console logging will be used

let SentryModule = null;

// Check if Sentry is available at module load time
async function loadSentry() {
    if (SentryModule !== null) return SentryModule;
    
    // Only try to load Sentry if the DSN is configured
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
        console.log('ℹ️ Sentry DSN not configured - using console logging only');
        SentryModule = false;
        return SentryModule;
    }
    
    try {
        // Dynamic import - wrapped in try-catch for when module doesn't exist
        SentryModule = await import(/* webpackIgnore: true */ '@sentry/nextjs').catch(() => null);
        if (!SentryModule) {
            console.log('ℹ️ Sentry not installed - monitoring will use console logging only');
            SentryModule = false;
        }
    } catch (e) {
        console.log('ℹ️ Sentry not installed - monitoring will use console logging only');
        SentryModule = false;
    }
    return SentryModule;
}

// Enhanced Monitoring Configuration
export async function initMonitoring() {
    const Sentry = await loadSentry();
    
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

export async function trackError(error, context = {}) {
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
    const Sentry = await loadSentry();
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
