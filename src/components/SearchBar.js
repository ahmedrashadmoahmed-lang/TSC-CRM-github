'use client';

import { useState } from 'react';

export default function SearchBar({
    placeholder = 'ابحث...',
    onSearch,
    debounceMs = 300,
    showFilters = false,
    filters = [],
    onFilterChange,
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});
    const [debounceTimer, setDebounceTimer] = useState(null);

    const handleSearch = (value) => {
        setSearchTerm(value);

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            onSearch?.(value, activeFilters);
        }, debounceMs);

        setDebounceTimer(timer);
    };

    const handleFilterChange = (filterKey, value) => {
        const newFilters = { ...activeFilters, [filterKey]: value };
        setActiveFilters(newFilters);
        onFilterChange?.(newFilters);
        onSearch?.(searchTerm, newFilters);
    };

    const clearFilters = () => {
        setActiveFilters({});
        onFilterChange?.({});
        onSearch?.(searchTerm, {});
    };

    const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

    return (
        <div className="search-bar">
            <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder={placeholder}
                    className="search-input"
                />
                {searchTerm && (
                    <button
                        onClick={() => handleSearch('')}
                        className="clear-btn"
                        aria-label="مسح"
                    >
                        ✕
                    </button>
                )}
                {showFilters && (
                    <button
                        onClick={() => setShowFilterPanel(!showFilterPanel)}
                        className="filter-btn"
                        aria-label="الفلاتر"
                    >
                        🎛️
                        {activeFilterCount > 0 && (
                            <span className="filter-badge">{activeFilterCount}</span>
                        )}
                    </button>
                )}
            </div>

            {showFilterPanel && showFilters && (
                <div className="filter-panel">
                    <div className="filter-header">
                        <h4>الفلاتر</h4>
                        {activeFilterCount > 0 && (
                            <button onClick={clearFilters} className="clear-filters-btn">
                                مسح الكل
                            </button>
                        )}
                    </div>

                    <div className="filters-grid">
                        {filters.map((filter) => (
                            <div key={filter.key} className="filter-item">
                                <label className="filter-label">{filter.label}</label>
                                {filter.type === 'select' && (
                                    <select
                                        value={activeFilters[filter.key] || ''}
                                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="">الكل</option>
                                        {filter.options.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {filter.type === 'date' && (
                                    <input
                                        type="date"
                                        value={activeFilters[filter.key] || ''}
                                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                        className="filter-input"
                                    />
                                )}
                                {filter.type === 'text' && (
                                    <input
                                        type="text"
                                        value={activeFilters[filter.key] || ''}
                                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                        placeholder={filter.placeholder}
                                        className="filter-input"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style jsx>{`
        .search-bar {
          width: 100%;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0 1rem;
          transition: all 0.2s;
        }

        .search-input-wrapper:focus-within {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px var(--primary-light);
        }

        .search-icon {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-left: 0.5rem;
        }

        .search-input {
          flex: 1;
          padding: 0.75rem 0;
          border: none;
          background: none;
          color: var(--text-primary);
          font-size: 1rem;
          outline: none;
        }

        .search-input::placeholder {
          color: var(--text-secondary);
        }

        .clear-btn,
        .filter-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: all 0.2s;
          position: relative;
        }

        .clear-btn:hover,
        .filter-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .filter-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: var(--primary-color);
          color: white;
          font-size: 0.625rem;
          font-weight: 700;
          padding: 0.125rem 0.375rem;
          border-radius: 999px;
          min-width: 16px;
          text-align: center;
        }

        .filter-panel {
          margin-top: 1rem;
          padding: 1.5rem;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
        }

        .filter-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .filter-header h4 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .clear-filters-btn {
          padding: 0.375rem 0.75rem;
          background: none;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-secondary);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-filters-btn:hover {
          background: var(--bg-secondary);
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .filter-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .filter-select,
        .filter-input {
          padding: 0.5rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
        }

        .filter-select:focus,
        .filter-input:focus {
          border-color: var(--primary-color);
        }

        @media (max-width: 768px) {
          .filters-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
