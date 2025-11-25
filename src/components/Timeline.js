'use client';

import { useState } from 'react';

export default function Timeline({ items = [], variant = 'default' }) {
    const [expandedItems, setExpandedItems] = useState([]);

    const toggleItem = (id) => {
        setExpandedItems((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const getStatusColor = (status) => {
        const colors = {
            completed: '#22c55e',
            pending: '#fbbf24',
            cancelled: '#ef4444',
            active: '#3b82f6',
        };
        return colors[status] || colors.active;
    };

    return (
        <div className={`timeline timeline-${variant}`}>
            {items.map((item, index) => {
                const isExpanded = expandedItems.includes(item.id);
                const isLast = index === items.length - 1;

                return (
                    <div key={item.id} className="timeline-item">
                        <div className="timeline-marker">
                            <div
                                className="timeline-dot"
                                style={{ backgroundColor: getStatusColor(item.status) }}
                            >
                                {item.icon || (item.status === 'completed' ? '✓' : '•')}
                            </div>
                            {!isLast && <div className="timeline-line" />}
                        </div>

                        <div className="timeline-content">
                            <div className="timeline-header">
                                <div className="timeline-title">{item.title}</div>
                                <div className="timeline-date">{item.date}</div>
                            </div>

                            {item.description && (
                                <div className="timeline-description">{item.description}</div>
                            )}

                            {item.details && (
                                <>
                                    <button
                                        onClick={() => toggleItem(item.id)}
                                        className="timeline-toggle"
                                    >
                                        {isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                                    </button>

                                    {isExpanded && (
                                        <div className="timeline-details">{item.details}</div>
                                    )}
                                </>
                            )}

                            {item.user && (
                                <div className="timeline-user">
                                    <span className="user-avatar">{item.user.avatar || '👤'}</span>
                                    <span className="user-name">{item.user.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            <style jsx>{`
        .timeline {
          position: relative;
        }

        .timeline-item {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .timeline-item:last-child {
          margin-bottom: 0;
        }

        .timeline-marker {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .timeline-dot {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.125rem;
          flex-shrink: 0;
          z-index: 1;
        }

        .timeline-line {
          width: 2px;
          flex: 1;
          background: var(--border-color);
          margin-top: 0.5rem;
        }

        .timeline-content {
          flex: 1;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .timeline-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .timeline-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .timeline-date {
          font-size: 0.875rem;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .timeline-description {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .timeline-toggle {
          padding: 0.5rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .timeline-toggle:hover {
          background: var(--bg-tertiary);
        }

        .timeline-details {
          margin-top: 1rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 8px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .timeline-user {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .user-name {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        /* Compact variant */
        .timeline-compact .timeline-item {
          margin-bottom: 1rem;
        }

        .timeline-compact .timeline-dot {
          width: 24px;
          height: 24px;
          font-size: 0.75rem;
        }

        .timeline-compact .timeline-content {
          padding: 1rem;
        }

        @media (max-width: 768px) {
          .timeline-item {
            gap: 1rem;
          }

          .timeline-dot {
            width: 32px;
            height: 32px;
            font-size: 1rem;
          }

          .timeline-content {
            padding: 1rem;
          }

          .timeline-header {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
        </div>
    );
}
