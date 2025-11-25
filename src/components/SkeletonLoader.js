import React from 'react';

export function SkeletonLoader({ type = 'card', count = 1, className = '' }) {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return <CardSkeleton />;
            case 'table':
                return <TableSkeleton />;
            case 'list':
                return <ListSkeleton />;
            case 'stat':
                return <StatSkeleton />;
            case 'chart':
                return <ChartSkeleton />;
            case 'form':
                return <FormSkeleton />;
            default:
                return <CardSkeleton />;
        }
    };

    return (
        <div className={`skeleton-container ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index}>{renderSkeleton()}</div>
            ))}

            <style jsx>{`
        .skeleton-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        :global(.skeleton) {
          background: linear-gradient(
            90deg,
            var(--bg-secondary) 0%,
            var(--bg-tertiary) 50%,
            var(--bg-secondary) 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
          border-radius: 8px;
        }

        :global(.skeleton-text) {
          height: 1rem;
          margin-bottom: 0.5rem;
        }

        :global(.skeleton-title) {
          height: 1.5rem;
          width: 60%;
          margin-bottom: 1rem;
        }

        :global(.skeleton-circle) {
          border-radius: 50%;
        }
      `}</style>
        </div>
    );
}

function CardSkeleton() {
    return (
        <div className="card-skeleton">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-text" style={{ width: '100%' }} />
            <div className="skeleton skeleton-text" style={{ width: '80%' }} />
            <div className="skeleton skeleton-text" style={{ width: '60%' }} />

            <style jsx>{`
        .card-skeleton {
          padding: 1.5rem;
          background: var(--card-bg);
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }
      `}</style>
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="table-skeleton">
            {/* Header */}
            <div className="table-header">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton skeleton-text" style={{ width: '100%' }} />
                ))}
            </div>

            {/* Rows */}
            {[1, 2, 3, 4, 5].map((row) => (
                <div key={row} className="table-row">
                    {[1, 2, 3, 4].map((col) => (
                        <div key={col} className="skeleton skeleton-text" style={{ width: '90%' }} />
                    ))}
                </div>
            ))}

            <style jsx>{`
        .table-skeleton {
          background: var(--card-bg);
          border-radius: 12px;
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }

        .table-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .table-row:last-child {
          border-bottom: none;
        }
      `}</style>
        </div>
    );
}

function ListSkeleton() {
    return (
        <div className="list-skeleton">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="list-item">
                    <div className="skeleton skeleton-circle" style={{ width: '48px', height: '48px' }} />
                    <div className="list-content">
                        <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                        <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                    </div>
                </div>
            ))}

            <style jsx>{`
        .list-skeleton {
          background: var(--card-bg);
          border-radius: 12px;
          overflow: hidden;
        }

        .list-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .list-item:last-child {
          border-bottom: none;
        }

        .list-content {
          flex: 1;
        }
      `}</style>
        </div>
    );
}

function StatSkeleton() {
    return (
        <div className="stat-skeleton">
            <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: '0.5rem' }} />
            <div className="skeleton" style={{ width: '60%', height: '2rem', marginBottom: '0.5rem' }} />
            <div className="skeleton skeleton-text" style={{ width: '50%' }} />

            <style jsx>{`
        .stat-skeleton {
          padding: 1.5rem;
          background: var(--card-bg);
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }
      `}</style>
        </div>
    );
}

function ChartSkeleton() {
    return (
        <div className="chart-skeleton">
            <div className="skeleton skeleton-title" style={{ marginBottom: '1.5rem' }} />
            <div className="chart-bars">
                {[80, 60, 90, 70, 85, 65, 75].map((height, i) => (
                    <div
                        key={i}
                        className="skeleton"
                        style={{ height: `${height}%`, width: '100%' }}
                    />
                ))}
            </div>

            <style jsx>{`
        .chart-skeleton {
          padding: 1.5rem;
          background: var(--card-bg);
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .chart-bars {
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;
          height: 200px;
        }
      `}</style>
        </div>
    );
}

function FormSkeleton() {
    return (
        <div className="form-skeleton">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="form-field">
                    <div className="skeleton skeleton-text" style={{ width: '30%', marginBottom: '0.5rem' }} />
                    <div className="skeleton" style={{ width: '100%', height: '2.5rem' }} />
                </div>
            ))}

            <div className="form-actions">
                <div className="skeleton" style={{ width: '100px', height: '2.5rem' }} />
                <div className="skeleton" style={{ width: '100px', height: '2.5rem' }} />
            </div>

            <style jsx>{`
        .form-skeleton {
          padding: 1.5rem;
          background: var(--card-bg);
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .form-field {
          margin-bottom: 1.5rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }
      `}</style>
        </div>
    );
}

export default SkeletonLoader;
