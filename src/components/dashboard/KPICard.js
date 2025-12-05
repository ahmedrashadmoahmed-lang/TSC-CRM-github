'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import SparklineChart from './SparklineChart';
import styles from './KPICard.module.css';

export const KPICard = ({
    title,
    value,
    trend,
    unit,
    icon,
    onClick,
    loading = false,
    status = 'normal',
    sparkline
}) => {
    const formatValue = (val) => {
        if (typeof val === 'number') {
            return val.toLocaleString();
        }
        return val;
    };

    const getTrendIcon = () => {
        if (trend === undefined || trend === 0) return null;
        return trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
    };

    const getTrendClass = () => {
        if (trend === undefined || trend === 0) return '';
        return trend > 0 ? styles.trendUp : styles.trendDown;
    };

    const getSparklineColor = () => {
        if (status === 'success') return '#28a745';
        if (status === 'warning') return '#ffc107';
        if (status === 'danger') return '#dc3545';
        return '#007bff';
    };

    return (
        <div
            className={`${styles.card} ${status !== 'normal' ? styles[status] : ''} ${onClick ? styles.clickable : ''}`}
            onClick={onClick}
        >
            {loading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner} />
                </div>
            )}

            <div className={styles.header}>
                {icon && <div className={styles.icon}>{icon}</div>}
                <h3 className={styles.title}>{title}</h3>
            </div>

            <div className={styles.content}>
                <div className={styles.value}>
                    {formatValue(value)}
                    {unit && <span className={styles.unit}>{unit}</span>}
                </div>

                {trend !== undefined && (
                    <div className={`${styles.trend} ${getTrendClass()}`}>
                        {getTrendIcon()}
                        <span>{Math.abs(trend).toFixed(1)}%</span>
                    </div>
                )}
            </div>

            {sparkline && sparkline.length > 0 && (
                <div className={styles.sparklineContainer}>
                    <SparklineChart
                        data={sparkline}
                        color={getSparklineColor()}
                        height={30}
                        width={120}
                    />
                </div>
            )}
        </div>
    );
};

export default KPICard;
