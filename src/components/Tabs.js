'use client';

import { useState } from 'react';

export default function Tabs({
    tabs = [],
    defaultTab = 0,
    onChange = null,
    variant = 'default', // default, pills, underline
    className = '',
}) {
    const [activeTab, setActiveTab] = useState(defaultTab);

    const handleTabChange = (index) => {
        setActiveTab(index);
        if (onChange) {
            onChange(index);
        }
    };

    const variantClasses = {
        default: 'tabs-default',
        pills: 'tabs-pills',
        underline: 'tabs-underline',
    };

    return (
        <div className={`tabs ${className}`}>
            <div className={`tabs-header ${variantClasses[variant]}`}>
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        onClick={() => handleTabChange(index)}
                        className={`tab-button ${activeTab === index ? 'active' : ''}`}
                        disabled={tab.disabled}
                    >
                        {tab.icon && <span className="tab-icon">{tab.icon}</span>}
                        <span className="tab-label">{tab.label}</span>
                        {tab.badge && <span className="tab-badge">{tab.badge}</span>}
                    </button>
                ))}
            </div>

            <div className="tabs-content">
                {tabs[activeTab]?.content}
            </div>

            <style jsx>{`
        .tabs {
          display: flex;
          flex-direction: column;
        }

        .tabs-header {
          display: flex;
          gap: 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .tabs-default .tab-button {
          padding: 0.75rem 1.5rem;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .tabs-default .tab-button:hover:not(:disabled) {
          color: var(--text-primary);
        }

        .tabs-default .tab-button.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }

        .tabs-pills {
          border-bottom: none;
          gap: 0.5rem;
          padding: 0.5rem;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .tabs-pills .tab-button {
          padding: 0.5rem 1rem;
          background: none;
          border: none;
          border-radius: 6px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .tabs-pills .tab-button:hover:not(:disabled) {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .tabs-pills .tab-button.active {
          background: var(--primary-color);
          color: white;
        }

        .tabs-underline {
          border-bottom: 2px solid var(--border-color);
        }

        .tabs-underline .tab-button {
          padding: 0.75rem 1.5rem;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
        }

        .tabs-underline .tab-button::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--primary-color);
          transform: scaleX(0);
          transition: transform 0.2s;
        }

        .tabs-underline .tab-button.active::after {
          transform: scaleX(1);
        }

        .tabs-underline .tab-button.active {
          color: var(--primary-color);
        }

        .tab-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tab-icon {
          font-size: 1.125rem;
        }

        .tab-label {
          white-space: nowrap;
        }

        .tab-badge {
          background: var(--primary-color);
          color: white;
          padding: 0.125rem 0.5rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .tabs-pills .tab-button.active .tab-badge {
          background: white;
          color: var(--primary-color);
        }

        .tabs-content {
          padding: 1.5rem 0;
        }

        @media (max-width: 768px) {
          .tabs-header {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .tab-button {
            flex-shrink: 0;
          }
        }
      `}</style>
        </div>
    );
}
