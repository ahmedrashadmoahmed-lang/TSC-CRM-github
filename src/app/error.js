'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from './error.module.css';

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log error to error reporting service
        console.error('Application error:', error);

        // TODO: Send to error monitoring service (e.g., Sentry)
        // logErrorToService(error);
    }, [error]);

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.icon}>⚠️</div>
                <h1 className={styles.title}>Something went wrong!</h1>
                <p className={styles.message}>
                    We&apos;re sorry, but something unexpected happened. Our team has been notified and we&apos;re working on it.
                </p>

                {process.env.NODE_ENV === 'development' && (
                    <details className={styles.errorDetails}>
                        <summary>Error Details (Development Only)</summary>
                        <pre className={styles.errorStack}>
                            {error.message}
                            {'\n\n'}
                            {error.stack}
                        </pre>
                    </details>
                )}

                <div className={styles.actions}>
                    <button
                        onClick={reset}
                        className={styles.primaryButton}
                    >
                        Try Again
                    </button>
                    <Link href="/" className={styles.secondaryButton}>
                        Go to Dashboard
                    </Link>
                </div>

                <div className={styles.help}>
                    <p>If this problem persists, please contact support:</p>
                    <a href="mailto:support@example.com">support@example.com</a>
                </div>
            </div>
        </div>
    );
}
