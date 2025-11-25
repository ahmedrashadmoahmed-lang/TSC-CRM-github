export default function Badge({
    children,
    variant = 'default', // default, primary, success, warning, error, info
    size = 'medium', // small, medium, large
    rounded = false,
    className = '',
}) {
    const variantClasses = {
        default: 'badge-default',
        primary: 'badge-primary',
        success: 'badge-success',
        warning: 'badge-warning',
        error: 'badge-error',
        info: 'badge-info',
    };

    const sizeClasses = {
        small: 'badge-small',
        medium: 'badge-medium',
        large: 'badge-large',
    };

    return (
        <span
            className={`badge ${variantClasses[variant]} ${sizeClasses[size]} ${rounded ? 'badge-rounded' : ''
                } ${className}`}
        >
            {children}

            <style jsx>{`
        .badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          border-radius: 6px;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .badge-small {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
        }

        .badge-medium {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
        }

        .badge-large {
          padding: 0.5rem 1rem;
          font-size: 1rem;
        }

        .badge-rounded {
          border-radius: 999px;
        }

        .badge-default {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .badge-primary {
          background: var(--primary-light);
          color: var(--primary-color);
        }

        .badge-success {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .badge-warning {
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
        }

        .badge-error {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .badge-info {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }
      `}</style>
        </span>
    );
}
