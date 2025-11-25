'use client';

import { useState } from 'react';

export default function Card({
    children,
    title,
    subtitle,
    footer,
    actions,
    hoverable = false,
    bordered = true,
    padding = 'normal',
    onClick,
}) {
    const [isHovered, setIsHovered] = useState(false);

    const paddingSizes = {
        none: '0',
        small: '1rem',
        normal: '1.5rem',
        large: '2rem',
    };

    return (
        <div
            className={`card ${hoverable ? 'hoverable' : ''} ${bordered ? 'bordered' : ''}`}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {(title || subtitle || actions) && (
                <div className="card-header">
                    <div className="card-title-section">
                        {title && <h3 className="card-title">{title}</h3>}
                        {subtitle && <p className="card-subtitle">{subtitle}</p>}
                    </div>
                    {actions && <div className="card-actions">{actions}</div>}
                </div>
            )}

            <div className="card-body">{children}</div>

            {footer && <div className="card-footer">{footer}</div>}

            <style jsx>{`
        .card {
          background: var(--card-bg);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .card.bordered {
          border: 1px solid var(--border-color);
        }

        .card.hoverable {
          cursor: pointer;
        }

        .card.hoverable:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .card-header {
          padding: ${paddingSizes[padding]};
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }

        .card-title-section {
          flex: 1;
        }

        .card-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }

        .card-subtitle {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .card-actions {
          display: flex;
          gap: 0.5rem;
        }

        .card-body {
          padding: ${paddingSizes[padding]};
        }

        .card-footer {
          padding: ${paddingSizes[padding]};
          border-top: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }

        @media (max-width: 768px) {
          .card-header {
            flex-direction: column;
          }

          .card-actions {
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
}
