'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export default function Alert({
    type = 'info',
    title,
    message,
    onClose,
    autoClose = false,
    duration = 5000,
    actions = [],
}) {
    const [isVisible, setIsVisible] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleClose = useCallback(() => {
        setIsVisible(false);
        setTimeout(() => {
            onClose?.();
        }, 300);
    }, [onClose]);

    useEffect(() => {
        if (autoClose && isVisible) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [autoClose, duration, isVisible, handleClose]);

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
    };

    const colors = {
        success: {
            bg: 'rgba(34, 197, 94, 0.1)',
            border: '#22c55e',
            icon: '#22c55e',
            text: '#166534',
        },
        error: {
            bg: 'rgba(239, 68, 68, 0.1)',
            border: '#ef4444',
            icon: '#ef4444',
            text: '#991b1b',
        },
        warning: {
            bg: 'rgba(251, 191, 36, 0.1)',
            border: '#fbbf24',
            icon: '#fbbf24',
            text: '#92400e',
        },
        info: {
            bg: 'rgba(59, 130, 246, 0.1)',
            border: '#3b82f6',
            icon: '#3b82f6',
            text: '#1e40af',
        },
    };

    if (!mounted) return null;

    const alertContent = (
        <div className={`alert-overlay ${isVisible ? 'visible' : ''}`}>
            <div className={`alert-container ${isVisible ? 'visible' : ''}`}>
                <div className="alert-icon" style={{ color: colors[type].icon }}>
                    {icons[type]}
                </div>

                <div className="alert-content">
                    {title && <div className="alert-title">{title}</div>}
                    <div className="alert-message">{message}</div>

                    {actions.length > 0 && (
                        <div className="alert-actions">
                            {actions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        action.onClick?.();
                                        if (action.closeOnClick !== false) {
                                            handleClose();
                                        }
                                    }}
                                    className={`alert-action-btn ${action.primary ? 'primary' : ''}`}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button onClick={handleClose} className="alert-close">
                    ✕
                </button>
            </div>

            <style jsx>{`
        .alert-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          opacity: 0;
          transition: opacity 0.3s;
          padding: 1rem;
        }

        .alert-overlay.visible {
          opacity: 1;
        }

        .alert-container {
          background: ${colors[type].bg};
          border: 2px solid ${colors[type].border};
          border-radius: 12px;
          padding: 1.5rem;
          max-width: 500px;
          width: 100%;
          display: flex;
          gap: 1rem;
          position: relative;
          transform: scale(0.9);
          opacity: 0;
          transition: all 0.3s;
        }

        .alert-container.visible {
          transform: scale(1);
          opacity: 1;
        }

        .alert-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .alert-content {
          flex: 1;
        }

        .alert-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: ${colors[type].text};
          margin-bottom: 0.5rem;
        }

        .alert-message {
          color: ${colors[type].text};
          line-height: 1.5;
        }

        .alert-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .alert-action-btn {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: 1px solid ${colors[type].border};
          background: white;
          color: ${colors[type].text};
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .alert-action-btn:hover {
          background: ${colors[type].bg};
        }

        .alert-action-btn.primary {
          background: ${colors[type].border};
          color: white;
          border-color: ${colors[type].border};
        }

        .alert-action-btn.primary:hover {
          opacity: 0.9;
        }

        .alert-close {
          position: absolute;
          top: 1rem;
          left: 1rem;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: rgba(0, 0, 0, 0.1);
          color: ${colors[type].text};
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .alert-close:hover {
          background: rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 768px) {
          .alert-container {
            flex-direction: column;
            text-align: center;
          }

          .alert-icon {
            margin: 0 auto;
          }

          .alert-actions {
            flex-direction: column;
          }

          .alert-action-btn {
            width: 100%;
          }
        }
      `}</style>
        </div>
    );

    return createPortal(alertContent, document.body);
}
