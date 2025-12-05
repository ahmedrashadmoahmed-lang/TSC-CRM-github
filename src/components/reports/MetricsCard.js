'use client';

import styles from './MetricsCard.module.css';

/**
 * Reusable Metrics Card Component
 * @param {Object} props
 * @param {string} props.title - Metric title
 * @param {string|number} props.value - Main value to display
 * @param {string} props.subtitle - Optional subtitle
 * @param {number} props.change - Percentage change (positive or negative)
 * @param {string} props.changeLabel - Label for change (e.g., "vs last month")
 * @param {string} props.icon - Optional emoji icon
 * @param {string} props.color - Color theme: 'primary', 'success', 'warning', 'danger'
 */
export default function MetricsCard({
    title,
    value,
    subtitle,
    change,
    changeLabel = 'vs previous period',
    icon,
    color = 'primary',
}) {
    const isPositive = change > 0;
    const isNegative = change < 0;

    const formatValue = (val) => {
        if (typeof val === 'number') {
            return val.toLocaleString();
        }
        return val;
    };

    return (
        <div className={`${styles.card} ${styles[color]}`}>
            <div className={styles.header}>
                {icon && <span className={styles.icon}>{icon}</span>}
                <h3 className={styles.title}>{title}</h3>
            </div>

            <div className={styles.value}>{formatValue(value)}</div>

            {subtitle && <div className={styles.subtitle}>{subtitle}</div>}

            {change !== undefined && change !== null && (
                <div className={styles.changeContainer}>
                    <span className={`${styles.change} ${isPositive ? styles.positive : isNegative ? styles.negative : styles.neutral}`}>
                        {isPositive && '↑ '}
                        {isNegative && '↓ '}
                        {Math.abs(change).toFixed(1)}%
                    </span>
                    <span className={styles.changeLabel}>{changeLabel}</span>
                </div>
            )}
        </div>
    );
}
