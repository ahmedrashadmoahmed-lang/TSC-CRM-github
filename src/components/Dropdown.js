'use client';

import { useState, useRef, useEffect } from 'react';

export default function Dropdown({
    trigger,
    items = [],
    align = 'right', // left, right, center
    width = 'auto',
    className = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleItemClick = (item) => {
        if (item.onClick) {
            item.onClick();
        }
        if (!item.keepOpen) {
            setIsOpen(false);
        }
    };

    const alignClasses = {
        left: 'dropdown-left',
        right: 'dropdown-right',
        center: 'dropdown-center',
    };

    return (
        <div className={`dropdown ${className}`} ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)} className="dropdown-trigger">
                {trigger}
            </div>

            {isOpen && (
                <div className={`dropdown-menu ${alignClasses[align]}`} style={{ width }}>
                    {items.map((item, index) => {
                        if (item.divider) {
                            return <div key={index} className="dropdown-divider" />;
                        }

                        if (item.label) {
                            return (
                                <div key={index} className="dropdown-label">
                                    {item.label}
                                </div>
                            );
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleItemClick(item)}
                                disabled={item.disabled}
                                className={`dropdown-item ${item.danger ? 'dropdown-item-danger' : ''}`}
                            >
                                {item.icon && <span className="dropdown-item-icon">{item.icon}</span>}
                                <span className="dropdown-item-text">{item.text}</span>
                                {item.badge && (
                                    <span className="dropdown-item-badge">{item.badge}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            <style jsx>{`
        .dropdown {
          position: relative;
          display: inline-block;
        }

        .dropdown-trigger {
          cursor: pointer;
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: var(--shadow-lg);
          z-index: 100;
          min-width: 200px;
          max-width: 300px;
          overflow: hidden;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-right {
          right: 0;
        }

        .dropdown-left {
          left: 0;
        }

        .dropdown-center {
          left: 50%;
          transform: translateX(-50%);
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          text-align: right;
          cursor: pointer;
          transition: background 0.2s;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .dropdown-item:hover:not(:disabled) {
          background: var(--bg-secondary);
        }

        .dropdown-item:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .dropdown-item-danger {
          color: var(--error-color);
        }

        .dropdown-item-danger:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.1);
        }

        .dropdown-item-icon {
          font-size: 1.125rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dropdown-item-text {
          flex: 1;
        }

        .dropdown-item-badge {
          background: var(--primary-color);
          color: white;
          padding: 0.125rem 0.5rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border-color);
          margin: 0.5rem 0;
        }

        .dropdown-label {
          padding: 0.5rem 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @media (max-width: 768px) {
          .dropdown-menu {
            position: fixed;
            top: auto;
            bottom: 0;
            left: 0;
            right: 0;
            max-width: none;
            border-radius: 12px 12px 0 0;
          }

          .dropdown-right,
          .dropdown-left,
          .dropdown-center {
            left: 0;
            right: 0;
            transform: none;
          }
        }
      `}</style>
        </div>
    );
}
