'use client';

import { TrendingUp, Target as TargetIcon } from 'lucide-react';
import styles from './PerformanceIndicator.module.css';

export default function PerformanceIndicator({
    title,
    current,
    target,
    unit = '',
    icon: Icon
}) {
    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    const isOnTrack = percentage >= 70;
    const isExceeded = percentage >= 100;

    const getStatusClass = () => {
        if (isExceeded) return styles.exceeded;
        if (isOnTrack) return styles.onTrack;
        return styles.behind;
    };

    const getStatusText = () => {
        if (isExceeded) return 'تم تجاوز الهدف';
        if (isOnTrack) return 'على المسار الصحيح';
        return 'أقل من المتوقع';
    };

    return (
        <div className={`${styles.card} ${getStatusClass()}`}>
            <div className={styles.header}>
                <div className={styles.iconContainer}>
                    {Icon && <Icon size={20} />}
                </div>
                <div className={styles.titleSection}>
                    <h4 className={styles.title}>{title}</h4>
                    <span className={styles.status}>{getStatusText()}</span>
                </div>
            </div>

            <div className={styles.values}>
                <div className={styles.currentValue}>
                    <span className={styles.value}>{current.toLocaleString('ar-EG')}</span>
                    <span className={styles.unit}>{unit}</span>
                </div>
                <div className={styles.targetValue}>
                    الهدف: {target.toLocaleString('ar-EG')} {unit}
                </div>
            </div>

            <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <span className={styles.percentage}>{Math.round(percentage)}%</span>
            </div>
        </div>
    );
}
