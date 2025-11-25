'use client';

import { useState } from 'react';

export default function Pagination({
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    showFirstLast = true,
    maxVisible = 5,
}) {
    const getPageNumbers = () => {
        const pages = [];
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className="pagination">
            {/* First Page */}
            {showFirstLast && currentPage > 1 && (
                <button
                    onClick={() => onPageChange(1)}
                    className="pagination-btn"
                    aria-label="الصفحة الأولى"
                >
                    ««
                </button>
            )}

            {/* Previous Page */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
                aria-label="السابق"
            >
                ‹
            </button>

            {/* Page Numbers */}
            {pages[0] > 1 && (
                <>
                    <button onClick={() => onPageChange(1)} className="pagination-btn">
                        1
                    </button>
                    {pages[0] > 2 && <span className="pagination-ellipsis">...</span>}
                </>
            )}

            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                >
                    {page}
                </button>
            ))}

            {pages[pages.length - 1] < totalPages && (
                <>
                    {pages[pages.length - 1] < totalPages - 1 && (
                        <span className="pagination-ellipsis">...</span>
                    )}
                    <button
                        onClick={() => onPageChange(totalPages)}
                        className="pagination-btn"
                    >
                        {totalPages}
                    </button>
                </>
            )}

            {/* Next Page */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
                aria-label="التالي"
            >
                ›
            </button>

            {/* Last Page */}
            {showFirstLast && currentPage < totalPages && (
                <button
                    onClick={() => onPageChange(totalPages)}
                    className="pagination-btn"
                    aria-label="الصفحة الأخيرة"
                >
                    »»
                </button>
            )}

            <style jsx>{`
        .pagination {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .pagination-btn {
          min-width: 40px;
          height: 40px;
          padding: 0 0.75rem;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pagination-btn:hover:not(:disabled):not(.active) {
          background: var(--bg-secondary);
          border-color: var(--primary-color);
        }

        .pagination-btn.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-ellipsis {
          padding: 0 0.5rem;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .pagination-btn {
            min-width: 36px;
            height: 36px;
            font-size: 0.875rem;
          }
        }
      `}</style>
        </div>
    );
}
