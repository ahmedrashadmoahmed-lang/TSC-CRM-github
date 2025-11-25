'use client';

import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from 'lucide-react';
import styles from './EnhancedKPICard.module.css';

export default function EnhancedKPICard({
    title,
    value,
    icon: Icon,
    trend,
    comparison,
    target,
    loading = false
}) {
    // Calculate trend percentage
    const trendPercentage = comparison?.percentage || 0;
    const trendDirection = trendPercentage > 0 ? 'up' : trendPercentage < 0 ? 'down' : 'neutral';
    const trendLabel = comparison?.label || 'vs last month';

    // Calculate target progress
    const targetProgress = target ? (value / target * 100).toFixed(0) : null;
    const isTargetMet = targetProgress >= 100;

    const TrendIcon = trendDirection === 'up' ? TrendingUp :
        trendDirection === 'down' ? TrendingDown : Minus;

    if (loading) {
        return (
            <div className={styles.card}>
                <div className={styles.skeleton}>
                    <div className={styles.skeletonIcon}></div>
                    <div className={styles.skeletonContent}>
                        <div className={styles.skeletonTitle}></div>
                        <div className={styles.skeletonValue}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.iconWrapper}>
                    <Icon size={24} />
                </div>
                <div className={styles.content}>
                    <p className={styles.title}>{title}</p>
                    <h3 className={styles.value}>{value}</h3>
                </div>
            </div>

            {/* Trend Comparison */}
            {comparison && (
                <div className={`${styles.trend} ${styles[trendDirection]}`}>
                    <TrendIcon size={16} />
                    <span className={styles.trendValue}>
                        {Math.abs(trendPercentage)}%
                    </span>
                    <span className={styles.trendLabel}>{trendLabel}</span>
                </div>
            )}

            {/* Target Progress */}
            {target && (
                <div className={styles.targetSection}>
                    <div className={styles.targetHeader}>
                        <span className={styles.targetLabel}>Target: {target}</span>
                        <span className={`${styles.targetProgress} ${isTargetMet ? styles.targetMet : ''}`}>
                            {targetProgress}%
                        </span>
                    </div>
                    <div className={styles.progressBar}>
                        <div
                            className={`${styles.progressFill} ${isTargetMet ? styles.progressComplete : ''}`}
                            style={{ width: `${Math.min(targetProgress, 100)}%` }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    );
}
