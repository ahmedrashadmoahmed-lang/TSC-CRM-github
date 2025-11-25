'use client';

export default function ChartCard({
    title,
    subtitle = '',
    children,
    actions = null,
    loading = false,
}) {
    if (loading) {
        return (
            <div className="chart-card">
                <div className="chart-header">
                    <div className="skeleton skeleton-title" />
                </div>
                <div className="chart-body">
                    <div className="chart-skeleton">
                        {[80, 60, 90, 70, 85, 65, 75, 95, 55, 80].map((height, i) => (
                            <div
                                key={i}
                                className="skeleton bar"
                                style={{ height: `${height}%` }}
                            />
                        ))}
                    </div>
                </div>

                <style jsx>{`
          .chart-card {
            background: var(--card-bg);
            border-radius: 12px;
            border: 1px solid var(--border-color);
            overflow: hidden;
          }

          .chart-header {
            padding: 1.5rem;
            border-bottom: 1px solid var(--border-color);
          }

          .chart-body {
            padding: 1.5rem;
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

          .skeleton-title {
            height: 1.5rem;
            width: 40%;
          }

          .chart-skeleton {
            display: flex;
            align-items: flex-end;
            gap: 0.5rem;
            height: 200px;
          }

          .chart-skeleton .bar {
            flex: 1;
            border-radius: 4px 4px 0 0;
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
        <div className="chart-card">
            <div className="chart-header">
                <div className="chart-title-section">
                    <h3 className="chart-title">{title}</h3>
                    {subtitle && <p className="chart-subtitle">{subtitle}</p>}
                </div>
                {actions && <div className="chart-actions">{actions}</div>}
            </div>

            <div className="chart-body">{children}</div>

            <style jsx>{`
        .chart-card {
          background: var(--card-bg);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          overflow: hidden;
          transition: all 0.3s;
        }

        .chart-card:hover {
          box-shadow: var(--shadow-md);
        }

        .chart-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .chart-title-section {
          flex: 1;
        }

        .chart-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }

        .chart-subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .chart-actions {
          display: flex;
          gap: 0.5rem;
        }

        .chart-body {
          padding: 1.5rem;
        }

        @media (max-width: 768px) {
          .chart-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .chart-actions {
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
}
