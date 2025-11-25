'use client';

import { useState } from 'react';

export default function Modal({
    isOpen = false,
    onClose,
    title,
    children,
    size = 'medium', // small, medium, large, full
    showCloseButton = true,
    closeOnOverlayClick = true,
    footer = null,
}) {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    const sizeClasses = {
        small: 'modal-small',
        medium: 'modal-medium',
        large: 'modal-large',
        full: 'modal-full',
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className={`modal-content ${sizeClasses[size]}`}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="modal-close"
                            aria-label="Close"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M18 6L6 18M6 6L18 18"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    )}
                </div>

                <div className="modal-body">{children}</div>

                {footer && <div className="modal-footer">{footer}</div>}
            </div>

            <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
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

        .modal-content {
          background: var(--card-bg);
          border-radius: 12px;
          box-shadow: var(--shadow-xl);
          max-height: 90vh;
          display: flex;
          flex-direction: column;
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

        .modal-small {
          width: 100%;
          max-width: 400px;
        }

        .modal-medium {
          width: 100%;
          max-width: 600px;
        }

        .modal-large {
          width: 100%;
          max-width: 900px;
        }

        .modal-full {
          width: 95vw;
          max-width: none;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        @media (max-width: 768px) {
          .modal-content {
            max-height: 95vh;
          }

          .modal-small,
          .modal-medium,
          .modal-large {
            width: 100%;
            max-width: none;
          }

          .modal-header,
          .modal-body,
          .modal-footer {
            padding: 1rem;
          }
        }
      `}</style>
        </div>
    );
}
