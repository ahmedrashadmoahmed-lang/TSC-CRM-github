'use client';

import { useState } from 'react';

export default function DataTable({
    columns = [],
    data = [],
    loading = false,
    pagination = true,
    pageSize = 10,
    onRowClick = null,
    sortable = true,
    searchable = true,
    actions = null,
    emptyMessage = 'لا توجد بيانات',
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [searchTerm, setSearchTerm] = useState('');

    // Filter data based on search
    const filteredData = searchTerm
        ? data.filter((row) =>
            columns.some((col) => {
                const value = row[col.key];
                return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
            })
        )
        : data;

    // Sort data
    const sortedData = sortConfig.key
        ? [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        })
        : filteredData;

    // Paginate data
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = pagination
        ? sortedData.slice(startIndex, startIndex + pageSize)
        : sortedData;

    const handleSort = (key) => {
        if (!sortable) return;

        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handlePageChange = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    return (
        <div className="data-table">
            {searchable && (
                <div className="table-header">
                    <input
                        type="text"
                        placeholder="بحث..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="search-input"
                    />
                </div>
            )}

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    onClick={() => handleSort(column.key)}
                                    className={sortable ? 'sortable' : ''}
                                    style={{ width: column.width }}
                                >
                                    <div className="th-content">
                                        <span>{column.label}</span>
                                        {sortable && sortConfig.key === column.key && (
                                            <span className="sort-icon">
                                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions && <th style={{ width: '100px' }}>إجراءات</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="loading-cell">
                                    <div className="loading-spinner" />
                                    جاري التحميل...
                                </td>
                            </tr>
                        ) : paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="empty-cell">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, index) => (
                                <tr
                                    key={index}
                                    onClick={() => onRowClick?.(row)}
                                    className={onRowClick ? 'clickable' : ''}
                                >
                                    {columns.map((column) => (
                                        <td key={column.key}>
                                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="actions-cell">
                                            {actions(row)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        السابق
                    </button>

                    <div className="pagination-info">
                        صفحة {currentPage} من {totalPages}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        التالي
                    </button>
                </div>
            )}

            <style jsx>{`
        .data-table {
          background: var(--card-bg);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .table-header {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .search-input {
          width: 100%;
          max-width: 300px;
          padding: 0.5rem 1rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary-color);
        }

        .table-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: var(--bg-secondary);
        }

        th {
          padding: 1rem;
          text-align: right;
          font-weight: 600;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-color);
          white-space: nowrap;
        }

        th.sortable {
          cursor: pointer;
          user-select: none;
        }

        th.sortable:hover {
          background: var(--bg-tertiary);
        }

        .th-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: space-between;
        }

        .sort-icon {
          color: var(--primary-color);
          font-size: 1rem;
        }

        td {
          padding: 1rem;
          text-align: right;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border-color);
        }

        tbody tr:last-child td {
          border-bottom: none;
        }

        tbody tr.clickable {
          cursor: pointer;
          transition: background 0.2s;
        }

        tbody tr.clickable:hover {
          background: var(--bg-secondary);
        }

        .loading-cell,
        .empty-cell {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-secondary);
        }

        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid var(--border-color);
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-left: 0.5rem;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .actions-cell {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .pagination-btn {
          padding: 0.5rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }

        .pagination-btn:hover:not(:disabled) {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          th,
          td {
            padding: 0.75rem 0.5rem;
            font-size: 0.875rem;
          }
        }
      `}</style>
        </div>
    );
}
