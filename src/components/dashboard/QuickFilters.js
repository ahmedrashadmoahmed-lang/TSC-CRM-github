'use client';

import { Calendar, TrendingUp, Zap } from 'lucide-react';
import styles from './QuickFilters.module.css';

const FILTER_OPTIONS = [
    { id: 'today', label: 'اليوم', icon: Zap, days: 0 },
    { id: 'week', label: 'هذا الأسبوع', icon: Calendar, days: 7 },
    { id: 'month', label: 'هذا الشهر', icon: TrendingUp, days: 30 },
    { id: 'quarter', label: 'هذا الربع', icon: TrendingUp, days: 90 },
    { id: 'year', label: 'هذا العام', icon: TrendingUp, days: 365 }
];

export default function QuickFilters({ activeFilter, onFilterChange }) {
    return (
        <div className={styles.container}>
            <div className={styles.filters}>
                {FILTER_OPTIONS.map((filter) => {
                    const Icon = filter.icon;
                    return (
                        <button
                            key={filter.id}
                            className={`${styles.filterButton} ${activeFilter === filter.id ? styles.active : ''}`}
                            onClick={() => onFilterChange(filter.id, filter.days)}
                        >
                            <Icon size={16} />
                            <span>{filter.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
