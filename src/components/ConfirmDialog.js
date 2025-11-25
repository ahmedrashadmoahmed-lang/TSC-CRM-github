'use client';

import { useState } from 'react';

export default function ConfirmDialog({
    isOpen = false,
    onClose,
    onConfirm,
    title = 'تأكيد',
    message = 'هل أنت متأكد من هذا الإجراء؟',
    confirmLabel = 'تأكيد',
    cancelLabel = 'إلغاء',
    variant = 'danger', // danger, warning, info
    loading = false,
}) {
    if (!isOpen) return null;

    const handleConfirm = async () => {
        await onConfirm();
        onClose();
    };

    const variantConfig = {
        danger: {
            icon: '⚠️',
            color: 'var(--error-color)',
            bgColor: 'rgba(239, 68, 68, 0.1)',
        },
        warning: {
            icon: '⚡',
            color: '#fbbf24',
            bgColor: 'rgba(251, 191, 36, 0.1)',
        },
        info: {
            icon: 'ℹ️',
            color: '#3b82f6',
            bgColor: 'rgba(59, 130, 246, 0.1)',
        },
    };

    const config = variantConfig[variant];

    return (
        <div className="confirm-overlay" onClick={onClose}>
            <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-icon" style={{ backgroundColor: config.bgColor }}>
                    <span style={{ color: config.color }}>{config.icon}</span>
                </div>

                <h3 className="confirm-title">{title}</h3>
                <p className="confirm-message">{message}</p>

                <div className="confirm-actions">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="btn btn-secondary"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="btn btn-danger"
                        style={{ backgroundColor: config.color }}
                    >
                        {loading ? 'جاري التنفيذ...' : confirmLabel}
                    </button>
                </div>
            </div>

            <style jsx>{`
        .confirm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1001;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .confirm-dialog {
          background: var(--card-bg);
          border-radius: 12px;
          box-shadow: var(--shadow-xl);
          padding: 2rem;
          max-width: 400px;
          width: 90%;
          text-align: center;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .confirm-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 2rem;
        }

        .confirm-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.75rem;
        }

        .confirm-message {
          color: var(--text-secondary);
          margin: 0 0 2rem;
          line-height: 1.6;
        }

        .confirm-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-size: 0.875rem;
          min-width: 100px;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--bg-tertiary);
        }

        .btn-danger {
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .confirm-dialog {
            padding: 1.5rem;
          }

          .confirm-actions {
            flex-direction: column-reverse;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
}
