'use client';

import { useState } from 'react';

export default function SimpleBarChart({
    data = [],
    xKey = 'label',
    yKey = 'value',
    color = 'var(--primary-color)',
    height = 300,
    showValues = false,
    formatValue = (value) => value,
}) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    if (!data || data.length === 0) {
        return (
            <div className="empty-chart">
                <p>لا توجد بيانات لعرضها</p>

                <style jsx>{`
          .empty-chart {
            height: ${height}px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
          }
        `}</style>
            </div>
        );
    }

    const maxValue = Math.max(...data.map((item) => item[yKey]));
    const minValue = Math.min(...data.map((item) => item[yKey]));
    const range = maxValue - minValue;

    return (
        <div className="bar-chart">
            <div className="chart-container">
                {data.map((item, index) => {
                    const value = item[yKey];
                    const barHeight = range > 0 ? ((value - minValue) / range) * 100 : 50;
                    const isHovered = hoveredIndex === index;

                    return (
                        <div
                            key={index}
                            className="bar-wrapper"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div className="bar-container">
                                {isHovered && (
                                    <div className="tooltip">
                                        <div className="tooltip-label">{item[xKey]}</div>
                                        <div className="tooltip-value">{formatValue(value)}</div>
                                    </div>
                                )}

                                <div
                                    className="bar"
                                    style={{
                                        height: `${barHeight}%`,
                                        backgroundColor: isHovered ? color : `${color}cc`,
                                    }}
                                >
                                    {showValues && (
                                        <div className="bar-value">{formatValue(value)}</div>
                                    )}
                                </div>
                            </div>

                            <div className="bar-label">{item[xKey]}</div>
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
        .bar-chart {
          width: 100%;
        }

        .chart-container {
          display: flex;
          align-items: flex-end;
          gap: 0.75rem;
          height: ${height}px;
          padding-bottom: 2rem;
        }

        .bar-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .bar-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: flex-end;
        }

        .bar {
          width: 100%;
          border-radius: 4px 4px 0 0;
          transition: all 0.3s;
          position: relative;
          cursor: pointer;
          min-height: 4px;
        }

        .bar:hover {
          transform: translateY(-4px);
          filter: brightness(1.1);
        }

        .bar-value {
          position: absolute;
          top: -1.5rem;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .bar-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-align: center;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          box-shadow: var(--shadow-lg);
          z-index: 10;
          white-space: nowrap;
          margin-bottom: 0.5rem;
          animation: fadeIn 0.2s;
        }

        .tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: var(--border-color);
        }

        .tooltip-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }

        .tooltip-value {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @media (max-width: 768px) {
          .chart-container {
            gap: 0.5rem;
          }

          .bar-label {
            font-size: 0.625rem;
          }
        }
      `}</style>
        </div>
    );
}
