'use client';

import { useState } from 'react';
import { exportToPDF, exportToExcel } from '@/utils/exporters';

export default function ExportButton({
    data,
    filename = 'export',
    type = 'both', // 'pdf', 'excel', 'both'
    columns = [],
    title = '',
    disabled = false,
}) {
    const [exporting, setExporting] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const handleExport = async (format) => {
        try {
            setExporting(true);
            setShowMenu(false);

            if (format === 'pdf') {
                await exportToPDF(data, columns, title, filename);
            } else if (format === 'excel') {
                await exportToExcel(data, columns, title, filename);
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('حدث خطأ أثناء التصدير');
        } finally {
            setExporting(false);
        }
    };

    if (type === 'pdf') {
        return (
            <button
                onClick={() => handleExport('pdf')}
                disabled={disabled || exporting}
                className="export-btn"
            >
                {exporting ? '⏳ جاري التصدير...' : '📄 تصدير PDF'}
            </button>
        );
    }

    if (type === 'excel') {
        return (
            <button
                onClick={() => handleExport('excel')}
                disabled={disabled || exporting}
                className="export-btn"
            >
                {exporting ? '⏳ جاري التصدير...' : '📊 تصدير Excel'}
            </button>
        );
    }

    return (
        <div className="export-dropdown">
            <button
                onClick={() => setShowMenu(!showMenu)}
                disabled={disabled || exporting}
                className="export-btn"
            >
                {exporting ? '⏳ جاري التصدير...' : '⬇️ تصدير'}
            </button>

            {showMenu && (
                <>
                    <div className="export-overlay" onClick={() => setShowMenu(false)} />
                    <div className="export-menu">
                        <button
                            onClick={() => handleExport('pdf')}
                            className="export-menu-item"
                        >
                            📄 تصدير PDF
                        </button>
                        <button
                            onClick={() => handleExport('excel')}
                            className="export-menu-item"
                        >
                            📊 تصدير Excel
                        </button>
                    </div>
                </>
            )}

            <style jsx>{`
        .export-dropdown {
          position: relative;
        }

        .export-btn {
          padding: 0.5rem 1rem;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .export-btn:hover:not(:disabled) {
          background: var(--primary-hover);
          transform: translateY(-2px);
        }

        .export-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .export-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 999;
        }

        .export-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: var(--shadow-lg);
          z-index: 1000;
          min-width: 150px;
          overflow: hidden;
        }

        .export-menu-item {
          width: 100%;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          color: var(--text-primary);
          text-align: right;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .export-menu-item:hover {
          background: var(--bg-secondary);
        }

        .export-menu-item:not(:last-child) {
          border-bottom: 1px solid var(--border-color);
        }
      `}</style>
        </div>
    );
}
