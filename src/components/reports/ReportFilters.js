'use client';

import { useState } from 'react';
import styles from './ReportFilters.module.css';

/**
 * Report Filters Component
 * @param {Object} props
 * @param {Function} props.onDateRangeChange - Callback when date range changes
 * @param {Function} props.onExport - Callback when export button is clicked
 * @param {Function} props.onRefresh - Callback when refresh button is clicked
 * @param {boolean} props.loading - Loading state
 */
export default function ReportFilters({
    onDateRangeChange,
    onExport,
    onRefresh,
    loading = false,
}) {
    const [selectedRange, setSelectedRange] = useState('30d');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [showCustom, setShowCustom] = useState(false);

    const quickRanges = [
        { value: '7d', label: 'Last 7 Days' },
        { value: '30d', label: 'Last 30 Days' },
        { value: '90d', label: 'Last 90 Days' },
        { value: '1y', label: 'Last Year' },
        { value: 'custom', label: 'Custom Range' },
    ];

    const handleRangeChange = (range) => {
        setSelectedRange(range);

        if (range === 'custom') {
            setShowCustom(true);
            return;
        }

        setShowCustom(false);

        const now = new Date();
        let startDate = new Date();

        switch (range) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
        }

        onDateRangeChange?.({ startDate, endDate: now });
    };

    const handleCustomApply = () => {
        if (customStart && customEnd) {
            onDateRangeChange?.({
                startDate: new Date(customStart),
                endDate: new Date(customEnd),
            });
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.rangeButtons}>
                {quickRanges.map((range) => (
                    <button
                        key={range.value}
                        className={`${styles.rangeButton} ${selectedRange === range.value ? styles.active : ''}`}
                        onClick={() => handleRangeChange(range.value)}
                        disabled={loading}
                    >
                        {range.label}
                    </button>
                ))}
            </div>

            {showCustom && (
                <div className={styles.customRange}>
                    <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className={styles.dateInput}
                        disabled={loading}
                    />
                    <span className={styles.dateSeparator}>to</span>
                    <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className={styles.dateInput}
                        disabled={loading}
                    />
                    <button
                        className={styles.applyButton}
                        onClick={handleCustomApply}
                        disabled={loading || !customStart || !customEnd}
                    >
                        Apply
                    </button>
                </div>
            )}

            <div className={styles.actions}>
                <button
                    className={styles.actionButton}
                    onClick={onRefresh}
                    disabled={loading}
                    title="Refresh data"
                >
                    🔄 Refresh
                </button>
                <button
                    className={styles.actionButton}
                    onClick={() => onExport?.('pdf')}
                    disabled={loading}
                    title="Export as PDF"
                >
                    📄 Export PDF
                </button>
                <button
                    className={styles.actionButton}
                    onClick={() => onExport?.('excel')}
                    disabled={loading}
                    title="Export as Excel"
                >
                    📊 Export Excel
                </button>
            </div>
        </div>
    );
}
