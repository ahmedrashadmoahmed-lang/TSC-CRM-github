'use client';

export default function ProgressBar({
    value = 0,
    max = 100,
    label = '',
    showPercentage = true,
    color = 'primary',
    size = 'medium',
    animated = false,
}) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const colors = {
        primary: 'var(--primary-color)',
        success: '#22c55e',
        warning: '#fbbf24',
        error: '#ef4444',
        info: '#3b82f6',
    };

    const sizes = {
        small: '4px',
        medium: '8px',
        large: '12px',
    };

    return (
        <div className="progress-wrapper">
            {(label || showPercentage) && (
                <div className="progress-header">
                    {label && <span className="progress-label">{label}</span>}
                    {showPercentage && (
                        <span className="progress-percentage">{percentage.toFixed(0)}%</span>
                    )}
                </div>
            )}

            <div className="progress-bar">
                <div
                    className={`progress-fill ${animated ? 'animated' : ''}`}
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: colors[color],
                    }}
                />
            </div>

            <style jsx>{`
        .progress-wrapper {
          width: 100%;
        }

        .progress-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .progress-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .progress-percentage {
          font-size: 0.875rem;
          font-weight: 700;
          color: ${colors[color]};
        }

        .progress-bar {
          width: 100%;
          height: ${sizes[size]};
          background: var(--bg-secondary);
          border-radius: 999px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.3s ease;
        }

        .progress-fill.animated {
          background-image: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.2) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0.2) 75%,
            transparent 75%,
            transparent
          );
          background-size: 1rem 1rem;
          animation: progress-stripes 1s linear infinite;
        }

        @keyframes progress-stripes {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 1rem 0;
          }
        }
      `}</style>
        </div>
    );
}
