'use client';

export default function EmptyState({
    icon = '📭',
    title = 'لا توجد بيانات',
    description = '',
    action,
    actionLabel = '',
    size = 'medium',
}) {
    const sizes = {
        small: {
            padding: '2rem',
            iconSize: '2rem',
            titleSize: '1rem',
        },
        medium: {
            padding: '3rem',
            iconSize: '3rem',
            titleSize: '1.25rem',
        },
        large: {
            padding: '4rem',
            iconSize: '4rem',
            titleSize: '1.5rem',
        },
    };

    return (
        <div className="empty-state">
            <div className="empty-icon">{icon}</div>
            <h3 className="empty-title">{title}</h3>
            {description && <p className="empty-description">{description}</p>}
            {action && actionLabel && (
                <button onClick={action} className="empty-action">
                    {actionLabel}
                </button>
            )}

            <style jsx>{`
        .empty-state {
          text-align: center;
          padding: ${sizes[size].padding};
        }

        .empty-icon {
          font-size: ${sizes[size].iconSize};
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-title {
          font-size: ${sizes[size].titleSize};
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }

        .empty-description {
          color: var(--text-secondary);
          margin: 0 0 1.5rem 0;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .empty-action {
          padding: 0.75rem 1.5rem;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .empty-action:hover {
          background: var(--primary-hover);
          transform: translateY(-2px);
        }
      `}</style>
        </div>
    );
}
