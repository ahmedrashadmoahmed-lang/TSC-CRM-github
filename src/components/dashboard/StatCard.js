'use client';

export default function StatCard({
    title,
    value,
    icon,
    trend = null,
    trendLabel = '',
    color = 'primary',
    loading = false,
}) {
    const colorClasses = {
        primary: 'stat-primary',
        success: 'stat-success',
        warning: 'stat-warning',
        error: 'stat-error',
        info: 'stat-info',
    };

    if (loading) {
        return (
            <div className="stat-card loading">
                <div className="skeleton skeleton-icon" />
                <div className="stat-content">
                    <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                    <div className="skeleton skeleton-value" />
                </div>

                <style jsx>{`
          .stat-card.loading {
            padding: 1.5rem;
            background: var(--card-bg);
            border-radius: 12px;
            border: 1px solid var(--border-color);
            display: flex;
            gap: 1rem;
          }

          .skeleton {
            background: linear-gradient(
              90deg,
              var(--bg-secondary) 0%,
              var(--bg-tertiary) 50%,
              var(--bg-secondary) 100%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 8px;
          }

          .skeleton-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
          }

          .stat-content {
            flex: 1;
          }

          .skeleton-text {
            height: 1rem;
            margin-bottom: 0.5rem;
          }

          .skeleton-value {
            height: 2rem;
            width: 80%;
          }

          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
        `}</style>
            </div>
        );
    }

    return (
        <div className={`stat-card ${colorClasses[color]}`}>
            <div className="stat-icon">{icon}</div>

            <div className="stat-content">
                <div className="stat-title">{title}</div>
                <div className="stat-value">{value}</div>

                {trend !== null && (
                    <div className={`stat-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
                        <span className="trend-icon">{trend >= 0 ? '↑' : '↓'}</span>
                        <span className="trend-value">{Math.abs(trend).toFixed(1)}%</span>
                        {trendLabel && <span className="trend-label">{trendLabel}</span>}
                    </div>
                )}
            </div>

            <style jsx>{`
        .stat-card {
          padding: 1.5rem;
          background: var(--card-bg);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          display: flex;
          gap: 1rem;
          transition: all 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .stat-primary .stat-icon {
          background: var(--primary-light);
          color: var(--primary-color);
        }

        .stat-success .stat-icon {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .stat-warning .stat-icon {
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
        }

        .stat-error .stat-icon {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .stat-info .stat-icon {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .stat-content {
          flex: 1;
        }

        .stat-title {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
        }

        .stat-trend.positive {
          color: #22c55e;
        }

        .stat-trend.negative {
          color: #ef4444;
        }

        .trend-icon {
          font-size: 1rem;
        }

        .trend-value {
          font-weight: 600;
        }

        .trend-label {
          color: var(--text-secondary);
          margin-right: 0.25rem;
        }

        @media (max-width: 768px) {
          .stat-card {
            padding: 1rem;
          }

          .stat-icon {
            width: 40px;
            height: 40px;
            font-size: 1.25rem;
          }

          .stat-value {
            font-size: 1.5rem;
          }
        }
      `}</style>
        </div>
    );
}
