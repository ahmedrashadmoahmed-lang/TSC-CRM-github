'use client';

import { useState } from 'react';
import { Calendar, DollarSign, Filter, X, Tag } from 'lucide-react';
import styles from './AdvancedFilters.module.css';

export default function AdvancedFilters({ onApply, onReset }) {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        valueMin: '',
        valueMax: '',
        priority: 'all',
        stage: 'all',
    });

    const handleApply = () => {
        onApply(filters);
        setIsOpen(false);
    };

    const handleReset = () => {
        const resetFilters = {
            dateFrom: '',
            dateTo: '',
            valueMin: '',
            valueMax: '',
            priority: 'all',
            stage: 'all',
        };
        setFilters(resetFilters);
        onReset();
        setIsOpen(false);
    };

    return (
        <div className={styles.container}>
            <button
                className={styles.trigger}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Filter size={18} />
                Advanced Filters
            </button>

            {isOpen && (
                <>
                    <div className={styles.overlay} onClick={() => setIsOpen(false)} />
                    <div className={styles.panel}>
                        <div className={styles.header}>
                            <h3>Advanced Filters</h3>
                            <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.content}>
                            {/* Date Range */}
                            <div className={styles.filterGroup}>
                                <label className={styles.label}>
                                    <Calendar size={16} />
                                    Date Range
                                </label>
                                <div className={styles.dateInputs}>
                                    <input
                                        type="date"
                                        className={styles.input}
                                        value={filters.dateFrom}
                                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                        placeholder="From"
                                    />
                                    <span>to</span>
                                    <input
                                        type="date"
                                        className={styles.input}
                                        value={filters.dateTo}
                                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                        placeholder="To"
                                    />
                                </div>
                            </div>

                            {/* Value Range */}
                            <div className={styles.filterGroup}>
                                <label className={styles.label}>
                                    <DollarSign size={16} />
                                    Deal Value (EGP)
                                </label>
                                <div className={styles.valueInputs}>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={filters.valueMin}
                                        onChange={(e) => setFilters({ ...filters, valueMin: e.target.value })}
                                        placeholder="Min"
                                    />
                                    <span>to</span>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={filters.valueMax}
                                        onChange={(e) => setFilters({ ...filters, valueMax: e.target.value })}
                                        placeholder="Max"
                                    />
                                </div>
                            </div>

                            {/* Priority */}
                            <div className={styles.filterGroup}>
                                <label className={styles.label}>
                                    <Tag size={16} />
                                    Priority
                                </label>
                                <select
                                    className={styles.select}
                                    value={filters.priority}
                                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                                >
                                    <option value="all">All Priorities</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>

                            {/* Stage */}
                            <div className={styles.filterGroup}>
                                <label className={styles.label}>
                                    <Filter size={16} />
                                    Stage
                                </label>
                                <select
                                    className={styles.select}
                                    value={filters.stage}
                                    onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
                                >
                                    <option value="all">All Stages</option>
                                    <option value="leads">Leads</option>
                                    <option value="quotes">Quotes</option>
                                    <option value="negotiations">Negotiations</option>
                                    <option value="won">Won</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <button className={styles.resetButton} onClick={handleReset}>
                                Reset
                            </button>
                            <button className={styles.applyButton} onClick={handleApply}>
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
