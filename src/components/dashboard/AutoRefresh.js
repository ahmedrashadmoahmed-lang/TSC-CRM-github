'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Clock, Check } from 'lucide-react';
import styles from './AutoRefresh.module.css';

export default function AutoRefresh({ onRefresh, intervals = [30, 60, 300], defaultInterval = 60 }) {
    const [isEnabled, setIsEnabled] = useState(false);
    const [interval, setInterval] = useState(defaultInterval);
    const [countdown, setCountdown] = useState(interval);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    useEffect(() => {
        if (!isEnabled) return;

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    handleRefresh();
                    return interval;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isEnabled, interval]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await onRefresh();
            setLastRefresh(new Date());
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleManualRefresh = () => {
        handleRefresh();
        setCountdown(interval);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatLastRefresh = () => {
        const seconds = Math.floor((new Date() - lastRefresh) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    };

    return (
        <div className={styles.container}>
            <button
                className={`${styles.refreshButton} ${isRefreshing ? styles.refreshing : ''}`}
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                title="Refresh now"
            >
                <RefreshCw size={18} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>

            <div className={styles.autoRefreshSection}>
                <label className={styles.toggle}>
                    <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => setIsEnabled(e.target.checked)}
                    />
                    <span className={styles.toggleSlider}></span>
                </label>
                <span className={styles.label}>Auto-refresh</span>
            </div>

            {isEnabled && (
                <div className={styles.intervalSelector}>
                    <Clock size={14} />
                    <select
                        value={interval}
                        onChange={(e) => {
                            const newInterval = parseInt(e.target.value);
                            setInterval(newInterval);
                            setCountdown(newInterval);
                        }}
                        className={styles.select}
                    >
                        {intervals.map(int => (
                            <option key={int} value={int}>
                                {int < 60 ? `${int}s` : `${int / 60}m`}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className={styles.status}>
                {isEnabled ? (
                    <span className={styles.countdown}>
                        Next: {formatTime(countdown)}
                    </span>
                ) : (
                    <span className={styles.lastUpdate}>
                        <Check size={12} />
                        {formatLastRefresh()}
                    </span>
                )}
            </div>
        </div>
    );
}
