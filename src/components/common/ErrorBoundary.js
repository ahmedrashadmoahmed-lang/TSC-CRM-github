'use client';

import React from 'react';
import styles from './ErrorBoundary.module.css';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });

        // Log to monitoring service
        if (typeof window !== 'undefined' && window.Sentry) {
            window.Sentry.captureException(error, { extra: errorInfo });
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleGoHome = () => {
        window.location.href = '/dashboard';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className={styles.errorContainer}>
                    <div className={styles.errorCard}>
                        <div className={styles.iconContainer}>
                            <AlertTriangle size={48} />
                        </div>

                        <h1 className={styles.title}>عذراً، حدث خطأ</h1>
                        <p className={styles.message}>
                            {this.props.fallbackMessage || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'}
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className={styles.errorDetails}>
                                <summary>تفاصيل الخطأ (Development Only)</summary>
                                <pre className={styles.errorStack}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className={styles.actions}>
                            <button
                                onClick={this.handleReset}
                                className={styles.primaryButton}
                            >
                                <RefreshCw size={18} />
                                إعادة المحاولة
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className={styles.secondaryButton}
                            >
                                <Home size={18} />
                                العودة للرئيسية
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

// Functional wrapper for easier use
export function withErrorBoundary(Component, fallbackMessage) {
    return function WrappedComponent(props) {
        return (
            <ErrorBoundary fallbackMessage={fallbackMessage}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
}
