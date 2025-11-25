'use client';

export default function Accordion({
    items = [],
    allowMultiple = false,
    defaultOpen = [],
}) {
    const [openItems, setOpenItems] = React.useState(defaultOpen);

    const toggleItem = (index) => {
        if (allowMultiple) {
            setOpenItems((prev) =>
                prev.includes(index)
                    ? prev.filter((i) => i !== index)
                    : [...prev, index]
            );
        } else {
            setOpenItems((prev) => (prev.includes(index) ? [] : [index]));
        }
    };

    return (
        <div className="accordion">
            {items.map((item, index) => {
                const isOpen = openItems.includes(index);

                return (
                    <div key={index} className={`accordion-item ${isOpen ? 'open' : ''}`}>
                        <button
                            className="accordion-header"
                            onClick={() => toggleItem(index)}
                            aria-expanded={isOpen}
                        >
                            <span className="accordion-title">
                                {item.icon && <span className="accordion-icon">{item.icon}</span>}
                                {item.title}
                            </span>
                            <span className={`accordion-chevron ${isOpen ? 'rotate' : ''}`}>
                                ▼
                            </span>
                        </button>

                        <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
                            <div className="accordion-body">{item.content}</div>
                        </div>
                    </div>
                );
            })}

            <style jsx>{`
        .accordion {
          border: 1px solid var(--border-color);
          border-radius: 12px;
          overflow: hidden;
        }

        .accordion-item {
          border-bottom: 1px solid var(--border-color);
        }

        .accordion-item:last-child {
          border-bottom: none;
        }

        .accordion-header {
          width: 100%;
          padding: 1rem 1.5rem;
          background: var(--card-bg);
          border: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.2s;
          text-align: right;
        }

        .accordion-header:hover {
          background: var(--bg-secondary);
        }

        .accordion-item.open .accordion-header {
          background: var(--bg-secondary);
        }

        .accordion-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .accordion-icon {
          font-size: 1.25rem;
        }

        .accordion-chevron {
          color: var(--text-secondary);
          transition: transform 0.3s;
          font-size: 0.75rem;
        }

        .accordion-chevron.rotate {
          transform: rotate(180deg);
        }

        .accordion-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-out;
        }

        .accordion-content.open {
          max-height: 1000px;
          transition: max-height 0.5s ease-in;
        }

        .accordion-body {
          padding: 1rem 1.5rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .accordion-header {
            padding: 0.875rem 1rem;
          }

          .accordion-body {
            padding: 0.875rem 1rem;
          }

          .accordion-title {
            font-size: 0.875rem;
          }
        }
      `}</style>
        </div>
    );
}

// Add React import
import React from 'react';
