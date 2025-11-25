'use client';

import { useState, useEffect } from 'react';

export default function NotificationCenter({ notifications = [], onMarkAsRead, onClear }) {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const count = notifications.filter((n) => !n.read).length;
        setUnreadCount(count);
    }, [notifications]);

    const getIcon = (type) => {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ',
            system: '⚙',
        };
        return icons[type] || icons.info;
    };

    const getColor = (type) => {
        const colors = {
            success: '#22c55e',
            error: '#ef4444',
            warning: '#fbbf24',
            info: '#3b82f6',
            system: '#8b5cf6',
        };
        return colors[type] || colors.info;
    };

    const formatTime = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        if (hours < 24) return `منذ ${hours} ساعة`;
        return `منذ ${days} يوم`;
    };

    return (
        <div className="notification-center">
            <button
                className="notification-trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="الإشعارات"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="notification-overlay" onClick={() => setIsOpen(false)} />
                    <div className="notification-panel">
                        <div className="notification-header">
                            <h3>الإشعارات</h3>
                            {notifications.length > 0 && (
                                <button onClick={onClear} className="clear-btn">
                                    مسح الكل
                                </button>
                            )}
                        </div>

                        <div className="notification-list">
                            {notifications.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">🔔</div>
                                    <p>لا توجد إشعارات</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                                        onClick={() => onMarkAsRead?.(notification.id)}
                                    >
                                        <div
                                            className="notification-icon"
                                            style={{ color: getColor(notification.type) }}
                                        >
                                            {getIcon(notification.type)}
                                        </div>

                                        <div className="notification-content">
                                            <div className="notification-title">
                                                {notification.title}
                                            </div>
                                            <div className="notification-message">
                                                {notification.message}
                                            </div>
                                            <div className="notification-time">
                                                {formatTime(notification.createdAt)}
                                            </div>
                                        </div>

                                        {!notification.read && (
                                            <div className="unread-indicator" />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}

            <style jsx>{`
        .notification-center {
          position: relative;
        }

        .notification-trigger {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 1.25rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notification-trigger:hover {
          background: var(--bg-tertiary);
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.125rem 0.375rem;
          border-radius: 999px;
          min-width: 20px;
          text-align: center;
        }

        .notification-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 999;
        }

        .notification-panel {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 50%;
          transform: translateX(-50%);
          width: 400px;
          max-height: 600px;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          box-shadow: var(--shadow-lg);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          animation: slideDown 0.2s;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .notification-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .notification-header h3 {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .clear-btn {
          padding: 0.375rem 0.75rem;
          background: none;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-secondary);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-btn:hover {
          background: var(--bg-secondary);
        }

        .notification-list {
          overflow-y: auto;
          max-height: 500px;
        }

        .notification-item {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .notification-item:hover {
          background: var(--bg-secondary);
        }

        .notification-item.unread {
          background: rgba(59, 130, 246, 0.05);
        }

        .notification-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .notification-content {
          flex: 1;
        }

        .notification-title {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .notification-message {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }

        .notification-time {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        .unread-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #3b82f6;
          position: absolute;
          top: 1.5rem;
          left: 1rem;
        }

        .empty-state {
          padding: 3rem 1.5rem;
          text-align: center;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.3;
        }

        .empty-state p {
          color: var(--text-secondary);
          margin: 0;
        }

        @media (max-width: 768px) {
          .notification-panel {
            position: fixed;
            top: auto;
            bottom: 0;
            left: 0;
            right: 0;
            transform: none;
            width: 100%;
            max-height: 80vh;
            border-radius: 12px 12px 0 0;
          }

          @keyframes slideDown {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
        }
      `}</style>
        </div>
    );
}
