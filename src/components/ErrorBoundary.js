'use client';

import React from 'react';

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
            errorInfo,
        });

        // Log to error tracking service (e.g., Sentry)
        if (typeof window !== 'undefined' && window.Sentry) {
            window.Sentry.captureException(error, { extra: errorInfo });
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-boundary-content">
                        <div className="error-icon">⚠️</div>
                        <h1>عذراً، حدث خطأ غير متوقع</h1>
                        <p>نعتذر عن الإزعاج. يرجى تحديث الصفحة أو المحاولة لاحقاً.</p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="error-details">
                                <summary>تفاصيل الخطأ (Development Only)</summary>
                                <pre>{this.state.error.toString()}</pre>
                                {this.state.errorInfo && (
                                    <pre>{this.state.errorInfo.componentStack}</pre>
                                )}
                            </details>
                        )}

                        <div className="error-actions">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn btn-primary"
                            >
                                تحديث الصفحة
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="btn btn-secondary"
                            >
                                العودة للرئيسية
                            </button>
                        </div>
                    </div>

                    <style jsx>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 2rem;
              background: var(--bg-primary);
            }

            .error-boundary-content {
              max-width: 600px;
              text-align: center;
              padding: 3rem;
              background: var(--card-bg);
              border-radius: 12px;
              box-shadow: var(--shadow-lg);
            }

            .error-icon {
              font-size: 4rem;
              margin-bottom: 1.5rem;
            }

            .error-boundary-content h1 {
              font-size: 1.75rem;
              color: var(--text-primary);
              margin-bottom: 1rem;
            }

            .error-boundary-content p {
              font-size: 1rem;
              color: var(--text-secondary);
              margin-bottom: 2rem;
            }

            .error-details {
              text-align: right;
              margin: 2rem 0;
              padding: 1rem;
              background: var(--bg-secondary);
              border-radius: 8px;
              border: 1px solid var(--border-color);
            }

            .error-details summary {
              cursor: pointer;
              font-weight: 600;
              margin-bottom: 1rem;
              color: var(--error-color);
            }

            .error-details pre {
              white-space: pre-wrap;
              word-wrap: break-word;
              font-size: 0.875rem;
              color: var(--text-secondary);
              margin: 0.5rem 0;
            }

            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
            }

            .btn {
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              border: none;
              font-size: 1rem;
            }

            .btn-primary {
              background: var(--primary-color);
              color: white;
            }

            .btn-primary:hover {
              background: var(--primary-hover);
              transform: translateY(-2px);
            }

            .btn-secondary {
              background: var(--bg-secondary);
              color: var(--text-primary);
              border: 1px solid var(--border-color);
            }

            .btn-secondary:hover {
              background: var(--bg-tertiary);
              transform: translateY(-2px);
            }
          `}</style>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
